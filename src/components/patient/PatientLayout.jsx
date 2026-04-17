import { Outlet } from "react-router-dom";

import PatientSidePanel from "@/components/patient/PatientSidePanel";

export default function PatientLayout() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">My Patient Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track appointments, maintain your profile, and manage reports and medical information.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <PatientSidePanel />
        <div className="min-w-0 space-y-5">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
