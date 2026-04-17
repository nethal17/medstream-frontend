import { Building2, CheckCircle2, Handshake, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import PatientNavbar from "@/components/patient-navbar";
import PatientFooter from "@/components/patient-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  { label: "Find Doctors", to: "/doctors" },
  { label: "Clinics", to: "/join-with-us" },
  { label: "Join With Us", to: "/join-with-us" },
  { label: "Help", href: "#footer" },
];

const benefits = [
  "Increase clinic visibility to active patients searching by specialty.",
  "Reduce no-shows with reminders and centralized appointment management.",
  "Offer in-person and telemedicine consultations from one platform.",
  "Improve staff coordination with clean, role-based operational dashboards.",
];

export default function JoinWithUsPage() {
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

              <Button className="w-full rounded-xl bg-teal-700 text-white hover:bg-teal-800" asChild>
                <Link to="/register">Join With Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <PatientFooter />
    </div>
  );
}
