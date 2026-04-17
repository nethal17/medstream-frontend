import { CalendarDays, Clock3, Stethoscope, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const summary = [
  { label: "Total Doctors", value: "18", icon: Stethoscope },
  { label: "Today Appointments", value: "64", icon: CalendarDays },
  { label: "Completed Today", value: "41", icon: Clock3 },
  { label: "Patients in Queue", value: "23", icon: Users },
];

const doctorAppointmentCounts = [
  { doctor: "Dr. Malini Jayawardena", specialty: "General Medicine", appointments: 14 },
  { doctor: "Dr. Nethmi Rodrigo", specialty: "Pediatrics", appointments: 11 },
  { doctor: "Dr. Amila Senanayake", specialty: "Cardiology", appointments: 8 },
  { doctor: "Dr. Kavishka Perera", specialty: "Orthopedics", appointments: 10 },
  { doctor: "Dr. Hasini Fernando", specialty: "Dermatology", appointments: 7 },
];

export default function ClinicAdminOverviewPage() {

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
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Specialty</th>
                <th className="px-4 py-3 text-right">Appointment Count</th>
              </tr>
            </thead>
            <tbody>
              {doctorAppointmentCounts.map((row) => (
                <tr key={row.doctor} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">{row.doctor}</td>
                  <td className="px-4 py-3 text-slate-600">{row.specialty}</td>
                  <td className="px-4 py-3 text-right text-slate-800">{row.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
