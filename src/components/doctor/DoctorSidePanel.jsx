import { CalendarDays, CircleDollarSign, Settings2, Stethoscope, Timer } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "overview", label: "Overview", icon: CalendarDays },
  { to: "availability", label: "Availability", icon: Timer },
  { to: "configurations", label: "Configurations", icon: Settings2 },
  { to: "financial", label: "Financial", icon: CircleDollarSign },
];

export default function DoctorSidePanel() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Doctor Profile</p>
        <p className="mt-1 text-sm text-slate-700">Manage daily flow, profile setup, and finances.</p>
      </div>

      <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={`/doctor/dashboard/${item.to}`}
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
          <Stethoscope className="size-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">Session Status</p>
        </div>
        <p className="mt-2 text-sm font-medium text-emerald-900">Ready for Consultations</p>
        <p className="text-xs text-emerald-700">Today's load is healthy and within limits.</p>
      </div>
    </aside>
  );
}
