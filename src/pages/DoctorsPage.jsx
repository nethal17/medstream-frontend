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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  formatCurrencyLkr,
  formatDisplayDate,
  formatTimeLabel,
  toApiDate,
} from "@/lib/appointment-utils";
import { searchDoctors } from "@/services/appointments";

const consultationOptions = [
  { value: "", label: "All Types" },
  { value: "physical", label: "In-person" },
  { value: "telemedicine", label: "Telemedicine" },
];

// TODO(api): Replace dummy appointment history with backend endpoint when available.
const dummyAppointmentHistory = [
  {
    id: "hist-1",
    doctor: "Dr. Sarah Jenkins",
    dateTime: "Oct 20, 2024 - 10:00 AM",
    type: "Physical",
    status: "Confirmed",
  },
  {
    id: "hist-2",
    doctor: "Dr. Michael Chen",
    dateTime: "Oct 15, 2024 - 03:45 PM",
    type: "Telemedicine",
    status: "Completed",
  },
  {
    id: "hist-3",
    doctor: "Dr. Robert Fox",
    dateTime: "Oct 05, 2024 - 09:00 AM",
    type: "Physical",
    status: "Canceled",
  },
];

// TODO(api): Replace dummy recommendation card with personalized follow-up endpoint.
const dummyFollowUp = {
  text: "Based on your recent consultation, we recommend a routine follow-up in 3 months.",
  period: "Jan 20 - Jan 30, 2025",
};

function getStatusBadgeClass(status) {
  const normalized = status.toLowerCase();

  if (normalized === "confirmed") {
    return "bg-sky-100 text-sky-700";
  }
  if (normalized === "completed") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-rose-100 text-rose-700";
}

function DoctorCard({ doctor, onBook }) {
  const firstSlot = doctor.available_slots?.[0];
  const rating = doctor.rating ?? 4.8;
  // TODO(api): Replace generated initials avatar with doctor profile image URL from API.
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

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [meta, setMeta] = useState({ total: 0, empty_state: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConsultationType, setSelectedConsultationType] = useState(
    searchParams.get("consultation_type") || "physical"
  );

  const filters = useMemo(() => {
    return {
      specialty: searchParams.get("specialty") || "",
      date: searchParams.get("date") || toApiDate(new Date()),
      consultation_type: searchParams.get("consultation_type") || "",
      clinic_id: searchParams.get("clinic_id") || "",
    };
  }, [searchParams]);

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

        const status = requestError?.response?.status;

        setDoctors([]);
        setMeta({ total: 0, empty_state: false });
        if (status === 401 || status === 403) {
          setError("Access denied. Please login as a patient and try again.");
          toast.error("Authorization required for doctor search.");
        } else {
          setError("Could not fetch doctors right now.");
          toast.error("Unable to load doctors.");
        }
        console.error(requestError);
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

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
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
    setSearchParams({ date: toApiDate(new Date()) });
    setSelectedConsultationType("physical");
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
                value={filters.specialty}
                onChange={(event) => updateFilter("specialty", event.target.value)}
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
              <Button className="mt-4" variant="outline" onClick={() => setSearchParams(searchParams)}>
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
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dummyAppointmentHistory.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.doctor}</td>
                    <td className="px-4 py-3 text-slate-600">{item.dateTime}</td>
                    <td className="px-4 py-3 text-slate-600">{item.type}</td>
                    <td className="px-4 py-3">
                      <span className={["rounded-full px-2 py-1 text-xs font-medium", getStatusBadgeClass(item.status)].join(" ")}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button size="xs" variant="outline">
                          Reschedule
                        </Button>
                        <Button size="xs" variant="destructive">
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-cyan-100 bg-gradient-to-r from-sky-50 to-cyan-50 py-5 shadow-sm">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Recommended Follow-up</p>
            <p className="text-sm text-slate-600">{dummyFollowUp.text}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-600">Suggested period: {dummyFollowUp.period}</p>
            <Button size="sm" className="bg-sky-600 text-white hover:bg-sky-700">
              Book Follow-up
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
