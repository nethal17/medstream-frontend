import { CalendarClock, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  extractApiErrorMessage,
  formatConsultationType,
  formatDisplayDate,
  formatTimeLabel,
  getAppointmentStatusBadgeClass,
} from "@/lib/appointment-utils";
import { getAppointments } from "@/services/appointments";
import { getCurrentUserProfile } from "@/services/auth";

function getDummyAppointments() {
  return [
    {
      appointment_id: "p-dummy-1",
      doctor_name: "Dr. Nethmi Rodrigo",
      date: new Date().toISOString().slice(0, 10),
      start_time: "09:30:00",
      consultation_type: "physical",
      status: "confirmed",
    },
    {
      appointment_id: "p-dummy-2",
      doctor_name: "Dr. Kavishka Perera",
      date: new Date().toISOString().slice(0, 10),
      start_time: "13:30:00",
      consultation_type: "telemedicine",
      status: "completed",
    },
  ];
}

export default function PatientOverviewPage() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const [profileData, appointmentData] = await Promise.all([
          getCurrentUserProfile(),
          getAppointments({ page: 1, size: 10 }),
        ]);

        if (ignore) {
          return;
        }

        setProfile(profileData || null);

        const items = Array.isArray(appointmentData?.items) ? appointmentData.items : [];
        setAppointments(items.length > 0 ? items : getDummyAppointments());
      } catch (error) {
        if (ignore) {
          return;
        }

        toast.error(extractApiErrorMessage(error, "Unable to load profile data."));
        setAppointments(getDummyAppointments());
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border border-sky-100 bg-gradient-to-r from-sky-50/80 to-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Overview - Patient Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <p className="inline-flex items-center gap-2 text-sm text-slate-700">
            <UserRound className="size-4" />
            {profile?.full_name || profile?.name || "Unknown Patient"}
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-slate-700">
            <Mail className="size-4" />
            {profile?.email || "No email"}
          </p>
          <p className="text-sm text-slate-700">Patient ID: {profile?.id || profile?.user_id || "-"}</p>
          <p className="text-sm text-slate-700">Role: {profile?.role || "patient"}</p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <CalendarClock className="size-5 text-primary" />
            Appointment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.appointment_id} className="border-t">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.doctor_name || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDisplayDate(item.date)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatTimeLabel(item.start_time)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatConsultationType(item.consultation_type)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-xs font-medium",
                          getAppointmentStatusBadgeClass(item.status),
                        ].join(" ")}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
