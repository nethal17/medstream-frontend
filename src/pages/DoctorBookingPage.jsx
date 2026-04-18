import {
  CalendarDays,
  CircleAlert,
  Clock3,
  Hospital,
  MapPin,
  Stethoscope,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  extractApiErrorMessage,
  formatConsultationType,
  formatCurrencyLkr,
  formatDisplayDate,
  formatTimeLabel,
  generateIdempotencyKey,
  toApiDate,
} from "@/lib/appointment-utils";
import { bookAppointment, getDoctorProfile } from "@/services/appointments";
import { initiatePayment } from "@/services/payments";

function getClinicTypes(clinic) {
  const set = new Set();

  if (!clinic?.availability) {
    return [];
  }

  clinic.availability.forEach((entry) => {
    if (entry.consultation_type) {
      set.add(entry.consultation_type);
    }
  });

  return Array.from(set);
}

function getClinicSlotsByType(clinic, consultationType) {
  if (!clinic) {
    return [];
  }

  const fromAvailability = Array.isArray(clinic.availability)
    ? clinic.availability
        .filter((entry) => !consultationType || entry.consultation_type === consultationType)
        .flatMap((entry) => entry.available_slots || entry.slots || [])
    : [];

  const baseSlots = clinic.available_slots || [];
  const merged = fromAvailability.length > 0 ? fromAvailability : baseSlots;
  const seen = new Set();

  return merged.filter((slot) => {
    const key = `${slot?.start_time || ""}-${slot?.end_time || ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export default function DoctorBookingPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [error, setError] = useState("");

  const selectedDate = searchParams.get("date") || toApiDate(new Date());
  const preferredType = searchParams.get("consultation_type") || "";
  const preferredClinicId = searchParams.get("clinic_id") || "";
  const preferredStartTime = searchParams.get("start_time") || "";

  const [selectedClinicId, setSelectedClinicId] = useState(preferredClinicId);
  const [selectedType, setSelectedType] = useState(preferredType || "physical");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const idempotencyKey = useMemo(() => generateIdempotencyKey(), []);

  const loadProfile = useCallback(async () => {
    if (!doctorId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = await getDoctorProfile(doctorId, selectedDate);
      setDoctorProfile(payload);

      const clinics = payload?.clinics || [];
      const fallbackClinic = clinics.find((clinicItem) => clinicItem.has_slots) || clinics[0];
      const nextClinicId =
        selectedClinicId && clinics.some((item) => item.clinic?.clinic_id === selectedClinicId)
          ? selectedClinicId
          : fallbackClinic?.clinic?.clinic_id || "";

      setSelectedClinicId(nextClinicId);

      const selectedClinic = clinics.find((item) => item.clinic?.clinic_id === nextClinicId);
      const availableTypes = getClinicTypes(selectedClinic);
      const nextType =
        selectedType && availableTypes.includes(selectedType)
          ? selectedType
          : availableTypes[0] || preferredType || "physical";

      setSelectedType(nextType);

      const nextSlots = getClinicSlotsByType(selectedClinic, nextType);
      const canKeepPreferredStart = nextSlots.some((slot) => slot?.start_time === preferredStartTime);
      setSelectedStartTime(canKeepPreferredStart ? preferredStartTime : "");
    } catch (requestError) {
      setDoctorProfile(null);
      setError("Unable to load doctor details.");
      toast.error("Could not fetch doctor profile.");
      console.error(requestError);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, preferredStartTime, preferredType, selectedClinicId, selectedDate, selectedType]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const clinics = doctorProfile?.clinics || [];
  const selectedClinic = clinics.find((clinicItem) => clinicItem.clinic?.clinic_id === selectedClinicId) || null;
  const clinicTypes = getClinicTypes(selectedClinic);
  const slots = useMemo(
    () => getClinicSlotsByType(selectedClinic, selectedType),
    [selectedClinic, selectedType]
  );

  const canBook = Boolean(selectedClinicId && selectedType && selectedStartTime);

  const updateDate = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set("date", value);
    setSearchParams(next);
  };

  const updateClinic = (clinicId) => {
    setSelectedClinicId(clinicId);
    setSelectedStartTime("");

    const next = new URLSearchParams(searchParams);
    next.set("clinic_id", clinicId);
    setSearchParams(next);
  };

  const updateType = (type) => {
    setSelectedType(type);
    setSelectedStartTime("");

    const next = new URLSearchParams(searchParams);
    next.set("consultation_type", type);
    setSearchParams(next);
  };

  const handleConfirmBooking = async () => {
    if (!doctorId || !canBook) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingPayload = {
        doctor_id: doctorId,
        clinic_id: selectedClinicId,
        date: selectedDate,
        start_time: selectedStartTime,
        consultation_type: selectedType,
      };

      const appointment = await bookAppointment(bookingPayload, idempotencyKey);

      // If payment is required, redirect to Stripe Checkout
      if (
        appointment.payment_status === "pending" &&
        appointment.payment_id
      ) {
        toast.success("Appointment created. Redirecting to payment…");

        try {
          const paymentResult = await initiatePayment(appointment.payment_id);

          if (paymentResult?.gateway_url) {
            window.location.href = paymentResult.gateway_url;
            return;
          }
        } catch (paymentError) {
          // Payment initiation failed — still take to confirmation page
          // so the user can retry from there
          console.error("Payment initiation failed:", paymentError);
          toast.error("Could not start payment. You can retry from the confirmation page.");
        }
      } else {
        toast.success("Appointment request submitted.");
      }

      navigate("/doctors/confirmation", {
        state: {
          appointment,
          doctor: doctorProfile,
          clinic: selectedClinic?.clinic,
          selectedDate,
          selectedStartTime,
          selectedType,
        },
      });
    } catch (requestError) {
      const status = requestError?.response?.status;

      if (status === 409) {
        toast.error("This slot is already booked. Please choose another time.");
        await loadProfile();
      } else if (status === 422) {
        toast.error(extractApiErrorMessage(requestError, "Selected slot is invalid for this consultation type."));
      } else {
        toast.error("Booking failed. Please try again.");
      }

      console.error(requestError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border bg-background p-12">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (error || !doctorProfile) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <CircleAlert className="mx-auto mb-3 size-10 text-destructive" />
          <p className="font-semibold">{error || "Doctor profile not found."}</p>
          <Button className="mt-4" asChild>
            <Link to="/doctors">Back to Doctors</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
      <div className="space-y-5">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to="/doctors">Back to Search Results</Link>
        </Button>

        <Card className="gap-3 bg-background">
          <CardHeader>
            <CardTitle className="text-3xl">{doctorProfile.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {doctorProfile.experience_years || 0}+ years experience
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{doctorProfile.bio || "No profile bio available."}</p>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Stethoscope className="size-4" />
              Consultation Fee: {formatCurrencyLkr(doctorProfile.consultation_fee)}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-3 bg-background">
          <CardHeader>
            <CardTitle>Select Appointment Date</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => updateDate(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm md:w-64"
            />
          </CardContent>
        </Card>

        <Card className="gap-3 bg-background">
          <CardHeader>
            <CardTitle>Select Clinic</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {clinics.map((clinicItem) => {
              const clinic = clinicItem.clinic;
              const active = clinic?.clinic_id === selectedClinicId;

              return (
                <button
                  key={clinic?.clinic_id}
                  type="button"
                  onClick={() => updateClinic(clinic?.clinic_id || "")}
                  className={[
                    "rounded-md border p-3 text-left transition",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/60",
                  ].join(" ")}
                >
                  <p className="font-medium">{clinic?.clinic_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{clinic?.address}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="gap-3 bg-background">
          <CardHeader>
            <CardTitle>Consultation Type</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {clinicTypes.map((type) => {
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateType(type)}
                  className={[
                    "rounded-md border p-3 text-left text-sm transition",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/60",
                  ].join(" ")}
                >
                  <p className="inline-flex items-center gap-2 font-medium">
                    {type === "telemedicine" ? <Video className="size-4" /> : <Hospital className="size-4" />}
                    {formatConsultationType(type)}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="gap-3 bg-background">
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {slots.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => {
                  const active = selectedStartTime === slot.start_time;

                  return (
                    <button
                      key={`${slot.start_time}-${slot.end_time}`}
                      type="button"
                      onClick={() => setSelectedStartTime(slot.start_time)}
                      className={[
                        "rounded-md border p-2 text-sm transition",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60",
                      ].join(" ")}
                    >
                      {formatTimeLabel(slot.start_time)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No slots available for this date and clinic.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit gap-4 bg-background lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="inline-flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            {formatDisplayDate(selectedDate)}
          </p>
          <p className="inline-flex items-center gap-2 text-muted-foreground">
            <Clock3 className="size-4" />
            {selectedStartTime ? formatTimeLabel(selectedStartTime) : "Choose a time"}
          </p>
          <p className="inline-flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            {selectedClinic?.clinic?.clinic_name || "Choose a clinic"}
          </p>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-muted-foreground">Total Amount</p>
            <p className="text-xl font-semibold">{formatCurrencyLkr(doctorProfile.consultation_fee)}</p>
          </div>

          <Button className="w-full" disabled={!canBook || isSubmitting} onClick={handleConfirmBooking}>
            {isSubmitting ? "Confirming..." : "Confirm Booking"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Booking uses idempotency protection to avoid duplicate appointments.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
