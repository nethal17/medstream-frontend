import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatCard({ label, value }) {
  return (
    <Card className="border border-slate-200/90 bg-white/95 shadow-sm">
      <CardContent className="py-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminOverviewPage({ stats }) {
  return (
    <Card className="border border-slate-200 bg-white py-5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <BarChart3 className="size-5 text-primary" />
          Statistics Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Bookings" value={stats?.total_bookings ?? 0} />
          <StatCard label="Cancellations" value={stats?.total_cancellations ?? 0} />
          <StatCard label="No-shows" value={stats?.total_no_shows ?? 0} />
          <StatCard label="Completed" value={stats?.total_completed ?? 0} />
          <StatCard label="Failed Sessions" value={stats?.total_failed_sessions ?? 0} />
          <StatCard label="Avg Duration" value={stats?.average_duration_minutes ?? "-"} />
        </div>
      </CardContent>
    </Card>
  );
}
