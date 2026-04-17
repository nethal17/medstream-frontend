import { Outlet } from "react-router-dom";

import DoctorSidePanel from "@/components/doctor/DoctorSidePanel";

export default function DoctorLayout() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Doctor Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          View today\'s calendar, update availability, manage profile configuration, and track financials.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <DoctorSidePanel />
        <div className="min-w-0 space-y-5">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
