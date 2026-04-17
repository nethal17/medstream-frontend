import { Save, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const defaultProfile = {
  fullName: "Nimal Perera",
  email: "nimal.perera@mail.com",
  phone: "+94 77 112 2334",
  dateOfBirth: "1994-08-17",
  address: "24 Lake View Road, Colombo 03",
};

export default function PatientProfileSetupPage() {
  const [form, setForm] = useState(defaultProfile);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success("Dummy save: patient profile updated.");
  };

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
              <Input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => updateField("dateOfBirth", event.target.value)}
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
            <Button type="submit">
              <Save className="size-4" />
              Save Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
