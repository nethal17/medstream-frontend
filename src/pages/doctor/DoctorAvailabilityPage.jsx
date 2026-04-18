import { CalendarClock, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage, formatConsultationType, formatTimeLabel } from "@/lib/appointment-utils";
import {
  createMyDoctorAvailability,
  deleteMyDoctorAvailability,
  getDoctorMe,
  getMyDoctorAvailability,
  updateMyDoctorAvailability,
} from "@/services/doctors";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultForm = {
  clinic_id: "",
  day_of_week: "Monday",
  date: "",
  start_time: "09:00",
  end_time: "13:00",
  slot_duration: "30",
  consultation_type: "physical",
};

function toFormState(item) {
  return {
    clinic_id: item?.clinic_id || "",
    day_of_week: item?.day_of_week ? `${String(item.day_of_week).charAt(0).toUpperCase()}${String(item.day_of_week).slice(1)}` : "Monday",
    date: item?.date || "",
    start_time: item?.start_time?.slice(0, 5) || "09:00",
    end_time: item?.end_time?.slice(0, 5) || "13:00",
    slot_duration: String(item?.slot_duration || 30),
    consultation_type: item?.consultation_type || "physical",
  };
}

function normalizeDayForApi(value) {
  return value ? String(value).trim().toLowerCase() : null;
}

function buildAvailabilityPayload(form) {
  const hasDate = Boolean(form.date);

  return {
    clinic_id: form.clinic_id,
    ...(hasDate ? { date: form.date } : { day_of_week: normalizeDayForApi(form.day_of_week) }),
    start_time: form.start_time,
    end_time: form.end_time,
    slot_duration: Number(form.slot_duration) || 30,
    consultation_type: form.consultation_type || null,
  };
}

export default function DoctorAvailabilityPage() {
  const [clinics, setClinics] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAvailabilityData() {
      setIsLoading(true);
      setError("");

      try {
        const [profilePayload, availabilityPayload] = await Promise.all([
          getDoctorMe(),
          getMyDoctorAvailability(),
        ]);

        if (ignore) {
          return;
        }

        const nextClinics = Array.isArray(profilePayload?.clinics)
          ? profilePayload.clinics.map((item) => item?.clinic).filter(Boolean)
          : [];
        const nextAvailability = Array.isArray(availabilityPayload?.results) ? availabilityPayload.results : [];
        const fallbackClinicId = nextClinics[0]?.clinic_id || "";

        setClinics(nextClinics);
        setAvailability(nextAvailability);
        setSelectedClinicId((prev) => prev || fallbackClinicId);
        setForm((prev) => ({
          ...prev,
          clinic_id: prev.clinic_id || fallbackClinicId,
        }));
      } catch (requestError) {
        if (ignore) {
          return;
        }

        setClinics([]);
        setAvailability([]);
        setError(extractApiErrorMessage(requestError, "Unable to load availability."));
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadAvailabilityData();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredAvailability = useMemo(() => {
    if (!selectedClinicId) {
      return availability;
    }

    return availability.filter((item) => item?.clinic_id === selectedClinicId);
  }, [availability, selectedClinicId]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm({
      ...defaultForm,
      clinic_id: selectedClinicId || clinics[0]?.clinic_id || "",
    });
  };

  const refreshAvailability = async () => {
    const payload = await getMyDoctorAvailability(
      selectedClinicId
        ? {
            clinic_id: selectedClinicId,
          }
        : {}
    );
    setAvailability(Array.isArray(payload?.results) ? payload.results : []);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.clinic_id) {
      toast.error("Please select a clinic.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = buildAvailabilityPayload(form);

      if (editingId) {
        await updateMyDoctorAvailability(editingId, payload);
        toast.success("Availability updated.");
      } else {
        await createMyDoctorAvailability(payload);
        toast.success("Availability added.");
      }

      await refreshAvailability();
      resetForm();
    } catch (requestError) {
      toast.error(extractApiErrorMessage(requestError, "Unable to save availability."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item?.availability_id || "");
    setSelectedClinicId(item?.clinic_id || "");
    setForm(toFormState(item));
  };

  const handleDelete = async (availabilityId) => {
    if (!availabilityId) {
      return;
    }

    try {
      await deleteMyDoctorAvailability(availabilityId);
      toast.success("Availability removed.");
      await refreshAvailability();

      if (editingId === availabilityId) {
        resetForm();
      }
    } catch (requestError) {
      toast.error(extractApiErrorMessage(requestError, "Unable to delete availability."));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-rose-200 bg-rose-50 shadow-sm">
        <CardContent className="p-6 text-sm text-rose-700">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <CalendarClock className="size-5 text-primary" />
            Availability Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Clinic</label>
                <select
                  value={form.clinic_id}
                  onChange={(event) => updateField("clinic_id", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select clinic</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.clinic_id} value={clinic.clinic_id}>
                      {clinic.clinic_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Day of week</label>
                <select
                  value={form.day_of_week}
                  onChange={(event) => updateField("day_of_week", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={Boolean(form.date)}
                >
                  {weekdays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Specific date</label>
                <Input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
                <p className="text-xs text-slate-500">
                  Leave empty for a weekly recurring schedule, or choose a date for one-off availability.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Consultation type</label>
                <select
                  value={form.consultation_type}
                  onChange={(event) => updateField("consultation_type", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="physical">In-person</option>
                  <option value="telemedicine">Telemedicine</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start time</label>
                <Input type="time" value={form.start_time} onChange={(event) => updateField("start_time", event.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End time</label>
                <Input type="time" value={form.end_time} onChange={(event) => updateField("end_time", event.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Slot duration</label>
                <Input
                  type="number"
                  min="5"
                  step="5"
                  value={form.slot_duration}
                  onChange={(event) => updateField("slot_duration", event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              ) : null}
              <Button type="submit" disabled={isSaving}>
                {editingId ? <Save className="size-4" /> : <Plus className="size-4" />}
                {isSaving ? "Saving..." : editingId ? "Update Availability" : "Add Availability"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Configured Availability</CardTitle>
          <select
            value={selectedClinicId}
            onChange={(event) => {
              setSelectedClinicId(event.target.value);
              if (!editingId) {
                setForm((prev) => ({ ...prev, clinic_id: event.target.value }));
              }
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All clinics</option>
            {clinics.map((clinic) => (
              <option key={clinic.clinic_id} value={clinic.clinic_id}>
                {clinic.clinic_name}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredAvailability.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No availability configured yet for the selected clinic.
            </div>
          ) : (
            filteredAvailability.map((item) => {
              const clinic = clinics.find((entry) => entry.clinic_id === item?.clinic_id);

              return (
                <div key={item.availability_id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{clinic?.clinic_name || "Clinic"}</p>
                      <p className="text-sm text-slate-600">
                        {item?.date || item?.day_of_week || "Custom schedule"} · {formatTimeLabel(item?.start_time)} to{" "}
                        {formatTimeLabel(item?.end_time)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatConsultationType(item?.consultation_type)} · {item?.slot_duration || 0} minute slots ·{" "}
                        {item?.status || "active"}
                      </p>
                    </div>

                    <div className="inline-flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(item.availability_id)}>
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
