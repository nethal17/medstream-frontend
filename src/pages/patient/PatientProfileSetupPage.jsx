import { Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage, toApiDate } from "@/lib/appointment-utils";
import { getCurrentUserProfile } from "@/services/auth";
import { getPatientProfileByUserId, updatePatientProfile } from "@/services/patients";

const defaultProfile = {
  full_name: "",
  dob: "",
  gender: "",
  nic_passport: "",
  phone: "",
  address: "",
  emergency_contact: "",
  blood_group: "",
  profile_image_url: "",
};

const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientProfileSetupPage() {
  const [form, setForm] = useState(defaultProfile);
  const [patientId, setPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let ignore = false;

    async function loadPatientProfile() {
      setIsLoading(true);
      try {
        const authUser = await getCurrentUserProfile();
        const userId = authUser?.user_id || authUser?.id;

        if (!userId) {
          throw new Error("Authenticated user id not found.");
        }

        const profile = await getPatientProfileByUserId(userId);

        if (ignore) {
          return;
        }

        setPatientId(profile?.patient_id || "");
        setForm({
          full_name: profile?.full_name || "",
          dob: toApiDate(profile?.dob) || "",
          gender: profile?.gender || "",
          nic_passport: profile?.nic_passport || "",
          phone: profile?.phone || "",
          address: profile?.address || "",
          emergency_contact: profile?.emergency_contact || "",
          blood_group: profile?.blood_group || "",
          profile_image_url: profile?.profile_image_url || "",
        });
      } catch (error) {
        if (!ignore) {
          toast.error(extractApiErrorMessage(error, "Unable to load patient profile."));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadPatientProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!patientId) {
      toast.error("Patient profile not found.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        full_name: form.full_name || undefined,
        dob: form.dob || null,
        gender: form.gender || null,
        nic_passport: form.nic_passport || null,
        phone: form.phone || null,
        address: form.address || null,
        emergency_contact: form.emergency_contact || null,
        blood_group: form.blood_group || null,
        profile_image_url: form.profile_image_url || null,
      };

      const updated = await updatePatientProfile(patientId, payload);
      setForm((prev) => ({
        ...prev,
        full_name: updated?.full_name || prev.full_name,
        dob: toApiDate(updated?.dob) || "",
        gender: updated?.gender || "",
        nic_passport: updated?.nic_passport || "",
        phone: updated?.phone || "",
        address: updated?.address || "",
        emergency_contact: updated?.emergency_contact || "",
        blood_group: updated?.blood_group || "",
        profile_image_url: updated?.profile_image_url || "",
      }));

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to update profile."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <UserRound className="size-5 text-primary" />
          Profile Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <Input value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <Input type="date" value={form.dob} onChange={(event) => updateField("dob", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="0761234567" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Gender</label>
              <select
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">NIC/Passport</label>
              <Input
                value={form.nic_passport}
                onChange={(event) => updateField("nic_passport", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Emergency Contact</label>
              <Input
                value={form.emergency_contact}
                onChange={(event) => updateField("emergency_contact", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blood Group</label>
              <select
                value={form.blood_group}
                onChange={(event) => updateField("blood_group", event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select blood group</option>
                {bloodGroupOptions.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Profile Image URL</label>
              <Input
                value={form.profile_image_url}
                onChange={(event) => updateField("profile_image_url", event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Address</label>
            <textarea
              rows={3}
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="size-4" />
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
