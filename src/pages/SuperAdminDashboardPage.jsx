import { BarChart3, Settings2, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import {
  getActivePolicy,
  getAdminStatistics,
  updateActivePolicy,
} from "@/services/appointments";

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
  const [policy, setPolicy] = useState(defaultPolicy);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsPayload, policyPayload] = await Promise.all([getAdminStatistics(), getActivePolicy()]);
      setStats(statsPayload || null);
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
  }, []);

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
          </div>

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
