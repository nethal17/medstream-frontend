import {
  BadgeCheck,
  CalendarCheck2,
  Stethoscope,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage, formatConsultationType, formatCurrencyLkr } from "@/lib/appointment-utils";
import { getDoctorMe } from "@/services/doctors";

export default function DoctorOverviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDoctorProfile() {
      setIsLoading(true);
      setError("");

      try {
        const payload = await getDoctorMe({ date: selectedDate });

        if (ignore) {
          return;
        }

        setProfile(payload || null);
      } catch (requestError) {
        if (ignore) {
          return;
        }

        setProfile(null);
        setError(extractApiErrorMessage(requestError, "Unable to load doctor overview."));
        toast.error(extractApiErrorMessage(requestError, "Unable to load doctor overview."));
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadDoctorProfile();

    return () => {
      ignore = true;
    };
  }, [selectedDate]);

  useEffect(() => {
    const completion = location.state?.consultationComplete;
    if (!completion?.appointmentId) {
      return;
    }

    if (completion.hasNotificationFailure) {
      toast.success(`Consultation ${completion.appointmentId} completed. Some notifications may be delayed.`);
    } else {
      toast.success(`Consultation ${completion.appointmentId} completed. In-app notifications and email sent.`);
    }

    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  const clinicAssignments = useMemo(() => {
    return Array.isArray(profile?.clinics) ? profile.clinics : [];
  }, [profile]);

  const summary = useMemo(() => {
    const clinicsWithSlots = clinicAssignments.filter((item) => item?.has_slots).length;
    const totalSlots = clinicAssignments.reduce(
      (total, item) => total + (Array.isArray(item?.available_slots) ? item.available_slots.length : 0),
      0
    );

    return {
      clinicsCount: clinicAssignments.length,
      clinicsWithSlots,
      totalSlots,
      profileComplete: Boolean(profile?.profile_complete),
    };
  }, [clinicAssignments, profile?.profile_complete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-rose-200 bg-rose-50 shadow-sm">
        <CardContent className="p-6 text-sm text-rose-700">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="inline-flex items-center gap-2 text-xl">
              <CalendarCheck2 className="size-5 text-primary" />
              Doctor Overview
            </CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              Loaded through `GET /doctors/me`.
            </p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-600">Doctor</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.full_name || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-600">Specialization</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.specialization || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-600">Assigned Clinics</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{summary.clinicsCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-600">Available Slots</p>
            <p className="mt-2 text-lg font-semibold text-emerald-700">{summary.totalSlots}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <Stethoscope className="size-5 text-primary" />
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Verification</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
              <BadgeCheck className="size-4 text-emerald-600" />
              {profile?.verification_status || "Unknown"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Consultation Mode</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {formatConsultationType(profile?.consultation_mode)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Consultation Fee</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {formatCurrencyLkr(profile?.consultation_fee)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Registration No</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {profile?.medical_registration_no || "-"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Experience</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {profile?.experience_years ? `${profile.experience_years} years` : "-"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Profile Complete</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{summary.profileComplete ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2 xl:col-span-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Qualifications</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{profile?.qualifications || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2 xl:col-span-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Bio</p>
            <p className="mt-2 text-sm text-slate-700">{profile?.bio || "No bio added yet."}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
