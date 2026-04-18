import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Calendar, Clock, ArrowRight } from "lucide-react";
import { confirmFollowUp } from "@/services/appointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function FollowUpConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const suggestionId = searchParams.get("suggestion_id");
  
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!suggestionId) {
      setStatus("error");
      setErrorMessage("No suggestion ID provided.");
      return;
    }

    async function handleConfirmation() {
      try {
        const result = await confirmFollowUp(suggestionId);
        setAppointmentDetails(result);
        setStatus("success");
        toast.success("Follow-up appointment confirmed!");
      } catch (error) {
        console.error("Confirmation error:", error);
        setStatus("error");
        setErrorMessage(error.response?.data?.detail || "Failed to confirm follow-up appointment. It may have already been confirmed or expired.");
      }
    }

    handleConfirmation();
  }, [suggestionId]);

  return (
    <div className="container flex min-h-[calc(100vh-80px)] items-center justify-center py-10">
      <Card className="w-full max-w-md border-slate-200/60 shadow-xl shadow-slate-200/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8 text-emerald-500" />}
            {status === "error" && <XCircle className="h-8 w-8 text-rose-500" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {status === "loading" && "Confirming Appointment..."}
            {status === "success" && "Booking Confirmed!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we finalize your follow-up session."}
            {status === "success" && "Your follow-up has been successfully scheduled."}
            {status === "error" && (errorMessage || "Something went wrong during confirmation.")}
          </CardDescription>
        </CardHeader>

        {status === "success" && appointmentDetails && (
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                  <Calendar className="size-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-slate-900">{appointmentDetails.appointment_date || "Confirmed Date"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                  <Clock className="size-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Time</p>
                  <p className="text-sm font-semibold text-slate-900">{appointmentDetails.start_time || "Confirmed Time"}</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-center text-slate-500 px-4">
              A confirmation email has been sent to your inbox with full details and instructions.
            </p>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-3 pt-6">
          {status === "success" ? (
            <Button className="w-full shadow-lg shadow-primary/20" asChild>
              <Link to="/patient/profile/appointments">
                Go to My Appointments <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          ) : status === "error" ? (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/patient/profile/appointments">
                Return to Dashboard
              </Link>
            </Button>
          ) : null}
          
          <Button variant="ghost" className="w-full text-slate-500" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
