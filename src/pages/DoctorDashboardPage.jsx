import { CheckCircle2, ClipboardCheck, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  extractApiErrorMessage,
  formatDisplayDate,
  formatTimeLabel,
  getAppointmentStatusBadgeClass,
  toPositiveInt,
} from "@/lib/appointment-utils";
import {
  getAppointments,
  markAppointmentArrived,
  markAppointmentCompleted,
} from "@/services/appointments";

function canMarkArrived(status) {
  return ["confirmed", "pending_payment"].includes(String(status || "").toLowerCase());
}

function canMarkCompleted(status) {
  return ["arrived", "in_progress"].includes(String(status || "").toLowerCase());
}

export default function DoctorDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, size: 20, hasMore: false });
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const filters = useMemo(
    () => ({
      page: toPositiveInt(searchParams.get("doctor_page"), 1),
      size: 20,
      date: searchParams.get("doctor_date") || "",
      status: searchParams.get("doctor_status") || "",
      consultation_type: searchParams.get("doctor_consultation_type") || "",
    }),
    [searchParams]
  );

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = await getAppointments(filters);
      setItems(payload?.items || []);
      setMeta({
        total: payload?.total || 0,
        page: payload?.page || filters.page,
        size: payload?.size || filters.size,
        hasMore: Boolean(payload?.has_more),
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to load appointments."));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const updateDoctorFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set("doctor_page", "1");

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next);
  };

  const updateDoctorPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("doctor_page", String(nextPage));
    setSearchParams(next);
  };

  const handleArrived = async (appointmentId) => {
    setBusyId(appointmentId);
    try {
      await markAppointmentArrived(appointmentId, {
        reason: "Patient checked in at reception",
      });
      toast.success("Appointment marked as arrived.");
      await loadAppointments();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to mark arrived."));
    } finally {
      setBusyId("");
    }
  };

  const handleComplete = async (appointmentId) => {
    setBusyId(appointmentId);
    try {
      await markAppointmentCompleted(appointmentId);
      toast.success("Appointment marked as completed.");
      await loadAppointments();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to complete appointment."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="space-y-6">
      <Card className="border border-sky-100 bg-gradient-to-r from-sky-50/80 to-white">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-3xl">
            <ClipboardCheck className="size-7 text-sky-700" />
            Doctor Dashboard
          </CardTitle>
          <p className="text-sm text-slate-600">Manage consultation outcomes in real time.</p>
        </CardHeader>
      </Card>

      <Card className="border border-slate-200 bg-white py-5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <UserCheck className="size-5 text-sky-600" />
            Doctor Appointments ({meta.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              type="date"
              value={filters.date}
              onChange={(event) => updateDoctorFilter("doctor_date", event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
            <select
              value={filters.status}
              onChange={(event) => updateDoctorFilter("doctor_status", event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending_payment">Pending payment</option>
              <option value="arrived">Arrived</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.consultation_type}
              onChange={(event) => updateDoctorFilter("doctor_consultation_type", event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All types</option>
              <option value="physical">In-person</option>
              <option value="telemedicine">Telemedicine</option>
            </select>
            <Button variant="outline" onClick={() => updateDoctorPage(1)}>
              Apply filters
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.appointment_id} className="border-t">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.patient_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDisplayDate(item.date)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatTimeLabel(item.start_time)}</td>
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
                            disabled={!canMarkArrived(item.status) || busyId === item.appointment_id}
                            onClick={() => handleArrived(item.appointment_id)}
                          >
                            Arrived
                          </Button>
                          <Button
                            size="xs"
                            disabled={!canMarkCompleted(item.status) || busyId === item.appointment_id}
                            onClick={() => handleComplete(item.appointment_id)}
                          >
                            <CheckCircle2 className="size-3" />
                            Complete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No appointments available.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => updateDoctorPage(meta.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {meta.page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasMore}
              onClick={() => updateDoctorPage(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
