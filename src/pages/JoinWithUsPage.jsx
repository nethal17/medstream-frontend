import { Building2, CheckCircle2, Handshake, Sparkles, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import PatientNavbar from "@/components/patient-navbar";
import PatientFooter from "@/components/patient-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { sendJoinWithUsRequest } from "@/services/notifications";

const navItems = [
  { label: "Find Doctors", to: "/doctors" },
  { label: "Clinics", to: "/join-with-us" },
  { label: "Join With Us", to: "/join-with-us" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "Help", href: "#footer" },
];

const benefits = [
  "Increase clinic visibility to active patients searching by specialty.",
  "Reduce no-shows with reminders and centralized appointment management.",
  "Offer in-person and telemedicine consultations from one platform.",
  "Improve staff coordination with clean, role-based operational dashboards.",
];

const initialFormState = {
  clinicEmail: "",
  clinicName: "",
  clinicPhone: "",
  contactPerson: "",
};

export default function JoinWithUsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(initialFormState);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.clinicEmail || !form.clinicName || !form.clinicPhone || !form.contactPerson) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      await sendJoinWithUsRequest({
        event_type: "clinic.join_request",
        user_id: "00000000-0000-0000-0000-000000000000",
        payload: {
          email: "nethaljfernando@gmail.com",
          clinic_email: form.clinicEmail,
          clinic_name: form.clinicName,
          clinic_phone: form.clinicPhone,
          contact_person: form.contactPerson,
        },
        channels: ["email"],
      });

      toast.success("Join request submitted. We will contact you soon.");
      setForm(initialFormState);
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Unable to send join request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PatientNavbar links={navItems} showSignIn showRegister />

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="gap-5 bg-[radial-gradient(circle_at_top_right,rgba(134,208,193,0.18),transparent_45%)] py-7">
          <CardHeader className="space-y-2">
            <CardTitle className="inline-flex items-center gap-2 text-4xl tracking-tight text-slate-900">
              <Handshake className="size-8 text-teal-700" />
              Join MedStream for Clinics
            </CardTitle>
            <p className="max-w-2xl text-slate-600">
              Grow your clinic with a calmer, modern booking and consultation platform built to improve
              patient trust, scheduling efficiency, and clinical operations.
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <Card className="border border-slate-200 bg-white py-5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="inline-flex items-center gap-2 text-xl">
                <Sparkles className="size-5 text-teal-700" />
                Why clinics join our system
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 size-4 text-teal-700" />
                  <p className="text-sm text-slate-700">{benefit}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white py-5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="inline-flex items-center gap-2 text-xl">
                <Building2 className="size-5 text-sky-700" />
                Partner with us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Join clinics already improving patient flow and doctor utilization with MedStream.
              </p>

              <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-sky-800">
                  <UsersRound className="size-4" />
                  Onboarding support included
                </p>
              </div>

              <Button
                className="w-full rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                onClick={() => setIsModalOpen(true)}
              >
                Join With Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Join With Us</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Share your clinic details and we will reach out to you via email.
                </p>
              </div>
              <button
                type="button"
                className="text-slate-400 transition hover:text-slate-700"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Clinic Email</label>
                  <Input
                    type="email"
                    value={form.clinicEmail}
                    onChange={(event) => handleChange("clinicEmail", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Clinic Name</label>
                  <Input
                    value={form.clinicName}
                    onChange={(event) => handleChange("clinicName", event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Clinic Phone No</label>
                  <Input
                    type="tel"
                    value={form.clinicPhone}
                    onChange={(event) => handleChange("clinicPhone", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contact Person Name</label>
                  <Input
                    value={form.contactPerson}
                    onChange={(event) => handleChange("contactPerson", event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 sm:w-auto"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full rounded-xl bg-teal-700 text-white hover:bg-teal-800 sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <PatientFooter />
    </div>
  );
}
