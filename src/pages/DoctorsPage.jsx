import {
  Bot,
  CalendarClock,
  MessageCircle,
  Clock3,
  Filter,
  MapPin,
  Search,
  Star,
  Stethoscope,
  UserRound,
  Video,
  X,
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
import { useAuth } from "@/contexts/useAuth";
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
  getChatbotRecommendations,
  getAppointments,
  rescheduleAppointment,
  searchDoctors,
} from "@/services/appointments";
import { createTelemedicineJoinLink } from "@/services/telemedicine";

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
            <div className="flex size-14 items-center justify-center rounded-full bg-accent/60 text-sm font-semibold text-primary ring-1 ring-border">
              {initials || "DR"}
            </div>
            <div>
              <CardTitle className="text-xl">{doctor.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{doctor.specialization || "Specialist"}</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-border">
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

function canJoinTelemedicine(item) {
  const status = String(item?.status || "").toLowerCase();
  return item?.consultation_type === "telemedicine" && !["cancelled", "completed", "no_show"].includes(status);
}

function pickRecommendationSlot(item) {
  const slots = Array.isArray(item?.available_slots) ? item.available_slots : [];
  return slots[0] || null;
}

function toDateOnly(value) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function getChatbotErrorMessage(errorResponse) {
  const status = errorResponse?.response?.status;

  if (status === 401) {
    return "Please sign in again to use the symptom assistant.";
  }

  if (status === 403) {
    return "This feature is available only for patient accounts.";
  }

  if (status === 502 || status === 503) {
    return "AI service is temporarily unavailable. Please retry in a few seconds.";
  }

  if (status === 400 || status === 422) {
    return extractApiErrorMessage(errorResponse, "Please check symptoms and filters, then try again.");
  }

  return extractApiErrorMessage(errorResponse, "Unable to get recommendations.");
}

function RecommendationDoctorCard({ item, onBook }) {
  const slots = Array.isArray(item?.available_slots) ? item.available_slots.slice(0, 3) : [];

  return (
    <Card className="gap-3 border border-slate-200 bg-white py-4 shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg">{item.full_name || "Doctor"}</CardTitle>
        <p className="text-sm text-muted-foreground">{item.specialization || "Specialist"}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-slate-600">Clinic: {item.clinic_name || "-"}</p>
        <p className="text-sm text-slate-600">Type: {formatConsultationType(item.consultation_type)}</p>
        <p className="text-sm text-slate-600">Fee: {formatCurrencyLkr(item.consultation_fee)}</p>
        <p className="text-sm text-slate-600">Slots: {item.has_slots ? "Available" : "No slots"}</p>

        {slots.length > 0 ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p className="font-medium text-slate-700">Available slots</p>
            <ul className="mt-1 space-y-1">
              {slots.map((slot, index) => (
                <li key={`${item.doctor_id}-${slot.start_time || index}`}>
                  {slot?.date ? `${formatDisplayDate(slot.date)} ` : ""}
                  {slot?.start_time ? formatTimeLabel(slot.start_time) : "Time not available"}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Button size="sm" className="mt-2 w-full" disabled={!item?.doctor_id} onClick={onBook}>
          Continue to Booking
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

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
  const [symptomsDraft, setSymptomsDraft] = useState("");
  const [recommendationDate, setRecommendationDate] = useState(toApiDate(new Date()));
  const [recommendationType, setRecommendationType] = useState("physical");
  const [recommendationClinicId, setRecommendationClinicId] = useState("");
  const [maxRecommendations, setMaxRecommendations] = useState(5);
  const [chatbotResult, setChatbotResult] = useState(null);
  const [chatbotError, setChatbotError] = useState("");
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    if (!isAuthenticated) {
      setHistoryItems([]);
      setHistoryMeta({ total: 0, page: 1, size: 5, has_more: false });
      setHistoryError("");
      setIsHistoryLoading(false);
      return;
    }

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
  }, [historyFilters, isAuthenticated]);

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

  const handleRecommendationBook = (item) => {
    const slot = pickRecommendationSlot(item);
    const next = new URLSearchParams();

    const nextDate = slot?.date || recommendationDate || filters.date;
    if (nextDate) {
      next.set("date", nextDate);
    }

    const nextType = item?.consultation_type || recommendationType;
    if (nextType) {
      next.set("consultation_type", nextType);
    }

    if (item?.clinic_id) {
      next.set("clinic_id", item.clinic_id);
    }

    if (slot?.start_time) {
      next.set("start_time", slot.start_time);
    }

    navigate(`/doctors/${item.doctor_id}?${next.toString()}`);
  };

  const requestRecommendations = async () => {
    if (!symptomsDraft.trim()) {
      setChatbotError("Please describe symptoms to get recommendations.");
      return;
    }

    setIsChatbotLoading(true);
    setChatbotError("");

    try {
      const normalizedDate = recommendationDate || undefined;

      const payload = {
        symptoms: symptomsDraft.trim(),
        target_date: normalizedDate,
        consultation_type: recommendationType || undefined,
        clinic_id: recommendationClinicId || undefined,
        max_recommendations: Number(maxRecommendations) || 5,

        // Aliases kept for compatibility with older backend normalizers.
        symptomText: symptomsDraft.trim(),
        targetDate: toDateOnly(normalizedDate),
        date: normalizedDate,
        appointmentDate: toDateOnly(normalizedDate),
        consultationType: recommendationType || undefined,
        clinicId: recommendationClinicId || undefined,
        maxRecommendations: Number(maxRecommendations) || 5,
      };

      const data = await getChatbotRecommendations(payload);
      setChatbotResult(data || null);
    } catch (errorResponse) {
      setChatbotResult(null);
      setChatbotError(getChatbotErrorMessage(errorResponse));
    } finally {
      setIsChatbotLoading(false);
    }
  };

  const handleRecommendationSubmit = async (event) => {
    event.preventDefault();
    await requestRecommendations();
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
    const requests = [searchDoctors(filters)];
    if (isAuthenticated) {
      requests.push(getAppointments(historyFilters));
    }

    const [doctorPayload, historyPayload] = await Promise.all(requests);

    setDoctors(doctorPayload?.results || []);
    setMeta({
      total: doctorPayload?.total || 0,
      empty_state: Boolean(doctorPayload?.empty_state),
    });

    if (isAuthenticated) {
      setHistoryItems(historyPayload?.items || []);
      setHistoryMeta({
        total: historyPayload?.total || 0,
        page: historyPayload?.page || historyFilters.page,
        size: historyPayload?.size || historyFilters.size,
        has_more: Boolean(historyPayload?.has_more),
      });
    }
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

  const handleJoinSession = async (appointmentId) => {
    setIsMutationLoading(true);
    try {
      const payload = await createTelemedicineJoinLink(appointmentId);
      if (!payload?.join_url) {
        throw new Error("Join link missing in response.");
      }

      window.open(payload.join_url, "_blank", "noopener,noreferrer");
      toast.success("Telemedicine session opened.");
    } catch (errorResponse) {
      toast.error(extractApiErrorMessage(errorResponse, "Unable to open telemedicine session."));
    } finally {
      setIsMutationLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <Card className="gap-5 bg-[radial-gradient(circle_at_top_right,rgba(134,208,193,0.14),transparent_45%)] py-7">
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
            <Button className="h-11 rounded-lg px-6" onClick={handleSearchClick}>
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
                          active ? "bg-primary text-primary-foreground" : "text-slate-600",
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
            <Stethoscope className="size-5 text-primary" />
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
                  const chosenType = filters.consultation_type || selectedConsultationType;
                  if (chosenType) {
                    next.set("consultation_type", chosenType);
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

      {isAuthenticated ? (
      <Card className="border border-slate-200 bg-white py-5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <CalendarClock className="size-5 text-primary" />
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
                            disabled={!canJoinTelemedicine(item) || isMutationLoading}
                            onClick={() => handleJoinSession(item.appointment_id)}
                          >
                            <Video className="size-3" />
                            Join
                          </Button>
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
      ) : (
      <Card className="border border-slate-200 bg-white py-5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <CalendarClock className="size-5 text-primary" />
            Sign in for booking history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            You can browse all doctors without an account. Sign in to view your appointment history,
            join telemedicine sessions, and manage bookings.
          </p>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        </CardContent>
      </Card>
      )}

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

      {isChatOpen ? (
        <Card className="fixed right-4 bottom-4 z-50 max-h-[68vh] w-[min(92vw,480px)] gap-2 border border-slate-200 bg-white py-3 shadow-2xl">
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="inline-flex items-center gap-2 text-xl">
                    <Bot className="size-5 text-primary" />
                    Find Right Doctor
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-600">
                    Describe symptoms and get recommended doctors instantly.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close chatbot"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto">
              <form onSubmit={handleRecommendationSubmit} className="space-y-3">
                <textarea
                  value={symptomsDraft}
                  onChange={(event) => setSymptomsDraft(event.target.value)}
                  placeholder="Example: I have chest pain and shortness of breath"
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={recommendationDate}
                    onChange={(event) => setRecommendationDate(event.target.value)}
                  />

                  <select
                    value={recommendationType}
                    onChange={(event) => setRecommendationType(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="physical">In-person</option>
                    <option value="telemedicine">Telemedicine</option>
                  </select>

                  <select
                    value={recommendationClinicId}
                    onChange={(event) => setRecommendationClinicId(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Any clinic</option>
                    {clinicOptions
                      .filter((option) => option.value)
                      .map((option) => (
                        <option key={`ai-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>

                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={maxRecommendations}
                    onChange={(event) => setMaxRecommendations(event.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isChatbotLoading}>
                  {isChatbotLoading ? "Getting recommendations..." : "Get Recommendations"}
                </Button>
              </form>

              {chatbotError ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <p>{chatbotError}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={requestRecommendations}
                    disabled={isChatbotLoading}
                  >
                    Retry
                  </Button>
                </div>
              ) : null}

              {chatbotResult ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">Reason:</span> {chatbotResult?.recommendation_reason || "-"}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Total:</span> {chatbotResult?.total ?? 0}
                      {chatbotResult?.llm_used != null
                        ? ` | LLM used: ${chatbotResult.llm_used ? "Yes" : "No"}`
                        : ""}
                    </p>
                  </div>

                  {Array.isArray(chatbotResult?.suggested_specialties) &&
                  chatbotResult.suggested_specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {chatbotResult.suggested_specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {chatbotResult?.follow_up_question ? (
                    <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                      <p className="font-semibold">Follow-up question</p>
                      <p className="mt-1">{chatbotResult.follow_up_question}</p>
                    </div>
                  ) : null}

                  {chatbotResult?.no_results_guidance ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      {chatbotResult.no_results_guidance}
                    </div>
                  ) : null}

                  {chatbotResult?.empty_state ? (
                    <p className="text-sm text-slate-600">No recommendations yet. Please refine your symptoms.</p>
                  ) : null}

                  {Array.isArray(chatbotResult?.top_doctors) && chatbotResult.top_doctors.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {chatbotResult.top_doctors.map((item) => (
                        <RecommendationDoctorCard
                          key={`${item.doctor_id}-${item.clinic_id || "clinic"}`}
                          item={item}
                          onBook={() => handleRecommendationBook(item)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
      ) : null}

      <Button
        type="button"
        className="fixed right-4 bottom-4 z-40 rounded-full px-4 shadow-xl"
        onClick={() => setIsChatOpen(true)}
      >
        <MessageCircle className="size-4" />
        Find Doctor
      </Button>
    </section>
  );
}
