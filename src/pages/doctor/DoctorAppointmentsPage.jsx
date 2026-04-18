import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useDoctorIdentity } from "@/hooks/useDoctorIdentity";
import { getAppointments, markAppointmentArrived } from "@/services/appointments";
import { formatDisplayDate, formatTimeLabel } from "@/lib/appointment-utils";

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const { doctorId } = useDoctorIdentity();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAppointments() {
      setIsLoading(true);
      setError("");
      if (!doctorId) {
        setAppointments([]);
        setIsLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().slice(0, 10);
        const payload = await getAppointments({ doctor_id: doctorId, date: today, size: 50 });
        if (!ignore) {
          const filtered = (payload?.items || []).filter(
            appt => appt.status !== "completed" && appt.status !== "cancelled" && appt.status !== "technical_failure"
          );
          setAppointments(filtered);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load today's appointments.");
          setAppointments([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadAppointments();
    return () => {
      ignore = true;
    };
  }, [doctorId]);

  const handleMarkArrived = async (appointmentId) => {
    setBusyId(appointmentId);
    try {
      await markAppointmentArrived(appointmentId, { reason: "Patient arrived" });
      const today = new Date().toISOString().slice(0, 10);
      const payload = await getAppointments({ doctor_id: doctorId, date: today, size: 50 });
      const filtered = (payload?.items || []).filter(
        appt => appt.status !== "completed" && appt.status !== "cancelled" && appt.status !== "technical_failure"
      );
      setAppointments(filtered);
    } catch {
      setError("Unable to mark the patient as arrived.");
    } finally {
      setBusyId("");
    }
  };

  const handleStartConsulting = (appointment) => {
    const appointmentId = appointment?.id || appointment?.appointment_id;
    if (!appointmentId) {
      return;
    }

    navigate(`/doctor/dashboard/consultation/${appointmentId}`, {
      state: { appointment },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="inline-flex items-center gap-2 text-2xl">
                <ClipboardList className="size-6 text-primary" />
                Today's Appointments
              </CardTitle>
              <p className="mt-2 text-sm text-slate-600">Review and start your doctor appointments for today.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-600">
              <Spinner className="size-5 text-primary" />
              <span>Loading today's appointments…</span>
            </div>
          ) : error ? (
            <p className="text-sm text-rose-700">{error}</p>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-slate-500">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const appointmentId = appointment?.id || appointment?.appointment_id;
                return (
                  <div key={appointmentId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{appointment?.patient_name || appointment?.patient?.name || "Patient"}</p>
                        <p className="text-sm text-slate-600">
                          {formatDisplayDate(appointment?.date)} · {formatTimeLabel(appointment?.start_time)}
                        </p>
                        <p className="text-sm text-slate-700 capitalize">{appointment?.consultation_type || "Unknown"}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkArrived(appointmentId)}
                          disabled={Boolean(busyId)}
                        >
                          Arrived
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStartConsulting(appointment)}
                          disabled={Boolean(busyId)}
                        >
                          Start Consulting
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
