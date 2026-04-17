import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import PatientFooter from "@/components/patient-footer";
import PatientNavbar from "@/components/patient-navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Find Doctors", to: "/doctors" },
  { label: "Clinics", to: "/join-with-us" },
  { label: "Join With Us", to: "/join-with-us" },
  { label: "Telemedicine", href: "#care-options" },
  { label: "Help", href: "#footer" },
];

const serviceCards = [
  {
    icon: Calendar,
    title: "Appointment booking",
    description:
      "Schedule visits with doctors and clinics through a clear and simple booking flow.",
    tone: "bg-teal-50 border-teal-100",
    iconTone: "text-teal-700",
  },
  {
    icon: Video,
    title: "Telemedicine consultations",
    description:
      "Join secure online consultations when in-person visits are not convenient.",
    tone: "bg-sky-50 border-sky-100",
    iconTone: "text-sky-700",
  },
  {
    icon: ShieldCheck,
    title: "Reliable patient coordination",
    description:
      "Keep appointments, reminders, and follow-up information in one organized place.",
    tone: "bg-indigo-50 border-indigo-100",
    iconTone: "text-indigo-700",
  },
  {
    icon: HeartPulse,
    title: "Care designed for comfort",
    description:
      "A calmer interface for patients, doctors, and clinic staff during daily use.",
    tone: "bg-rose-50 border-rose-100",
    iconTone: "text-rose-700",
  },
];

const doctors = [
  {
    name: "Dr. Ayesha Perera",
    specialty: "Cardiology",
    availability: "Today · 3:00 PM",
    location: "Colombo",
    fee: "LKR 2,500",
    tone: "from-teal-50 to-sky-50",
    iconTone: "bg-teal-100 text-teal-700",
    badgeTone: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Dr. Nimal Fernando",
    specialty: "Neurology",
    availability: "Tomorrow · 10:30 AM",
    location: "Negombo",
    fee: "LKR 3,000",
    tone: "from-sky-50 to-indigo-50",
    iconTone: "bg-sky-100 text-sky-700",
    badgeTone: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Dr. Priya Seneviratne",
    specialty: "Pediatrics",
    availability: "Today · 5:00 PM",
    location: "Galle",
    fee: "LKR 2,000",
    tone: "from-rose-50 to-amber-50",
    iconTone: "bg-rose-100 text-rose-700",
    badgeTone: "bg-amber-100 text-amber-700",
  },
];

function HeroSearch() {
  const [query, setQuery] = useState("");

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search doctor, specialty, clinic, or symptom"
            className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-600"
          />
        </div>
        <Button className="h-12 rounded-2xl bg-teal-700 px-6 text-white hover:bg-teal-800">
          Find care
        </Button>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.08),transparent_35%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:pt-20">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/90 px-4 py-2 text-xs font-medium text-teal-700 shadow-sm">
            <ShieldCheck className="size-3.5" />
            Trusted digital care for clinics, doctors, and patients
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Book healthcare appointments with more clarity, calm, and confidence.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              MedStream helps patients find doctors, book clinic visits, join telemedicine
              consultations, and stay organized through every step of care.
            </p>
          </div>

          <HeroSearch />

          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-teal-100 bg-teal-50/70 px-4 py-2 text-sm text-teal-800 shadow-sm">
              1,200+ verified doctors
            </div>
            <div className="rounded-full border border-sky-100 bg-sky-50/70 px-4 py-2 text-sm text-sky-800 shadow-sm">
              50,000+ appointment requests managed
            </div>
            <div className="rounded-full border border-indigo-100 bg-indigo-50/70 px-4 py-2 text-sm text-indigo-800 shadow-sm">
              In-clinic and online consultations
            </div>
          </div>


        </div>

        <div className="relative">
          <div className="absolute -left-6 top-8 hidden h-24 w-24 rounded-full bg-teal-100 blur-2xl lg:block" />
          <div className="absolute -right-4 bottom-8 hidden h-28 w-28 rounded-full bg-slate-200/70 blur-2xl lg:block" />

          <Card className="rounded-[28px] border border-teal-100/90 bg-gradient-to-br from-teal-50 via-teal-50/75 to-white shadow-xl shadow-teal-100/60">
            <CardContent className="space-y-5 p-6">
              <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-100/80 to-teal-50/90 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-900">Next appointment</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      Cardiology consultation
                    </h3>
                  </div>
                  <div className="rounded-full border border-emerald-200 bg-emerald-100/90 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Confirmed
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-teal-100/90 bg-gradient-to-r from-teal-50/90 to-teal-50/60 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 ring-1 ring-teal-200">
                    <Stethoscope className="size-6 text-teal-800" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dr. Ayesha Perera</p>
                    <p className="text-sm text-teal-800/80">Consultant Cardiologist</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-teal-50/35 p-3 ring-1 ring-teal-100">
                    <p className="text-xs text-teal-800/75">Date & time</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Clock3 className="size-4 text-teal-800" />
                      Tomorrow, 10:00 AM
                    </p>
                  </div>

                  <div className="rounded-2xl bg-teal-50/30 p-3 ring-1 ring-teal-100">
                    <p className="text-xs text-teal-800/75">Consultation type</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Video className="size-4 text-teal-800" />
                      Video consultation
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-teal-100 bg-teal-50/45 p-4">
                  <p className="text-xs text-teal-800/75">Clinic support</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Phone className="size-4 text-teal-800" />
                    +94 11 234 5678
                  </p>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-teal-50/45 p-4">
                  <p className="text-xs text-teal-800/75">Location</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                    <MapPin className="size-4 text-teal-800" />
                    Colombo Medical Center
                  </p>
                </div>
              </div>

              <Button className="w-full rounded-2xl bg-teal-700 text-white hover:bg-teal-800" asChild>
                <Link to="/doctors">Book appointment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function CareOptions() {
  return (
    <section id="care-options" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
          Care Access
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          A simpler way to connect patients, doctors, and clinics
        </h2>
        <p className="text-slate-600">
          The platform supports booking, consultation, and follow-up workflows with a design
          that feels calm and organized across every role.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {serviceCards.map((item) => (
          <Card
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="space-y-4 p-6">
              <div className={["flex h-12 w-12 items-center justify-center rounded-2xl border", item.tone].join(" ")}>
                <item.icon className={["size-5", item.iconTone].join(" ")} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Search doctors or clinics",
      detail: "Find the right care option by specialty, clinic, availability, or consultation type.",
    },
    {
      title: "Choose a suitable time",
      detail: "Review available slots clearly and select a time that works for the patient.",
    },
    {
      title: "Attend the consultation",
      detail: "Visit the clinic or join a secure telemedicine session when the appointment begins.",
    },
    {
      title: "Manage follow-up care",
      detail: "Track future bookings, reminders, prescriptions, and next steps in one place.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.32),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(216,180,254,0.22),transparent_40%),#f8fafc] py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
            Booking Flow
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Clear steps from booking to follow-up
          </h2>
          <p className="text-slate-600">
            The experience is designed to reduce confusion and help users move through care
            with confidence.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="inline-flex rounded-xl bg-slate-100 px-3 py-1 text-sm font-semibold tracking-tight text-slate-600">
                  Step 0{index + 1}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{step.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedDoctors() {
  return (
    <section id="featured-doctors" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
            Doctors
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Find trusted specialists with transparent availability
          </h2>
          <p className="text-slate-600">
            Patients can quickly review specialties, next available times, and consultation
            details before booking.
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          asChild
        >
          <Link to="/doctors">Browse all doctors</Link>
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => (
          <Card
            key={doctor.name}
            className="rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={["flex h-14 w-14 items-center justify-center rounded-full", doctor.iconTone].join(" ")}>
                    <UserRound className="size-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{doctor.name}</p>
                    <p className="text-sm text-slate-500">{doctor.specialty}</p>
                  </div>
                </div>
                <div className={["rounded-full px-3 py-1 text-xs font-medium", doctor.badgeTone].join(" ")}>
                  Verified
                </div>
              </div>

              <div className={["space-y-3 rounded-2xl bg-gradient-to-r p-4", doctor.tone].join(" ")}>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Clock3 className="size-4 text-teal-700" />
                  <span>Next available: {doctor.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <MapPin className="size-4 text-teal-700" />
                  <span>{doctor.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Activity className="size-4 text-teal-700" />
                  <span>Consultation fee: {doctor.fee}</span>
                </div>
              </div>

              <Button
                className="w-full rounded-2xl bg-teal-700 text-white hover:bg-teal-800"
                asChild
              >
                <Link to="/doctors">Book appointment</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="bg-white py-6">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="rounded-3xl border border-teal-100 bg-teal-50/70 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 text-teal-700" />
            <div>
              <p className="font-medium text-slate-900">Built for healthcare workflows</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Suitable for clinic visits, specialist appointments, and ongoing follow-up care.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 text-sky-700" />
            <div>
              <p className="font-medium text-slate-900">A calmer patient experience</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                A soft visual system reduces stress and keeps essential actions easy to find.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
          <div className="flex items-start gap-3">
            <Stethoscope className="mt-0.5 size-5 text-rose-700" />
            <div>
              <p className="font-medium text-slate-900">Useful for clinics and doctors too</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Supports smoother coordination between patients, doctors, and clinic staff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PatientNavbar links={navItems} showSignIn showRegister />
      <Hero />
      <TrustSection />
      <CareOptions />
      <HowItWorks />
      <FeaturedDoctors />
      <PatientFooter />
    </div>
  );
}