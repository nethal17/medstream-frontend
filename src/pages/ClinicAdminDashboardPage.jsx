import { Building2, ClipboardList, RefreshCw, TimerOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import CancelAppointmentModal from "@/components/appointments/CancelAppointmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  extractApiErrorMessage,
  formatDisplayDate,
  formatTimeLabel,
  getAppointmentStatusBadgeClass,
  toApiDate,
  toPositiveInt,
} from "@/lib/appointment-utils";
import {
  adminCancelAppointment,
  adminMarkNoShow,
  getAdminAppointments,
  getAppointmentStatusHistory,
} from "@/services/appointments";

export default function ClinicAdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, size: 20, hasMore: false });
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [cancelTargetId, setCancelTargetId] = useState("");
  const [historyTargetId, setHistoryTargetId] = useState("");
  const [history, setHistory] = useState([]);

  const filters = useMemo(
    () => ({
      page: toPositiveInt(searchParams.get("admin_page"), 1),
      size: 20,
      date_from: toApiDate(searchParams.get("admin_date_from") || ""),
      date_to: toApiDate(searchParams.get("admin_date_to") || ""),
      status: searchParams.get("admin_status") || "",
    }),
    [searchParams]
  );

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);

    try {
      const payload = await getAdminAppointments(filters);
      setItems(payload?.items || []);
      setMeta({
        total: toPositiveInt(payload?.total, 0),
        page: payload?.page || filters.page,
        size: payload?.size || filters.size,
        hasMore: Boolean(payload?.has_more),
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to load admin appointments."));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const updateAdminFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set("admin_page", "1");

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next);
  };

  const updateAdminPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("admin_page", String(nextPage));
    setSearchParams(next);
  };

  const handleAdminCancel = async (reason) => {
    if (!cancelTargetId) {
      return;
    }

    setBusyAction(cancelTargetId);
    try {
      await adminCancelAppointment(cancelTargetId, { reason });
      toast.success("Appointment cancelled.");
      setCancelTargetId("");
      await loadAppointments();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to cancel appointment."));
    } finally {
      setBusyAction("");
    }
  };

  const handleNoShow = async (appointmentId) => {
    setBusyAction(appointmentId);
    try {
      await adminMarkNoShow(appointmentId, { reason: "Patient did not arrive" });
      toast.success("Marked as no-show.");
      await loadAppointments();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to mark no-show."));
    } finally {
      setBusyAction("");
    }
  };

  const loadStatusHistory = async (appointmentId) => {
    setHistoryTargetId(appointmentId);
    try {
      const payload = await getAppointmentStatusHistory(appointmentId);
      setHistory(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to load status history."));
      setHistory([]);
    }
  };

  return (
    <section className="space-y-6">
      <Card className="border border-sky-100 bg-gradient-to-r from-sky-50/80 to-white">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-3xl">
            <Building2 className="size-7 text-sky-700" />
            Clinic Admin Dashboard
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="border border-slate-200 bg-white py-5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <ClipboardList className="size-5 text-sky-600" />
            Operational Appointments ({meta.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              type="date"
              value={searchParams.get("admin_date_from") || ""}
              onChange={(event) => updateAdminFilter("admin_date_from", event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
            <input
              type="date"
              value={searchParams.get("admin_date_to") || ""}
              onChange={(event) => updateAdminFilter("admin_date_to", event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
            <select
              value={searchParams.get("admin_status") || ""}
              onChange={(event) => updateAdminFilter("admin_status", event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All status</option>
              <option value="confirmed">Confirmed</option>
              <option value="arrived">Arrived</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
            </select>
            <Button variant="outline" onClick={() => updateAdminPage(1)}>
              <RefreshCw className="size-4" />
              Apply filters
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.appointment_id} className="border-t">
                      <td className="px-4 py-3 text-slate-700">{item.patient_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.doctor_name || "-"}</td>
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
                            disabled={busyAction === item.appointment_id}
                            onClick={() => loadStatusHistory(item.appointment_id)}
                          >
                            History
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={busyAction === item.appointment_id}
                            onClick={() => setCancelTargetId(item.appointment_id)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={busyAction === item.appointment_id}
                            onClick={() => handleNoShow(item.appointment_id)}
                          >
                            <TimerOff className="size-3" />
                            No-show
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No appointments found for selected filters.
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
              disabled={meta.page <= 1}
              onClick={() => updateAdminPage(meta.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {meta.page}</span>
            <Button
              variant="outline"
              disabled={!meta.hasMore}
              onClick={() => updateAdminPage(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {historyTargetId ? (
        <Card className="border border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Status History ({historyTargetId})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((entry) => (
              <div key={entry.history_id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                <p className="font-medium">
                  {entry.old_status || "-"} to {entry.new_status || "-"}
                </p>
                <p className="text-muted-foreground">{entry.reason || "No reason"}</p>
                <p className="text-xs text-muted-foreground">{entry.changed_by || "system"}</p>
              </div>
            ))}
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No status history records found.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <CancelAppointmentModal
        key={cancelTargetId || "admin-cancel-modal"}
        open={Boolean(cancelTargetId)}
        requireReason
        isSubmitting={Boolean(busyAction)}
        onClose={() => setCancelTargetId("")}
        onConfirm={handleAdminCancel}
      />
    </section>
  );
}
