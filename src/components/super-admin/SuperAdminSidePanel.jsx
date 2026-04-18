import { Building2, CalendarDays, Landmark, Settings2, Shield, Stethoscope } from "lucide-react";

const navItems = [
  { key: "overview", label: "Overview", icon: Shield },
  { key: "doctors", label: "Doctors", icon: Stethoscope },
  { key: "clinics", label: "Clinics", icon: Building2 },
  {
    key: "appointments",
    label: "Appointments",
    icon: CalendarDays,
    children: [
      { key: "appointments-normal", label: "Normal Appointments" },
      { key: "appointments-telemedicine", label: "Telemedicine Appointments" },
    ],
  },
  { key: "configurations", label: "Configurations", icon: Settings2 },
  { key: "financial", label: "Earnings", icon: Landmark },
];

function NavButton({ isActive, onClick, icon: Icon, label, isChild = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        isActive
          ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      } ${isChild ? "pl-9" : ""}`}
    >
      {Icon ? <Icon className="size-4" /> : null}
      <span className={isActive ? "font-semibold" : "font-medium"}>{label}</span>
    </button>
  );
}

export default function SuperAdminSidePanel({ activeKey, onSelect }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Super Admin</p>
        <p className="mt-1 text-sm text-slate-700">Manage operations, records, and configuration.</p>
      </div>

      <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            if (!item.children) {
              return (
                <NavButton
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  isActive={activeKey === item.key}
                  onClick={() => onSelect(item.key)}
                />
              );
            }

            const isAppointmentsGroup =
              activeKey === "appointments-normal" || activeKey === "appointments-telemedicine";

            return (
              <div key={item.key} className="space-y-1">
                <NavButton
                  label={item.label}
                  icon={item.icon}
                  isActive={isAppointmentsGroup}
                  onClick={() => onSelect("appointments-normal")}
                />
                {item.children.map((child) => (
                  <NavButton
                    key={child.key}
                    label={child.label}
                    isChild
                    isActive={activeKey === child.key}
                    onClick={() => onSelect(child.key)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
