import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { decodeJwtPayload, getClinicIdFromToken } from "@/lib/auth";
import {
  extractApiErrorMessage,
  formatConsultationType,
  formatDisplayDate,
  formatTimeLabel,
  getAppointmentStatusBadgeClass,
  toPositiveInt,
} from "@/lib/appointment-utils";
import { getAccessToken } from "@/services/api";
import { getClinicAppointments } from "@/services/clinics";
import { getUserClinic } from "@/services/clinicStaff";

// ─── Helpers ───────────────────────────────────────────────────────────────

const MONTH_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarCells(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function toIsoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ClinicAdminAppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Clinic resolution ──────────────────────────────────────────────────
  const [clinicId, setClinicId] = useState(null);
  const [clinicError, setClinicError] = useState(null);

  useEffect(() => {
    const token = getAccessToken();
    const fromToken = token
      ? getClinicIdFromToken(token) ||
        decodeJwtPayload(token)?.clinic_id ||
        decodeJwtPayload(token)?.clinicId
      : null;

    if (fromToken) {
      setClinicId(fromToken);
      return;
    }

    getUserClinic()
      .then((assignment) => {
        if (assignment?.clinic_id) {
          setClinicId(assignment.clinic_id);
        } else {
          setClinicError("Unable to determine your clinic assignment.");
        }
      })
      .catch((err) => {
        setClinicError(
          err?.response?.data?.detail ||
            err?.message ||
            "Unable to resolve clinic assignment."
        );
      });
  }, []);

  // ── Calendar state ─────────────────────────────────────────────────────
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const calendarCells = useMemo(() => buildCalendarCells(viewDate), [viewDate]);

  const selectedDateIso = useMemo(
    () => toIsoDate(viewDate.getFullYear(), viewDate.getMonth(), selectedDay),
    [viewDate, selectedDay]
  );

  const shiftMonth = (dir) => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1)
    );
    setSelectedDay(1);
  };

  // ── Month-level appointment counts (for calendar heat-map) ─────────────
  const [monthCounts, setMonthCounts] = useState({});
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const monthFetchKey = useRef(null);

  const loadMonthCounts = useCallback(async () => {
    if (!clinicId) return;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const key = `${clinicId}-${year}-${month}`;
    if (monthFetchKey.current === key) return;
    monthFetchKey.current = key;

    setIsLoadingMonth(true);
    // Fetch up to 500 appointments for the month (no date filter), then group by day
    const firstDay = toIsoDate(year, month, 1);
    const lastDay = toIsoDate(year, month, new Date(year, month + 1, 0).getDate());

    try {
      // We fetch all pages for the month to count per-day totals.
      // Use a single large request that the backend cap allows (size=100).
      // For clinics with many appointments you'd want a dedicated /monthly-counts endpoint,
      // but for MVP this is fine since the clinic-service endpoint is already available.
      let page = 1;
      const counts = {};

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const payload = await getClinicAppointments(clinicId, {
          page,
          size: 100,
        });
        const items = payload?.items ?? [];

        for (const item of items) {
          const d = item.date; // "YYYY-MM-DD"
          if (d >= firstDay && d <= lastDay) {
            const dayNum = parseInt(d.split("-")[2], 10);
            counts[dayNum] = (counts[dayNum] || 0) + 1;
          }
        }

        if (!payload?.has_more) break;
        page += 1;
        // Safety cap — never fetch more than 5 pages for the heat-map
        if (page > 5) break;
      }

      setMonthCounts(counts);
    } catch {
      // Non-critical — silently ignore heat-map errors
      setMonthCounts({});
    } finally {
      setIsLoadingMonth(false);
    }
  }, [clinicId, viewDate]);

  useEffect(() => {
    monthFetchKey.current = null; // reset so new month triggers fetch
    loadMonthCounts();
  }, [loadMonthCounts]);

  // ── Daily appointment list ─────────────────────────────────────────────
  const page = toPositiveInt(searchParams.get("appt_page"), 1);
  const statusFilter = searchParams.get("appt_status") || "";
  const typeFilter = searchParams.get("appt_type") || "";

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, size: 20, hasMore: false });
  const [isLoadingList, setIsLoadingList] = useState(false);

  const loadDayAppointments = useCallback(async () => {
    if (!clinicId) return;
    setIsLoadingList(true);
    try {
      const payload = await getClinicAppointments(clinicId, {
        date: selectedDateIso,
        page,
        size: 20,
        appointment_status: statusFilter || undefined,
        consultation_type: typeFilter || undefined,
      });
      setItems(payload?.items ?? []);
      setMeta({
        total: toPositiveInt(payload?.total, 0),
        page: payload?.page ?? page,
        size: payload?.size ?? 20,
        hasMore: Boolean(payload?.has_more),
      });
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Unable to load appointments."));
      setItems([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [clinicId, selectedDateIso, page, statusFilter, typeFilter]);

  useEffect(() => {
    loadDayAppointments();
  }, [loadDayAppointments]);

  // ── Filter helpers ─────────────────────────────────────────────────────
  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set("appt_page", "1");
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("appt_page", String(p));
    setSearchParams(next);
  };

  // ─── If clinic resolution fails ────────────────────────────────────────
  if (clinicError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {clinicError}
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────
  const isToday = (day) => {
    const t = new Date();
    return (
      day === t.getDate() &&
      viewDate.getMonth() === t.getMonth() &&
      viewDate.getFullYear() === t.getFullYear()
    );
  };

  return (
    <div className="space-y-5">
      {/* ── Calendar card ── */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <CalendarDays className="size-5 text-primary" />
            Appointments Calendar
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="w-44 text-center text-sm font-semibold text-slate-700">
              {MONTH_FMT.format(viewDate)}
              {isLoadingMonth && (
                <span className="ml-2 inline-block size-3 animate-spin rounded-full border-2 border-primary border-t-transparent align-middle" />
              )}
            </p>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            {WEEKDAY_LABELS.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-16 rounded-lg bg-slate-50"
                  />
                );
              }

              const count = monthCounts[day] ?? 0;
              const isSelected = selectedDay === day;
              const tod = isToday(day);

              // Heat intensity classes based on count
              let heatClass = "bg-white";
              if (!isSelected && count > 0) {
                if (count >= 10) heatClass = "bg-teal-100";
                else if (count >= 5) heatClass = "bg-teal-50";
                else heatClass = "bg-slate-50";
              }

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day);
                    setPage(1);
                  }}
                  className={[
                    "relative flex h-16 flex-col items-start rounded-lg border p-2 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : `border-slate-200 ${heatClass} hover:border-primary/40 hover:bg-primary/5`,
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-xs font-semibold",
                      isSelected
                        ? "text-primary"
                        : tod
                          ? "text-primary underline underline-offset-2"
                          : "text-slate-700",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                  {count > 0 && (
                    <span
                      className={[
                        "mt-auto text-[10px] font-medium",
                        isSelected ? "text-primary" : "text-teal-600",
                      ].join(" ")}
                    >
                      {count} appt{count !== 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day summary strip */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
            Showing appointments for{" "}
            <span className="font-semibold text-slate-800">
              {ordinal(selectedDay)}{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric",
              }).format(viewDate)}
            </span>
            {meta.total > 0 && (
              <span className="ml-2 text-slate-500">
                — {meta.total} appointment{meta.total !== 1 ? "s" : ""} found
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Appointment list card ── */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <ClipboardList className="size-5 text-primary" />
            {formatDisplayDate(selectedDateIso)} — Appointments
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              id="appt-status-filter"
              value={statusFilter}
              onChange={(e) => setFilter("appt_status", e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="arrived">Arrived</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
              <option value="pending_payment">Pending payment</option>
            </select>

            <select
              id="appt-type-filter"
              value={typeFilter}
              onChange={(e) => setFilter("appt_type", e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Filter by consultation type"
            >
              <option value="">All types</option>
              <option value="in_person">In-person</option>
              <option value="telemedicine">Telemedicine</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDayAppointments()}
              className="ml-auto"
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>

          {/* Table */}
          {isLoadingList ? (
            <div className="flex items-center justify-center py-14">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.appointment_id}
                      className="border-t transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {item.patient_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.doctor_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatTimeLabel(item.start_time)}
                        {item.end_time && (
                          <span className="text-slate-400">
                            {" "}– {formatTimeLabel(item.end_time)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatConsultationType(item.consultation_type)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                            getAppointmentStatusBadgeClass(item.status),
                          ].join(" ")}
                        >
                          {item.status?.replace(/_/g, " ") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                            item.payment_status === "paid"
                              ? "bg-emerald-100/70 text-emerald-700"
                              : item.payment_status === "failed"
                                ? "bg-rose-100/70 text-rose-700"
                                : "bg-amber-100/70 text-amber-700",
                          ].join(" ")}
                        >
                          {item.payment_status?.replace(/_/g, " ") || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        No appointments found for{" "}
                        {formatDisplayDate(selectedDateIso)}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {(meta.page > 1 || meta.hasMore) && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.page}
                {meta.total > 0 && (
                  <span className="text-slate-400">
                    {" "}
                    · {meta.total} total
                  </span>
                )}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasMore}
                onClick={() => setPage(meta.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
