import { CalendarDays, CircleDollarSign, ClipboardList, Settings2, Stethoscope, Timer } from "lucide-react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";

import { Spinner } from "@/components/ui/spinner";
import { useDoctorIdentity } from "@/hooks/useDoctorIdentity";
import { useEffect, useState } from "react";
import { getAppointments } from "@/services/appointments";

const navItems = [
  { to: "overview", label: "Overview", icon: CalendarDays },
  { to: "appointments", label: "Appointments", icon: ClipboardList },
  { to: "availability", label: "Availability", icon: Timer },
  { to: "configurations", label: "Configurations", icon: Settings2 },
  { to: "financial", label: "Financial", icon: CircleDollarSign },
];

export default function DoctorSidePanel() {
  const { doctorId, doctorName, isLoading, error } = useDoctorIdentity();
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      if (!doctorId) {
        setAppointments([]);
        setAppointmentsLoading(false);
        return;
      }
      setAppointmentsLoading(true);
      setAppointmentsError("");
      try {
        const today = new Date().toISOString().slice(0, 10);
        const payload = await getAppointments({ doctor_id: doctorId, date: today, size: 20 });
        const activeAppts = (payload?.items || []).filter(
          appt => appt.status !== "completed" && appt.status !== "cancelled" && appt.status !== "technical_failure"
        );
        setAppointments(activeAppts.slice(0, 5));
      } catch {
        toast.error("Failed to fetch upcoming appointments");
        setAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    }
    fetchAppointments();
  }, [doctorId]);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Doctor Profile</p>
        {isLoading ? (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Spinner className="size-4 text-primary" />
            Loading profile...
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm font-medium text-slate-900">{doctorName || "Doctor"}</p>
            <p className="mt-1 text-sm text-slate-700">Manage daily flow, profile setup, and finances.</p>
            {error ? <p className="mt-1 text-xs text-amber-700">Name could not be refreshed from the doctor profile.</p> : null}
          </>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">Today's Appointments</p>
        {appointmentsLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner className="size-4 text-primary" />
            Loading...
          </div>
        ) : appointmentsError ? (
          <p className="text-xs text-rose-700">{appointmentsError}</p>
        ) : appointments.length === 0 ? (
          <p className="text-xs text-slate-500">No appointments for today.</p>
        ) : (
          <ul className="space-y-1">
            {appointments.map((appt) => (
              <li key={appt.id} className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700 flex flex-col">
                <span className="font-semibold">{appt.patient_name || "Patient"}</span>
                <span>{appt.time || appt.start_time || "-"}</span>
                <span className="capitalize">{appt.status}</span>
              </li>
            ))}
          </ul>
        )}
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
