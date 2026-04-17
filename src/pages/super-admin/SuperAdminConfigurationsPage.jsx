import { Settings2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuperAdminConfigurationsPage({
  googleStatus,
  onRefresh,
  isRefreshing,
  connectUrl,
  policy,
  onPolicyInputChange,
  onPolicySave,
  isSavingPolicy,
}) {
  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white py-5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <Video className="size-5 text-primary" />
            Google OAuth
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
            <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {!googleStatus?.connected ? (
              <Button asChild>
                <a href={connectUrl}>Connect Google</a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white py-5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <Settings2 className="size-5 text-primary" />
            Policy Settings
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
            <Button onClick={onPolicySave} disabled={isSavingPolicy}>
              {isSavingPolicy ? "Saving..." : "Update Policy"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
