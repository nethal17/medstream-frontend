import { CalendarDays, CheckCircle2, Clock3, CreditCard, Hospital, UserRound } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatConsultationType,
  formatCurrencyLkr,
  formatDisplayDate,
  formatTimeLabel,
} from "@/lib/appointment-utils";

export default function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const appointment = state.appointment || null;
  const clinic = state.clinic || null;

  useEffect(() => {
    if (!appointment) {
      toast("Please complete booking first.");
      navigate("/doctors", { replace: true });
    }
  }, [appointment, navigate]);

  if (!appointment) {
    return null;
  }

  const date = appointment.date || state.selectedDate;
  const startTime = appointment.start_time || state.selectedStartTime;
  const doctorName = appointment.doctor_name || state.doctor?.full_name || "-";
  const clinicName = appointment.clinic_name || clinic?.clinic_name || "-";

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <Card className="items-center gap-2 bg-background py-10 text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <CardTitle className="text-4xl">Booking Confirmed!</CardTitle>
        <p className="max-w-xl text-muted-foreground">
          Your appointment has been successfully scheduled. A confirmation email and calendar invite will be shared.
        </p>
      </Card>

      <Card className="gap-3 bg-background">
        <CardHeader className="border-b pb-4">
          <CardTitle>Appointment Summary</CardTitle>
          <p className="text-sm text-muted-foreground">Reference: {appointment.appointment_id || "Pending"}</p>
        </CardHeader>
        <CardContent className="grid gap-4 py-4 md:grid-cols-2">
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="size-4" />
            {doctorName}
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            {formatDisplayDate(date)}
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            {formatTimeLabel(startTime)}
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Hospital className="size-4" />
            {clinicName}
          </p>
          <p className="text-sm text-muted-foreground">
            Consultation Type: <span className="font-medium text-foreground">{formatConsultationType(appointment.consultation_type || state.selectedType)}</span>
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="size-4" />
            Payment: {appointment.payment_status || "pending"}
          </p>
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium text-foreground">{appointment.status || "pending"}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Fee: <span className="font-medium text-foreground">{formatCurrencyLkr(appointment.consultation_fee)}</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button variant="outline">Add to Calendar</Button>
        <Button variant="outline">Reschedule</Button>
        <Button variant="destructive">Cancel Booking</Button>
      </div>

      <Card className="gap-2 bg-primary/5">
        <CardContent className="py-5 text-sm text-muted-foreground">
          {appointment.message || "You can manage this appointment from your appointments section."}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4 text-sm">
        <Button variant="link" asChild>
          <Link to="/doctors">Return to Search</Link>
        </Button>
      </div>
    </section>
  );
}
