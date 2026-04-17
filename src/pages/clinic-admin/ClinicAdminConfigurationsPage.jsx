import { Building2, Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialProfile = {
  clinicName: "MedStream Colombo Care",
  contactEmail: "clinic.admin@medstream.lk",
  phone: "+94 11 255 7788",
  address: "12 Hospital Road, Colombo 05",
  about: "Multi-disciplinary outpatient care center focused on fast triage and telemedicine follow-ups.",
};

export default function ClinicAdminConfigurationsPage() {
  const [form, setForm] = useState(initialProfile);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success("Dummy save: clinic profile updated.");
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
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Email</label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(event) => handleChange("contactEmail", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input value={form.phone} onChange={(event) => handleChange("phone", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <Input value={form.address} onChange={(event) => handleChange("address", event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">About Clinic</label>
            <textarea
              rows={4}
              value={form.about}
              onChange={(event) => handleChange("about", event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="size-4" />
              Update clinic profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
