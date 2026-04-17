import { Save, Settings2, Stethoscope } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const telemedicineDefaults = {
  telemedicineEnabled: "enabled",
  appointmentPrice: "7500",
  currency: "LKR",
};

const profileDefaults = {
  fullName: "Dr. Nadun Wijesekara",
  specialty: "General Physician",
  registrationNo: "SLMC-48291",
  experience: "11",
  bio: "Focused on preventive care and chronic disease management with hybrid consultations.",
};

export default function DoctorConfigurationsPage() {
  const [selectedConfig, setSelectedConfig] = useState("telemedicine");
  const [telemedicine, setTelemedicine] = useState(telemedicineDefaults);
  const [profile, setProfile] = useState(profileDefaults);

  const saveTelemedicine = (event) => {
    event.preventDefault();
    toast.success("Dummy save: telemedicine and pricing updated.");
  };

  const saveProfile = (event) => {
    event.preventDefault();
    toast.success("Dummy save: profile setup updated.");
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <Settings2 className="size-5 text-primary" />
          Configurations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Configuration section</label>
          <select
            value={selectedConfig}
            onChange={(event) => setSelectedConfig(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm md:w-[360px]"
          >
            <option value="telemedicine">Telemedicine availability and appointment price</option>
            <option value="profile">Profile setup</option>
          </select>
        </div>

        {selectedConfig === "telemedicine" ? (
          <form onSubmit={saveTelemedicine} className="space-y-4 rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">Telemedicine availability and pricing</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Telemedicine</label>
                <select
                  value={telemedicine.telemedicineEnabled}
                  onChange={(event) =>
                    setTelemedicine((prev) => ({ ...prev, telemedicineEnabled: event.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Price per appointment</label>
                <Input
                  type="number"
                  min="0"
                  value={telemedicine.appointmentPrice}
                  onChange={(event) =>
                    setTelemedicine((prev) => ({ ...prev, appointmentPrice: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Currency</label>
                <Input
                  value={telemedicine.currency}
                  onChange={(event) => setTelemedicine((prev) => ({ ...prev, currency: event.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="size-4" />
                Save telemedicine settings
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
                <Input
                  value={profile.fullName}
                  onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Specialty</label>
                <Input
                  value={profile.specialty}
                  onChange={(event) => setProfile((prev) => ({ ...prev, specialty: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Registration No</label>
                <Input
                  value={profile.registrationNo}
                  onChange={(event) => setProfile((prev) => ({ ...prev, registrationNo: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Experience (years)</label>
                <Input
                  type="number"
                  min="0"
                  value={profile.experience}
                  onChange={(event) => setProfile((prev) => ({ ...prev, experience: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Profile Bio</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="size-4" />
                Save profile setup
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
