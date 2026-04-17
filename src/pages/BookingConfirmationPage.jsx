import { CalendarDays, CheckCircle2, Clock3, CreditCard, Hospital, UserRound, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import CancelAppointmentModal from "@/components/appointments/CancelAppointmentModal";
import RescheduleAppointmentModal from "@/components/appointments/RescheduleAppointmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  extractApiErrorMessage,
  formatConsultationType,
  formatCurrencyLkr,
  formatDisplayDate,
  formatTimeLabel,
} from "@/lib/appointment-utils";
import { cancelAppointment, rescheduleAppointment } from "@/services/appointments";
import { initiatePayment } from "@/services/payments";

export default function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const clinic = state.clinic || null;

  const [appointment, setAppointment] = useState(state.appointment || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const isPendingPayment =
    (appointment.payment_status === "pending" || appointment.paymentStatus === "pending") &&
    (appointment.payment_id || appointment.paymentId || (appointment.consultation_fee > 0));

  const handlePayNow = async () => {
    const pid = appointment.payment_id || appointment.paymentId;
    if (!pid) {
      toast.error("Payment ID missing. Please contact support.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await initiatePayment(pid);
      if (result?.gateway_url) {
        window.location.href = result.gateway_url;
      } else {
        toast.error("Could not start payment. Please try again.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.detail || "Payment initiation failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async (payload) => {
    setIsSubmitting(true);
    try {
      const next = await rescheduleAppointment(appointment.appointment_id, payload);
      setAppointment(next);
      toast.success("Appointment rescheduled.");
      setShowRescheduleModal(false);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to reschedule appointment."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (reason) => {
    setIsSubmitting(true);
    try {
      const next = await cancelAppointment(appointment.appointment_id, reason ? { reason } : {});
      setAppointment((prev) => ({ ...prev, ...next }));
      toast.success("Appointment cancelled.");
      setShowCancelModal(false);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to cancel appointment."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      {isPendingPayment ? (
        <Card className="items-center gap-2 bg-background py-10 text-center">
          <AlertCircle className="size-14 text-amber-500" />
          <CardTitle className="text-4xl">Payment Required</CardTitle>
          <p className="max-w-xl text-muted-foreground">
            Your appointment has been reserved. Please complete payment to confirm your booking.
          </p>
          <Button
            className="mt-3"
            onClick={handlePayNow}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Redirecting…" : "Pay Now"}
          </Button>
        </Card>
      ) : (
        <Card className="items-center gap-2 bg-background py-10 text-center">
          <CheckCircle2 className="size-14 text-primary" />
          <CardTitle className="text-4xl">Booking Confirmed!</CardTitle>
          <p className="max-w-xl text-muted-foreground">
            Your appointment has been successfully scheduled. A confirmation email and calendar invite will be shared.
          </p>
        </Card>
      )}

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
            Consultation Type:{" "}
            <span className="font-medium text-foreground">
              {formatConsultationType(appointment.consultation_type || state.selectedType)}
            </span>
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
        <Button variant="outline" onClick={() => setShowRescheduleModal(true)} disabled={isSubmitting}>
          Reschedule
        </Button>
        <Button variant="destructive" onClick={() => setShowCancelModal(true)} disabled={isSubmitting}>
          Cancel Booking
        </Button>
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

      <RescheduleAppointmentModal
        key={`reschedule-${appointment?.appointment_id || "appointment"}`}
        open={showRescheduleModal}
        initialDate={appointment?.date || ""}
        initialStartTime={appointment?.start_time || ""}
        initialConsultationType={appointment?.consultation_type || "physical"}
        isSubmitting={isSubmitting}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleReschedule}
      />

      <CancelAppointmentModal
        key={`cancel-${appointment?.appointment_id || "appointment"}`}
        open={showCancelModal}
        title="Cancel this booking"
        confirmLabel="Cancel booking"
        isSubmitting={isSubmitting}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
      />
    </section>
  );
}
