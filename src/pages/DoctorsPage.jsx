import {
  CalendarClock,
  Clock3,
  Filter,
  MapPin,
  Search,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import CancelAppointmentModal from "@/components/appointments/CancelAppointmentModal";
import RescheduleAppointmentModal from "@/components/appointments/RescheduleAppointmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  extractApiErrorMessage,
  formatConsultationType,
  formatCurrencyLkr,
  formatDisplayDate,
  formatTimeLabel,
  getAppointmentStatusBadgeClass,
  toApiDate,
  toPositiveInt,
} from "@/lib/appointment-utils";
import {
  cancelAppointment,
  getAppointments,
  rescheduleAppointment,
  searchDoctors,
} from "@/services/appointments";

const consultationOptions = [
  { value: "", label: "All Types" },
  { value: "physical", label: "In-person" },
  { value: "telemedicine", label: "Telemedicine" },
];

const historyStatusOptions = [
  { value: "", label: "All status" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending_payment", label: "Pending payment" },
  { value: "arrived", label: "Arrived" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function DoctorCard({ doctor, onBook }) {
  const firstSlot = doctor.available_slots?.[0];
  const rating = doctor.rating ?? 4.8;
  const initials = doctor.full_name
    ?.split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="gap-4 border border-slate-200/80 bg-white py-5 shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-sky-50 text-sm font-semibold text-sky-700 ring-1 ring-sky-100">
              {initials || "DR"}
            </div>
            <div>
              <CardTitle className="text-xl">{doctor.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{doctor.specialization || "Specialist"}</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
            <Star className="size-3 fill-current" />
            {rating}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-center gap-2.5 text-sm text-slate-600">
          <MapPin className="size-4" />
          {doctor.clinic_name || "Clinic unavailable"}
        </p>
        <p className="flex items-center gap-2.5 text-sm text-slate-600">
          <Clock3 className="size-4" />
          Consultation Fee: {formatCurrencyLkr(doctor.consultation_fee)}
        </p>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <Clock3 className="size-4" />
            Next: {firstSlot ? formatTimeLabel(firstSlot.start_time) : "No slots"}
          </span>
          <Button size="sm" className="px-5" disabled={!doctor.has_slots} onClick={onBook}>
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function isActionDisabled(status) {
  return ["completed", "in_progress", "cancelled"].includes(String(status || "").toLowerCase());
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [meta, setMeta] = useState({ total: 0, empty_state: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [historyItems, setHistoryItems] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ total: 0, page: 1, size: 5, has_more: false });
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isMutationLoading, setIsMutationLoading] = useState(false);

  const [selectedConsultationType, setSelectedConsultationType] = useState(
    searchParams.get("consultation_type") || "physical"
  );
  const [specialtyDraft, setSpecialtyDraft] = useState(searchParams.get("specialty") || "");

  const filters = useMemo(() => {
    return {
      specialty: searchParams.get("specialty") || "",
      date: searchParams.get("date") || toApiDate(new Date()),
      consultation_type: searchParams.get("consultation_type") || "",
      clinic_id: searchParams.get("clinic_id") || "",
    };
  }, [searchParams]);

  const historyFilters = useMemo(() => {
    return {
      page: toPositiveInt(searchParams.get("history_page"), 1),
      size: 5,
      status: searchParams.get("history_status") || "",
      consultation_type: searchParams.get("history_consultation_type") || "",
      date: searchParams.get("history_date") || "",
    };
  }, [searchParams]);

  useEffect(() => {
    setSpecialtyDraft(filters.specialty);
  }, [filters.specialty]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("specialty") || "";
      if (current === specialtyDraft.trim()) {
        return;
      }

      const next = new URLSearchParams(searchParams);
      if (specialtyDraft.trim()) {
        next.set("specialty", specialtyDraft.trim());
      } else {
        next.delete("specialty");
      }
      setSearchParams(next);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams, setSearchParams, specialtyDraft]);

  useEffect(() => {
    let ignore = false;

    async function loadDoctors() {
      setIsLoading(true);
      setError("");

      try {
        const payload = await searchDoctors(filters);
        if (ignore) {
          return;
        }

        setDoctors(payload?.results || []);
        setMeta({
          total: payload?.total || 0,
          empty_state: Boolean(payload?.empty_state),
        });
      } catch (requestError) {
        if (ignore) {
          return;
        }

        setDoctors([]);
        setMeta({ total: 0, empty_state: false });
        setError(extractApiErrorMessage(requestError, "Could not fetch doctors right now."));
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      ignore = true;
    };
  }, [filters]);

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      setIsHistoryLoading(true);
      setHistoryError("");

      try {
        const payload = await getAppointments(historyFilters);
        if (ignore) {
          return;
        }

        setHistoryItems(payload?.items || []);
        setHistoryMeta({
          total: payload?.total || 0,
          page: payload?.page || historyFilters.page,
          size: payload?.size || historyFilters.size,
          has_more: Boolean(payload?.has_more),
        });
      } catch (requestError) {
        if (ignore) {
          return;
        }

        setHistoryError(extractApiErrorMessage(requestError, "Unable to load appointment history."));
        setHistoryItems([]);
      } finally {
        if (!ignore) {
          setIsHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [historyFilters]);

  const updateFilter = (key, value) => {
    const current = searchParams.get(key) || "";
    const normalized = value || "";
    if (current === normalized) {
      return;
    }

    const next = new URLSearchParams(searchParams);

    if (!normalized) {
      next.delete(key);
    } else {
      next.set(key, normalized);
    }

    setSearchParams(next);
  };

  const specialtyOptions = useMemo(() => {
    const values = new Set();
    doctors.forEach((doctor) => {
      if (doctor.specialization) {
        values.add(doctor.specialization);
      }
    });

    return [{ value: "", label: "All Specialties" }, ...Array.from(values).map((value) => ({ value, label: value }))];
  }, [doctors]);

  const clinicOptions = useMemo(() => {
    const values = new Map();
    doctors.forEach((doctor) => {
      if (doctor.clinic_id) {
        values.set(doctor.clinic_id, doctor.clinic_name || "Clinic");
      }
    });

    return [
      { value: "", label: "All Clinics" },
      ...Array.from(values.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [doctors]);

  const handleSearchClick = () => {
    updateFilter("consultation_type", selectedConsultationType || "");
    updateFilter("date", filters.date || toApiDate(new Date()));
  };

  const clearAll = () => {
    const next = new URLSearchParams(searchParams);
    next.set("date", toApiDate(new Date()));
    next.delete("specialty");
    next.delete("clinic_id");
    next.delete("consultation_type");
    setSearchParams(next);
    setSelectedConsultationType("physical");
  };

  const updateHistoryFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set("history_page", "1");

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next);
  };

  const updateHistoryPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("history_page", String(nextPage));
    setSearchParams(next);
  };

  const refreshHistoryAndDoctors = async () => {
    const [doctorPayload, historyPayload] = await Promise.all([
      searchDoctors(filters),
      getAppointments(historyFilters),
    ]);

    setDoctors(doctorPayload?.results || []);
    setMeta({
      total: doctorPayload?.total || 0,
      empty_state: Boolean(doctorPayload?.empty_state),
    });

    setHistoryItems(historyPayload?.items || []);
    setHistoryMeta({
      total: historyPayload?.total || 0,
      page: historyPayload?.page || historyFilters.page,
      size: historyPayload?.size || historyFilters.size,
      has_more: Boolean(historyPayload?.has_more),
    });
  };

  const handleReschedule = async (payload) => {
    if (!rescheduleTarget?.appointment_id) {
      return;
    }

    setIsMutationLoading(true);
    try {
      await rescheduleAppointment(rescheduleTarget.appointment_id, payload);
      toast.success("Appointment rescheduled successfully.");
      setRescheduleTarget(null);
      await refreshHistoryAndDoctors();
    } catch (errorResponse) {
      toast.error(extractApiErrorMessage(errorResponse, "Unable to reschedule appointment."));
    } finally {
      setIsMutationLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    if (!cancelTarget?.appointment_id) {
      return;
    }

    setIsMutationLoading(true);
    try {
      await cancelAppointment(cancelTarget.appointment_id, reason ? { reason } : {});
      toast.success("Appointment cancelled successfully.");
      setCancelTarget(null);
      await refreshHistoryAndDoctors();
    } catch (errorResponse) {
      toast.error(extractApiErrorMessage(errorResponse, "Unable to cancel appointment."));
    } finally {
      setIsMutationLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <Card className="gap-5 border border-sky-100 bg-gradient-to-b from-sky-50/70 to-white py-7 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-4xl tracking-tight text-slate-900">Find Your Doctor</CardTitle>
          <p className="text-slate-600">
            Search by name, specialty, or clinic to book your next appointment.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1.6fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={specialtyDraft}
                onChange={(event) => setSpecialtyDraft(event.target.value)}
                className="h-11 rounded-lg border-slate-300 bg-white pl-9"
                placeholder="Search doctor, specialty, or clinic"
              />
            </div>
            <Input
              type="date"
              value={filters.date}
              onChange={(event) => updateFilter("date", event.target.value)}
              className="h-11 rounded-lg border-slate-300 bg-white"
            />
            <Button className="h-11 rounded-lg bg-sky-600 px-6 text-white hover:bg-sky-700" onClick={handleSearchClick}>
              Search Now
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                <Filter className="size-4" />
                Filters
              </span>

              <select
                value={filters.specialty}
                onChange={(event) => updateFilter("specialty", event.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {specialtyOptions.map((option) => (
                  <option key={option.value || "all-specialties"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.clinic_id}
                onChange={(event) => updateFilter("clinic_id", event.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {clinicOptions.map((option) => (
                  <option key={option.value || "all-clinics"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="inline-flex items-center rounded-md border border-slate-300 bg-slate-50 p-1">
                {consultationOptions
                  .filter((option) => option.value)
                  .map((option) => {
                    const active = selectedConsultationType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedConsultationType(option.value)}
                        className={[
                          "rounded px-3 py-1.5 text-xs font-medium transition",
                          active ? "bg-sky-600 text-white" : "text-slate-600",
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    );
                  })}
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>

          <p className="text-sm text-slate-500">
            Active date: <span className="font-semibold text-slate-700">{formatDisplayDate(filters.date)}</span>
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
            <Stethoscope className="size-5 text-sky-600" />
            Available Doctors
          </h2>
          <p className="text-sm text-muted-foreground">{meta.total} Results</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border bg-background p-10">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : null}

        {!isLoading && error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="font-medium">{error}</p>
              <Button className="mt-4" variant="outline" onClick={() => updateFilter("date", filters.date)}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && (meta.empty_state || doctors.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserRound className="mx-auto mb-3 size-10 text-muted-foreground" />
              <p className="text-lg font-semibold">No doctors found</p>
              <p className="text-sm text-muted-foreground">
                Try changing the specialty or consultation type for {formatDisplayDate(filters.date)}.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && doctors.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.doctor_id}
                doctor={doctor}
                onBook={() => {
                  const next = new URLSearchParams();
                  next.set("date", filters.date);
                  if (filters.consultation_type) {
                    next.set("consultation_type", filters.consultation_type);
                  }
                  if (doctor.clinic_id) {
                    next.set("clinic_id", doctor.clinic_id);
                  }
                  navigate(`/doctors/${doctor.doctor_id}?${next.toString()}`);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <Card className="border border-slate-200 bg-white py-5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <CalendarClock className="size-5 text-sky-600" />
            Appointment History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              type="date"
              value={historyFilters.date}
              onChange={(event) => updateHistoryFilter("history_date", event.target.value)}
            />
            <select
              value={historyFilters.status}
              onChange={(event) => updateHistoryFilter("history_status", event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {historyStatusOptions.map((option) => (
                <option key={option.value || "all-status"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={historyFilters.consultation_type}
              onChange={(event) => updateHistoryFilter("history_consultation_type", event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {consultationOptions.map((option) => (
                <option key={option.value || "all-types"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={() => updateHistoryPage(1)}>
              Apply filters
            </Button>
          </div>

          {isHistoryLoading ? (
            <div className="flex items-center justify-center rounded-xl border bg-background p-8">
              <Spinner className="size-7 text-primary" />
            </div>
          ) : null}

          {!isHistoryLoading && historyError ? (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="font-medium">{historyError}</p>
              </CardContent>
            </Card>
          ) : null}

          {!isHistoryLoading && !historyError ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((item) => (
                    <tr key={item.appointment_id} className="border-t">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.doctor_name}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDisplayDate(item.date)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatTimeLabel(item.start_time)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatConsultationType(item.consultation_type)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "rounded-full px-2 py-1 text-xs font-medium",
                            getAppointmentStatusBadgeClass(item.status),
                          ].join(" ")}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={isActionDisabled(item.status)}
                            onClick={() => setRescheduleTarget(item)}
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={isActionDisabled(item.status)}
                            onClick={() => setCancelTarget(item)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {historyItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No appointment records found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total: {historyMeta.total}</p>
            <div className="inline-flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={historyMeta.page <= 1}
                onClick={() => updateHistoryPage(historyMeta.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {historyMeta.page}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={!historyMeta.has_more}
                onClick={() => updateHistoryPage(historyMeta.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RescheduleAppointmentModal
        key={rescheduleTarget?.appointment_id || "reschedule-modal"}
        open={Boolean(rescheduleTarget)}
        initialDate={rescheduleTarget?.date || ""}
        initialStartTime={rescheduleTarget?.start_time || ""}
        initialConsultationType={rescheduleTarget?.consultation_type || "physical"}
        isSubmitting={isMutationLoading}
        onClose={() => setRescheduleTarget(null)}
        onConfirm={handleReschedule}
      />

      <CancelAppointmentModal
        key={cancelTarget?.appointment_id || "cancel-modal"}
        open={Boolean(cancelTarget)}
        title="Cancel booking"
        confirmLabel="Cancel booking"
        isSubmitting={isMutationLoading}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
    </section>
  );
}
