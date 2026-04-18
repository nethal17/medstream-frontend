import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import api from "@/services/api";
import { getPaymentByAppointment, initiatePayment } from "@/services/payments";

export default function PaymentCancelPage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    // Try to find the most recent pending-payment appointment for this patient
    async function loadRecentAppointment() {
      try {
        const { data } = await api.get("/appointments/appointments", {
          params: { page: 1, size: 5 },
        });
        const items = data?.items || [];
        const pending = items.find(
          (a) => a.payment_status === "pending" || a.payment_status === "processing"
        );
        if (pending) {
          setAppointment(pending);
          try {
            const payment = await getPaymentByAppointment(pending.appointment_id);
            setPaymentId(payment.payment_id);
          } catch {
            // Payment not found — can still show the page
          }
        }
      } catch {
        // Silently fail
      }
    }

    loadRecentAppointment();
  }, []);

  const handleRetry = async () => {
    if (!paymentId) {
      toast.error("No payment found to retry. Please book again.");
      return;
    }

    setIsRetrying(true);

    try {
      const result = await initiatePayment(paymentId);
      if (result?.gateway_url) {
        window.location.href = result.gateway_url;
      } else {
        toast.error("Unable to start payment. Please try again.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.detail || "Payment initiation failed. Please try again.";
      toast.error(message);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-5 py-8">
      {/* Hero card */}
      <Card className="items-center gap-3 bg-background py-10 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20" />
          <XCircle className="relative size-16 text-amber-500" />
        </div>
        <CardTitle className="text-3xl text-amber-700">Payment Cancelled</CardTitle>
        <p className="max-w-lg text-muted-foreground">
          Your payment was not completed. Don&apos;t worry — your appointment slot is still
          reserved and you can retry the payment.
        </p>
      </Card>

      {/* Appointment info */}
      {appointment && (
        <Card className="gap-2 bg-amber-50/50">
          <CardContent className="space-y-1 py-4 text-sm">
            <p className="text-muted-foreground">
              Doctor:{" "}
              <span className="font-medium text-foreground">{appointment.doctor_name}</span>
            </p>
            <p className="text-muted-foreground">
              Appointment ID:{" "}
              <span className="font-mono text-xs text-foreground">
                {appointment.appointment_id}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button onClick={handleRetry} disabled={isRetrying || !paymentId}>
          {isRetrying ? (
            <>
              <Spinner className="mr-2 size-4" />
              Retrying…
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 size-4" />
              Retry Payment
            </>
          )}
        </Button>

        <Button variant="outline" asChild>
          <Link to="/doctors">
            <ArrowLeft className="mr-2 size-4" />
            Return to Search
          </Link>
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        If you continue to experience issues, please contact our support team.
      </p>
    </section>
  );
}
