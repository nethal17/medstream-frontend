import { CalendarDays, CalendarClock } from "lucide-react";
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

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, size: 20 });

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const payload = await getAppointments({ page: 1, size: 20 });

        if (ignore) return;

        const items = Array.isArray(payload?.items) ? payload.items : [];
        setAppointments(items);
        setMeta({
          total: payload?.total || 0,
          page: payload?.page || 1,
          size: payload?.size || 20,
        });
      } catch (error) {
        if (ignore) return;
        toast.error(extractApiErrorMessage(error, "Unable to load appointments."));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <CalendarDays className="size-5 text-primary" />
            My Appointments ({meta.total})
          </CardTitle>
          <p className="text-sm text-slate-500 font-normal">
            Viewing your upcoming and past medical consultations.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100">Doctor</th>
                    <th className="px-6 py-4 border-b border-slate-100">Date</th>
                    <th className="px-6 py-4 border-b border-slate-100">Time</th>
                    <th className="px-6 py-4 border-b border-slate-100">Type</th>
                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((item) => (
                    <tr 
                      key={item.appointment_id} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {item.doctor_name || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDisplayDate(item.date)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatTimeLabel(item.start_time)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="capitalize">
                          {formatConsultationType(item.consultation_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ring-1 ring-inset ring-slate-200/50",
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
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <CalendarClock className="size-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No appointments found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                You haven't booked any appointments yet. Head over to the medical experts page to find a doctor.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
