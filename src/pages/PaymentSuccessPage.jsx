import { CheckCircle2, CalendarDays, Clock3, Hospital, UserRound, CreditCard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  formatConsultationType,
  formatCurrencyLkr,
  formatDisplayDate,
  formatTimeLabel,
} from "@/lib/appointment-utils";
import { getPaymentByAppointment } from "@/services/payments";
import api from "@/services/api";

const MAX_POLLS = 10;
const POLL_INTERVAL = 2000;

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState(() => sessionId ? "loading" : "confirmed");
  const [appointment, setAppointment] = useState(null);
  const [payment, setPayment] = useState(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    cancelledRef.current = false;

    let attempts = 0;
    let timerId;

    async function poll() {
      if (cancelledRef.current) return;
      attempts += 1;

      try {
        const { data: appointments } = await api.get("/appointments/appointments/my", {
          params: { page: 1, size: 5 },
        });

        if (cancelledRef.current) return;

        const items = appointments?.items || [];
        const recent = items[0];

        if (recent) {
          setAppointment(recent);

          try {
            const paymentData = await getPaymentByAppointment(recent.appointment_id);
            if (!cancelledRef.current) setPayment(paymentData);
          } catch {
            // Payment record may not be accessible
          }

          if (recent.payment_status === "paid" || recent.status === "confirmed") {
            if (!cancelledRef.current) setStatus("confirmed");
            return;
          }
        }
      } catch {
        // API error, keep polling
      }

      if (!cancelledRef.current && attempts < MAX_POLLS) {
        timerId = setTimeout(poll, POLL_INTERVAL);
      } else if (!cancelledRef.current) {
        setStatus("confirmed");
      }
    }

    poll();

    return () => {
      cancelledRef.current = true;
      clearTimeout(timerId);
    };
  }, [sessionId]);

  if (status === "loading") {
    return (
      <section className="mx-auto max-w-2xl space-y-5 py-8">
        <Card className="items-center gap-4 bg-background py-14 text-center">
          <Spinner className="size-10 text-primary" />
          <CardTitle className="text-2xl">Confirming your payment…</CardTitle>
          <p className="max-w-md text-sm text-muted-foreground">
            Please wait while we verify the payment with our system. This usually takes a few seconds.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5 py-8">
      {/* Hero card */}
      <Card className="items-center gap-3 bg-background py-10 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
          <CheckCircle2 className="relative size-16 text-emerald-500" />
        </div>
        <CardTitle className="text-3xl text-emerald-700">Payment Successful!</CardTitle>
        <p className="max-w-lg text-muted-foreground">
          Your payment has been processed successfully. Your appointment is now confirmed.
        </p>
      </Card>

      {/* Appointment details */}
      {appointment && (
        <Card className="gap-3 bg-background">
          <CardHeader className="border-b pb-4">
            <CardTitle>Appointment Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Reference: {appointment.appointment_id || "—"}
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 py-4 md:grid-cols-2">
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="size-4" />
              {appointment.doctor_name || "—"}
            </p>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              {formatDisplayDate(appointment.date)}
            </p>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" />
              {formatTimeLabel(appointment.start_time)}
            </p>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Hospital className="size-4" />
              {appointment.clinic_name || "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              Consultation Type:{" "}
              <span className="font-medium text-foreground">
                {formatConsultationType(appointment.consultation_type)}
              </span>
            </p>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="size-4" />
              Payment:{" "}
              <span className="font-medium text-emerald-600">
                {appointment.payment_status === "paid" ? "Paid" : "Processing"}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment summary */}
      {payment && (
        <Card className="gap-2 bg-emerald-50/50">
          <CardContent className="space-y-1 py-4 text-sm">
            <p className="text-muted-foreground">
              Amount Paid:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrencyLkr(payment.amount)}
              </span>
            </p>
            {payment.transaction_reference && (
              <p className="text-muted-foreground">
                Transaction ID:{" "}
                <span className="font-mono text-xs text-foreground">
                  {payment.transaction_reference}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link to="/patient/profile/appointments">View My Appointments</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/doctors">Book Another Appointment</Link>
        </Button>
      </div>
    </section>
  );
}
