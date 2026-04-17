import { CalendarDays, ClipboardPlus, FileText, LayoutDashboard, Pill, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "overview", label: "Overview", icon: LayoutDashboard },
  { to: "appointments", label: "My Appointments", icon: CalendarDays },
  { to: "profile-setup", label: "Profile Setup", icon: UserRound },
  { to: "reports", label: "My Reports", icon: FileText },
  { to: "prescriptions", label: "My Prescriptions", icon: Pill },
  { to: "medical-information", label: "My Medical Information", icon: ClipboardPlus },
];

export default function PatientSidePanel() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Patient Portal</p>
        <p className="mt-1 text-sm text-slate-700">Manage your profile, reports, prescriptions, and records.</p>
      </div>

      <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={`/patient/profile/${item.to}`}
              className={({ isActive }) =>
                [
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
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
    </aside>
  );
}
