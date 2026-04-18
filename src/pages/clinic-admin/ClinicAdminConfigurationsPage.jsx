import { Building2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getClinicIdFromToken, decodeJwtPayload } from "@/lib/auth";
import { getUserClinic } from "@/services/clinicStaff";
import { getClinic, updateClinic } from "@/services/clinics";

const initialProfile = {
  clinicName: "",
  contactEmail: "",
  phone: "",
  address: "",
};

export default function ClinicAdminConfigurationsPage() {
  const [form, setForm] = useState(initialProfile);
  const [clinicId, setClinicId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadClinicProfile() {
      try {
        const accessToken = window?.localStorage?.getItem("medstream_access_token") || "";
        const tokenClinicId = accessToken ? getClinicIdFromToken(accessToken) || decodeJwtPayload(accessToken)?.clinic_id || decodeJwtPayload(accessToken)?.clinicId : null;

        const assignment = tokenClinicId
          ? { clinic_id: tokenClinicId }
          : await getUserClinic();

        setClinicId(assignment.clinic_id);

        const clinic = await getClinic(assignment.clinic_id);
        setForm({
          clinicName: clinic.clinic_name || "",
          contactEmail: clinic.email || "",
          phone: clinic.phone || "",
          address: clinic.address || "",
        });
      } catch {
        toast.error("Unable to load clinic details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadClinicProfile();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!clinicId) {
      toast.error("Clinic not loaded yet.");
      return;
    }

    setIsSaving(true);
    try {
      await updateClinic(clinicId, {
        clinic_name: form.clinicName,
        phone: form.phone,
        address: form.address,
      });
      toast.success("Clinic profile updated.");
    } catch {
      toast.error("Unable to update clinic profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <Building2 className="size-5 text-primary" />
          Configurations - Clinic Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Clinic Name</label>
              <Input
                value={form.clinicName}
                onChange={(event) => handleChange("clinicName", event.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Email</label>
              <Input type="email" value={form.contactEmail} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <Input
                value={form.address}
                onChange={(event) => handleChange("address", event.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || isSaving}>
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Update clinic profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
