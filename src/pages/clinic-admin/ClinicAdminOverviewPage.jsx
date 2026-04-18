import { CalendarDays, Clock3, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClinicDashboard } from "@/services/clinics";
import { getAccessToken } from "@/services/api";
import { decodeJwtPayload, getClinicIdFromToken } from "@/lib/auth";
import { getUserClinic } from "@/services/clinicStaff";

function formatNumber(value) {
  return value != null ? String(value) : "-";
}

export default function ClinicAdminOverviewPage() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      const token = getAccessToken();
      const tokenClinicId = token
        ? getClinicIdFromToken(token) || decodeJwtPayload(token)?.clinic_id || decodeJwtPayload(token)?.clinicId
        : null;
      let clinicId = tokenClinicId;

      if (!clinicId) {
        try {
          const assignment = await getUserClinic();
          clinicId = assignment?.clinic_id;
        } catch (err) {
          setError(err?.response?.data?.detail || err?.message || "Unable to resolve clinic assignment.");
          setIsLoading(false);
          return;
        }
      }

      if (!clinicId) {
        setError("Unable to determine clinic assignment from your session.");
        setIsLoading(false);
        return;
      }

      try {
        const payload = await getClinicDashboard(clinicId);
        setDashboard(payload);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || "Failed to load clinic dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const summary = [
    { label: "Total Doctors", value: formatNumber(dashboard?.active_doctors), icon: Stethoscope },
    { label: "Today Appointments", value: formatNumber(dashboard?.total_appointments), icon: CalendarDays },
    { label: "Completed Today", value: formatNumber(dashboard?.completed_consultations), icon: Clock3 },
    { label: "Patients in Queue", value: formatNumber(dashboard?.patients_in_queue), icon: Users },
  ];

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                <item.icon className="size-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <CalendarDays className="size-4 text-primary" />
            Doctor Appointment Counts (Today)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-500">Loading overview...</div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3 text-right">Appointment Count</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.doctor_appointment_counts?.length ? (
                  dashboard.doctor_appointment_counts.map((row) => (
                    <tr key={String(row.doctor_id) + row.doctor_name} className="border-t">
                      <td className="px-4 py-3 font-medium text-slate-700">{row.doctor_name || "Unknown doctor"}</td>
                      <td className="px-4 py-3 text-slate-600">{row.specialty || "—"}</td>
                      <td className="px-4 py-3 text-right text-slate-800">{row.appointment_count}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No appointment counts available for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
