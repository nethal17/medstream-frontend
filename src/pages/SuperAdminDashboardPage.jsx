import { BarChart3, RefreshCw, Settings2, Shield, Video } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import {
  getAdminTelemedicineLiveStatuses,
  getActivePolicy,
  getAdminStatistics,
  updateActivePolicy,
} from "@/services/appointments";
import {
  getGoogleOAuthLoginUrl,
  getGoogleOAuthStatus,
} from "@/services/telemedicine";

const defaultPolicy = {
  cancellation_window_hours: 12,
  reschedule_window_hours: 24,
  advance_booking_days: 14,
  no_show_grace_period_minutes: 15,
  max_reschedules: 2,
  reason: "",
};

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [googleStatus, setGoogleStatus] = useState(null);
  const [liveStatuses, setLiveStatuses] = useState([]);
  const [livePage, setLivePage] = useState(1);
  const [liveMeta, setLiveMeta] = useState({ page: 1, size: 20, has_more: false });
  const [dashboardFilters, setDashboardFilters] = useState({
    date_from: "",
    date_to: "",
    clinic_id: "",
    doctor_id: "",
    outcome: "",
  });
  const [policy, setPolicy] = useState(defaultPolicy);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsPayload, policyPayload, oauthPayload, livePayload] = await Promise.all([
        getAdminStatistics(dashboardFilters),
        getActivePolicy(),
        getGoogleOAuthStatus(),
        getAdminTelemedicineLiveStatuses({ page: livePage, size: 20, ...dashboardFilters }),
      ]);
      setStats(statsPayload || null);
      setGoogleStatus(oauthPayload || null);
      setLiveStatuses(livePayload?.items || livePayload?.results || []);
      setLiveMeta({
        page: livePayload?.page || livePage,
        size: livePayload?.size || 20,
        has_more: Boolean(livePayload?.has_more),
      });
      setPolicy({
        cancellation_window_hours: policyPayload?.cancellation_window_hours ?? 12,
        reschedule_window_hours: policyPayload?.reschedule_window_hours ?? 24,
        advance_booking_days: policyPayload?.advance_booking_days ?? 14,
        no_show_grace_period_minutes: policyPayload?.no_show_grace_period_minutes ?? 15,
        max_reschedules: policyPayload?.max_reschedules ?? 2,
        reason: "",
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to load super admin data."));
    } finally {
      setIsLoading(false);
    }
  }, [dashboardFilters, livePage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onPolicyInputChange = (key, value) => {
    setPolicy((prev) => ({
      ...prev,
      [key]: key === "reason" ? value : Number.parseInt(value || "0", 10),
    }));
  };

  const handlePolicySave = async () => {
    setIsSavingPolicy(true);
    try {
      await updateActivePolicy(policy);
      toast.success("Policy updated.");
      await loadData();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to update policy."));
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const updateFilter = (key, value) => {
    setLivePage(1);
    setDashboardFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const refreshLiveStatuses = async () => {
    setIsRefreshingLive(true);
    try {
      const [statsPayload, livePayload, oauthPayload] = await Promise.all([
        getAdminStatistics(dashboardFilters),
        getAdminTelemedicineLiveStatuses({ page: livePage, size: 20, ...dashboardFilters }),
        getGoogleOAuthStatus(),
      ]);

      setStats(statsPayload || null);
      setGoogleStatus(oauthPayload || null);
      setLiveStatuses(livePayload?.items || livePayload?.results || []);
      setLiveMeta({
        page: livePayload?.page || livePage,
        size: livePayload?.size || 20,
        has_more: Boolean(livePayload?.has_more),
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to refresh live dashboard."));
    } finally {
      setIsRefreshingLive(false);
    }
  };

  return (
    <section className="space-y-6">
      <Card className="border border-sky-100 bg-gradient-to-r from-sky-50/80 to-white">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-3xl">
            <Shield className="size-7 text-sky-700" />
            Super Admin Dashboard
          </CardTitle>
          <p className="text-sm text-slate-600">System oversight and policy management.</p>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-background p-12">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-slate-200 bg-white">
              <CardContent className="py-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Bookings</p>
                <p className="text-3xl font-semibold text-slate-900">{stats?.total_bookings ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="py-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Cancellations</p>
                <p className="text-3xl font-semibold text-slate-900">{stats?.total_cancellations ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="py-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">No-shows</p>
                <p className="text-3xl font-semibold text-slate-900">{stats?.total_no_shows ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="py-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
                <p className="text-3xl font-semibold text-slate-900">{stats?.total_completed ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="py-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Failed Sessions</p>
                <p className="text-3xl font-semibold text-slate-900">{stats?.total_failed_sessions ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="py-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Avg Duration</p>
                <p className="text-3xl font-semibold text-slate-900">{stats?.average_duration_minutes ?? "-"}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-200 bg-white py-5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="inline-flex items-center gap-2 text-xl">
                <Video className="size-5 text-sky-600" />
                Google Meet Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-700">
                  Status:{" "}
                  <span className={googleStatus?.connected ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                    {googleStatus?.connected ? "Connected" : "Disconnected"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {googleStatus?.connected
                    ? `Account: ${googleStatus?.account_email || "N/A"}`
                    : "Connect your Google account to provision Google Meet links."}
                </p>
              </div>

              <div className="inline-flex items-center gap-2">
                <Button variant="outline" onClick={refreshLiveStatuses} disabled={isRefreshingLive}>
                  <RefreshCw className="size-4" />
                  Refresh
                </Button>
                {!googleStatus?.connected ? (
                  <Button asChild>
                    <a href={getGoogleOAuthLoginUrl()}>Connect Google</a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white py-5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="inline-flex items-center gap-2 text-xl">Live Telemedicine Statuses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <input
                  type="date"
                  value={dashboardFilters.date_from}
                  onChange={(event) => updateFilter("date_from", event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  type="date"
                  value={dashboardFilters.date_to}
                  onChange={(event) => updateFilter("date_to", event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  value={dashboardFilters.clinic_id}
                  onChange={(event) => updateFilter("clinic_id", event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Clinic ID"
                />
                <input
                  value={dashboardFilters.doctor_id}
                  onChange={(event) => updateFilter("doctor_id", event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Doctor ID"
                />
                <select
                  value={dashboardFilters.outcome}
                  onChange={(event) => updateFilter("outcome", event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All outcomes</option>
                  <option value="completed">Completed</option>
                  <option value="no_show">No-show</option>
                  <option value="technical_failed">Technical failure</option>
                </select>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Appointment</th>
                      <th className="px-4 py-3">Clinic</th>
                      <th className="px-4 py-3">Doctor</th>
                      <th className="px-4 py-3">Outcome</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveStatuses.map((item, index) => (
                      <tr key={item.appointment_id || item.session_id || `live-${index}`} className="border-t">
                        <td className="px-4 py-3 text-slate-700">{item.appointment_id || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{item.clinic_id || item.clinic_name || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{item.doctor_id || item.doctor_name || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{item.outcome || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{item.status || item.telemedicine_status || "-"}</td>
                      </tr>
                    ))}
                    {liveStatuses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No live telemedicine records for selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled={liveMeta.page <= 1} onClick={() => setLivePage((prev) => prev - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {liveMeta.page}</span>
                <Button variant="outline" size="sm" disabled={!liveMeta.has_more} onClick={() => setLivePage((prev) => prev + 1)}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white py-5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="inline-flex items-center gap-2 text-xl">
                <Settings2 className="size-5 text-sky-600" />
                Active Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Cancellation window (hours)</span>
                <input
                  type="number"
                  min={1}
                  value={policy.cancellation_window_hours}
                  onChange={(event) => onPolicyInputChange("cancellation_window_hours", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>Reschedule window (hours)</span>
                <input
                  type="number"
                  min={1}
                  value={policy.reschedule_window_hours}
                  onChange={(event) => onPolicyInputChange("reschedule_window_hours", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>Advance booking days</span>
                <input
                  type="number"
                  min={1}
                  value={policy.advance_booking_days}
                  onChange={(event) => onPolicyInputChange("advance_booking_days", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>No-show grace period (minutes)</span>
                <input
                  type="number"
                  min={1}
                  value={policy.no_show_grace_period_minutes}
                  onChange={(event) => onPolicyInputChange("no_show_grace_period_minutes", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>Max reschedules</span>
                <input
                  type="number"
                  min={0}
                  value={policy.max_reschedules}
                  onChange={(event) => onPolicyInputChange("max_reschedules", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                />
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>Reason</span>
                <textarea
                  rows={3}
                  value={policy.reason}
                  onChange={(event) => onPolicyInputChange("reason", event.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Operational policy update for Q2"
                />
              </label>

              <div className="md:col-span-2">
                <Button onClick={handlePolicySave} disabled={isSavingPolicy}>
                  <BarChart3 className="size-4" />
                  {isSavingPolicy ? "Saving..." : "Update Policy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
