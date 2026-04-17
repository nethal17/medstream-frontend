import { Outlet } from "react-router-dom";

import ClinicAdminSidePanel from "@/components/clinic-admin/ClinicAdminSidePanel";

export default function ClinicAdminLayout() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Clinic Administration</h1>
        <p className="mt-2 text-sm text-slate-600">
          Operate your clinic from one place: profile updates, staff, schedules, and finances.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <ClinicAdminSidePanel />
        <div className="min-w-0 space-y-5">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
