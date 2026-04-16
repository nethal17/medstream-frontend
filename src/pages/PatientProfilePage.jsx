import { CalendarClock, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
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

export default function PatientProfilePage() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const [profileData, appointmentData] = await Promise.all([
          getCurrentUserProfile(),
          getAppointments({ page: 1, size: 10 }),
        ]);

        if (ignore) {
          return;
        }

        setProfile(profileData || null);
        setAppointments(appointmentData?.items || []);
      } catch (requestError) {
        if (ignore) {
          return;
        }

        const message = extractApiErrorMessage(requestError, "Unable to load profile.");
        setError(message);
        toast.error(message);
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
      <div className="flex items-center justify-center rounded-xl border bg-background p-10">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <Card className="border border-sky-100 bg-gradient-to-r from-sky-50/80 to-white">
        <CardHeader>
          <CardTitle className="text-3xl">Patient Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="size-4" />
            {profile?.full_name || profile?.name || "Unknown user"}
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" />
            {profile?.email || "No email"}
          </p>
          <p className="text-sm text-muted-foreground">Role: {profile?.role || "patient"}</p>
          <p className="text-sm text-muted-foreground">Patient ID: {profile?.id || profile?.user_id || "-"}</p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white py-5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <CalendarClock className="size-5 text-sky-600" />
            Recent Appointments
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
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No appointments yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <a href="/doctors">Book new appointment</a>
        </Button>
      </div>
    </section>
  );
}
