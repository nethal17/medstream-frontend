import { CalendarDays, RefreshCw, Video } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function SuperAdminAppointmentsPage({
  activeView,
  onSelectView,
  dashboardFilters,
  onFilterChange,
  appointmentItems,
  appointmentMeta,
  onPreviousPage,
  onNextPage,
  onRefresh,
  isRefreshing,
}) {
  const showTelemedicine = activeView === "appointments-telemedicine";

  const visibleAppointments = useMemo(() => {
    const list = Array.isArray(appointmentItems) ? appointmentItems : [];

    if (showTelemedicine) {
      return list.filter((item) => item?.consultation_type === "telemedicine");
    }

    return list.filter((item) => item?.consultation_type !== "telemedicine");
  }, [appointmentItems, showTelemedicine]);

  return (
    <Card className="border border-slate-200 bg-white py-5 shadow-sm">
      <CardHeader className="pb-2 space-y-4">
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <CalendarDays className="size-5 text-primary" />
          Appointments
        </CardTitle>

        <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <TabButton active={!showTelemedicine} onClick={() => onSelectView("appointments-normal")}>Normal Appointments</TabButton>
          <TabButton active={showTelemedicine} onClick={() => onSelectView("appointments-telemedicine")}>Telemedicine Appointments</TabButton>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!showTelemedicine ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Appointment ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Clinic</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleAppointments.map((item, index) => (
                  <tr key={item.appointment_id || `admin-appointment-${index}`} className="border-t">
                    <td className="px-4 py-3 text-slate-700">{item.appointment_id || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.patient_name || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.doctor_name || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.clinic_name || item.clinic_id || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.date || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{item.status || "-"}</span>
                    </td>
                  </tr>
                ))}
                {visibleAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No normal appointments for selected filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-5">
              <input
                type="date"
                value={dashboardFilters.date_from}
                onChange={(event) => onFilterChange("date_from", event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                type="date"
                value={dashboardFilters.date_to}
                onChange={(event) => onFilterChange("date_to", event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                value={dashboardFilters.clinic_id}
                onChange={(event) => onFilterChange("clinic_id", event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Clinic ID"
              />
              <input
                value={dashboardFilters.doctor_id}
                onChange={(event) => onFilterChange("doctor_id", event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Doctor ID"
              />
              <select
                value={dashboardFilters.outcome}
                onChange={(event) => onFilterChange("outcome", event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All outcomes</option>
                <option value="completed">Completed</option>
                <option value="no_show">No-show</option>
                <option value="technical_failed">Technical failure</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Video className="size-4 text-primary" />
                Telemedicine live records
              </p>
              <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
                <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Appointment</th>
                    <th className="px-4 py-3">Clinic</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Outcome</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAppointments.map((item, index) => (
                    <tr key={item.appointment_id || item.session_id || `live-${index}`} className="border-t">
                      <td className="px-4 py-3 text-slate-700">{item.appointment_id || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.clinic_id || item.clinic_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.doctor_id || item.doctor_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.outcome || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.status || item.telemedicine_status || "-"}</td>
                    </tr>
                  ))}
                  {visibleAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No telemedicine records for selected filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" disabled={appointmentMeta.page <= 1} onClick={onPreviousPage}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {appointmentMeta.page}</span>
              <Button variant="outline" size="sm" disabled={!appointmentMeta.has_more} onClick={onNextPage}>
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
