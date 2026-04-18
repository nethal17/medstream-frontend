import { Save, Settings2, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import {
  getDoctorMe,
  updateMyConsultationFee,
  updateMyDoctorProfile,
} from "@/services/doctors";

const telemedicineDefaults = {
  consultation_mode: "physical",
  consultation_fee: "",
};

const specializationOptions = [
  "Cardiology",
  "General Practice",
  "Pediatrics",
  "Dermatology",
  "Neurology",
  "Orthopaedics",
  "Psychiatry",
  "Endocrinology",
  "Obstetrics",
  "Gynaecology",
];

const OTHER_SPECIALIZATION = "__other__";

const profileDefaults = {
  full_name: "",
  specialization: "",
  specialization_other: "",
  medical_registration_no: "",
  experience_years: "",
  qualifications: "",
  bio: "",
  profile_image_url: "",
};

function buildProfileState(profile) {
  const specialization = profile?.specialization || "";

  return {
    full_name: profile?.full_name || "",
    specialization: specializationOptions.includes(specialization)
      ? specialization
      : specialization
        ? OTHER_SPECIALIZATION
        : "",
    specialization_other: specializationOptions.includes(specialization) ? "" : specialization,
    medical_registration_no: profile?.medical_registration_no || "",
    experience_years: profile?.experience_years != null ? String(profile.experience_years) : "",
    qualifications: profile?.qualifications || "",
    bio: profile?.bio || "",
    profile_image_url: profile?.profile_image_url || "",
  };
}

export default function DoctorConfigurationsPage() {
  const [selectedConfig, setSelectedConfig] = useState("telemedicine");
  const [telemedicine, setTelemedicine] = useState(telemedicineDefaults);
  const [profile, setProfile] = useState(profileDefaults);
  const [meta, setMeta] = useState({
    verification_status: "",
    profile_complete: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingTelemedicine, setIsSubmittingTelemedicine] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDoctorProfile() {
      setIsLoading(true);
      setError("");

      try {
        const payload = await getDoctorMe();

        if (ignore) {
          return;
        }

        setTelemedicine({
          consultation_mode: payload?.consultation_mode || "physical",
          consultation_fee: payload?.consultation_fee != null ? String(payload.consultation_fee) : "",
        });
        setProfile(buildProfileState(payload));
        setMeta({
          verification_status: payload?.verification_status || "",
          profile_complete: Boolean(payload?.profile_complete),
        });
      } catch (requestError) {
        if (ignore) {
          return;
        }

        setError(extractApiErrorMessage(requestError, "Unable to load doctor configuration."));
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
  }, []);

  const refreshProfile = async () => {
    const payload = await getDoctorMe();
    setTelemedicine({
      consultation_mode: payload?.consultation_mode || "physical",
      consultation_fee: payload?.consultation_fee != null ? String(payload.consultation_fee) : "",
    });
    setProfile(buildProfileState(payload));
    setMeta({
      verification_status: payload?.verification_status || "",
      profile_complete: Boolean(payload?.profile_complete),
    });
  };

  const saveTelemedicine = async (event) => {
    event.preventDefault();

    setIsSubmittingTelemedicine(true);

    try {
      await updateMyDoctorProfile({
        consultation_mode: telemedicine.consultation_mode,
      });
      if (telemedicine.consultation_fee !== "") {
        await updateMyConsultationFee(Number(telemedicine.consultation_fee));
      }
      await refreshProfile();
      toast.success("Consultation settings updated.");
    } catch (requestError) {
      toast.error(extractApiErrorMessage(requestError, "Unable to update consultation settings."));
    } finally {
      setIsSubmittingTelemedicine(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    setIsSubmittingProfile(true);

    try {
      await updateMyDoctorProfile({
        full_name: profile.full_name || undefined,
        specialization: resolvedSpecialization || undefined,
        medical_registration_no: profile.medical_registration_no || undefined,
        experience_years: profile.experience_years === "" ? null : Number(profile.experience_years),
        qualifications: profile.qualifications || undefined,
        bio: profile.bio || undefined,
        profile_image_url: profile.profile_image_url || null,
      });
      await refreshProfile();
      toast.success("Profile updated successfully.");
    } catch (requestError) {
      toast.error(extractApiErrorMessage(requestError, "Unable to update doctor profile."));
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const updateProfileField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const resolvedSpecialization =
    profile.specialization === OTHER_SPECIALIZATION ? profile.specialization_other.trim() : profile.specialization;

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
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <Settings2 className="size-5 text-primary" />
          Configurations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-800">Profile status</p>
          <p className="mt-1 text-sm text-slate-600">
            Verification: {meta.verification_status || "unknown"} · Profile complete: {meta.profile_complete ? "yes" : "no"}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Configuration section</label>
          <select
            value={selectedConfig}
            onChange={(event) => setSelectedConfig(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm md:w-[360px]"
          >
            <option value="telemedicine">Consultation mode and pricing</option>
            <option value="profile">Profile setup</option>
          </select>
        </div>

        {selectedConfig === "telemedicine" ? (
          <form onSubmit={saveTelemedicine} className="space-y-4 rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">Consultation mode and pricing</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Consultation mode</label>
                <select
                  value={telemedicine.consultation_mode}
                  onChange={(event) =>
                    setTelemedicine((prev) => ({ ...prev, consultation_mode: event.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="physical">In-person</option>
                  <option value="telemedicine">Telemedicine</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Consultation fee</label>
                <Input
                  type="number"
                  min="0"
                  value={telemedicine.consultation_fee}
                  onChange={(event) =>
                    setTelemedicine((prev) => ({ ...prev, consultation_fee: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmittingTelemedicine}>
                <Save className="size-4" />
                {isSubmittingTelemedicine ? "Saving..." : "Save consultation settings"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="size-4 text-primary" />
              <p className="text-sm font-semibold text-slate-800">Profile setup</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <Input value={profile.full_name} onChange={(event) => updateProfileField("full_name", event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Specialization</label>
                <select
                  value={profile.specialization}
                  onChange={(event) => updateProfileField("specialization", event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select specialization</option>
                  {specializationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value={OTHER_SPECIALIZATION}>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Primary specialization</label>
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Managed by the backend from the selected specialization.
                </p>
              </div>
              {profile.specialization === OTHER_SPECIALIZATION ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Other specialization</label>
                  <Input
                    value={profile.specialization_other}
                    onChange={(event) => updateProfileField("specialization_other", event.target.value)}
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Registration No</label>
                <Input
                  value={profile.medical_registration_no}
                  onChange={(event) => updateProfileField("medical_registration_no", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Experience (years)</label>
                <Input
                  type="number"
                  min="0"
                  value={profile.experience_years}
                  onChange={(event) => updateProfileField("experience_years", event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Qualifications</label>
                <Input
                  value={profile.qualifications}
                  onChange={(event) => updateProfileField("qualifications", event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Profile image URL</label>
                <Input
                  value={profile.profile_image_url}
                  onChange={(event) => updateProfileField("profile_image_url", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Profile Bio</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(event) => updateProfileField("bio", event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmittingProfile}>
                <Save className="size-4" />
                {isSubmittingProfile ? "Saving..." : "Save profile setup"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
