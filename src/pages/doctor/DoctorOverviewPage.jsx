import { CalendarCheck2, Clock3, Play, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage, formatDisplayDate, formatTimeLabel, toPositiveInt } from "@/lib/appointment-utils";
import { getAppointments, markAppointmentArrived } from "@/services/appointments";

function canMarkArrived(status) {
  return ["confirmed", "pending_payment"].includes(String(status || "").toLowerCase());
}

function canStartConsultation(status) {
  return ["arrived", "in_progress", "confirmed"].includes(String(status || "").toLowerCase());
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDummyAppointmentsForDate(date) {
  return [
    {
      appointment_id: `dummy-${date}-1`,
      patient_name: "Nimal Perera",
      date,
      start_time: "09:00:00",
      consultation_type: "physical",
      status: "confirmed",
      is_dummy: true,
    },
    {
      appointment_id: `dummy-${date}-2`,
      patient_name: "Ishara Fernando",
      date,
      start_time: "10:30:00",
      consultation_type: "telemedicine",
      status: "arrived",
      is_dummy: true,
    },
    {
      appointment_id: `dummy-${date}-3`,
      patient_name: "Kavindu De Silva",
      date,
      start_time: "12:00:00",
      consultation_type: "physical",
      status: "completed",
      is_dummy: true,
    },
    {
      appointment_id: `dummy-${date}-4`,
      patient_name: "Sachini Wickramasinghe",
      date,
      start_time: "15:00:00",
      consultation_type: "telemedicine",
      status: "confirmed",
      is_dummy: true,
    },
  ];
}

export default function DoctorOverviewPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => getTodayIsoDate());
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const summary = useMemo(() => {
    const total = items.length;
    const arrived = items.filter((item) => String(item.status).toLowerCase() === "arrived").length;
    const completed = items.filter((item) => String(item.status).toLowerCase() === "completed").length;
    const pending = total - completed;

    return { total, arrived, completed, pending };
  }, [items]);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = await getAppointments({
        page: 1,
        size: 100,
        date: selectedDate,
      });

      const fetchedItems = Array.isArray(payload?.items) ? payload.items : [];

      if (fetchedItems.length > 0) {
        setItems(fetchedItems);
      } else if (selectedDate === getTodayIsoDate()) {
        setItems(getDummyAppointmentsForDate(selectedDate));
      } else {
        setItems([]);
      }
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to load today appointments."));
      if (selectedDate === getTodayIsoDate()) {
        setItems(getDummyAppointmentsForDate(selectedDate));
      } else {
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleArrived = async (appointmentId) => {
    const targetItem = items.find((item) => item.appointment_id === appointmentId);

    if (targetItem?.is_dummy) {
      setItems((prev) =>
        prev.map((item) =>
          item.appointment_id === appointmentId
            ? {
                ...item,
                status: "arrived",
              }
            : item
        )
      );
      toast.success("Dummy appointment marked as arrived.");
      return;
    }

    setBusyId(appointmentId);
    try {
      await markAppointmentArrived(appointmentId, {
        reason: "Patient checked in at reception",
      });
      toast.success("Marked as arrived.");
      await loadAppointments();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to mark arrived."));
    } finally {
      setBusyId("");
    }
  };

  const handleStartConsultation = async (item) => {
    const appointmentId = item?.appointment_id;
    if (!appointmentId) {
      toast.error("Appointment ID missing.");
      return;
    }

    navigate(`/doctor/dashboard/consultation/${appointmentId}`, {
      state: {
        appointment: item,
      },
    });
  };

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <CalendarCheck2 className="size-5 text-primary" />
            Overview - Today Appointments
          </CardTitle>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-600">Total Slots</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{toPositiveInt(summary.total, 0)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-600">Arrived</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{toPositiveInt(summary.arrived, 0)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-600">Completed</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{toPositiveInt(summary.completed, 0)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-600">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">{toPositiveInt(summary.pending, 0)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Appointments Calendar View ({formatDisplayDate(selectedDate)})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="size-7 text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.appointment_id} className="border-t">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.patient_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDisplayDate(item.date)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatTimeLabel(item.start_time)}</td>
                      <td className="px-4 py-3 text-slate-600">{item.consultation_type || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{item.status || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={!canMarkArrived(item.status) || busyId === item.appointment_id}
                            onClick={() => handleArrived(item.appointment_id)}
                          >
                            <UserCheck className="size-3" />
                            Mark as arrived
                          </Button>
                          <Button
                            size="xs"
                            disabled={!canStartConsultation(item.status) || busyId === item.appointment_id}
                            onClick={() => handleStartConsultation(item)}
                          >
                            <Play className="size-3" />
                            Start consultation
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No appointments for selected day.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock3 className="size-4" />
              <p className="text-sm font-medium">Daily operating note</p>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Use "Mark as arrived" once patient check-in is confirmed, then use "Start consultation" when you begin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
