import { Building2, CalendarDays, DollarSign, LayoutDashboard, Stethoscope, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "overview", label: "Overview", icon: LayoutDashboard },
  { to: "staff", label: "Staff", icon: UsersRound },
  { to: "doctors", label: "Doctors", icon: Stethoscope },
  { to: "appointments", label: "Appointments", icon: CalendarDays },
  { to: "financials", label: "Financials", icon: DollarSign },
  { to: "configurations", label: "Configurations", icon: Building2 },
];

export default function ClinicAdminSidePanel() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Clinic Admin</p>
        <p className="mt-1 text-sm text-slate-700">Manage clinic profile, staff, appointments, and finances.</p>
      </div>

      <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={`/admin/clinic/dashboard/${item.to}`}
              className={({ isActive }) =>
                [
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              <item.icon className="size-4" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700">
          <Building2 className="size-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">Clinic Status</p>
        </div>
        <p className="mt-2 text-sm font-medium text-emerald-900">Operational</p>
        <p className="text-xs text-emerald-700">Next compliance review in 14 days.</p>
      </div>
    </aside>
  );
}
