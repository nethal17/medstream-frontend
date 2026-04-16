import { Activity, CalendarClock, ShieldCheck, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    icon: CalendarClock,
    title: "Book in seconds",
    text: "Find available doctors and reserve time slots with real-time availability.",
  },
  {
    icon: ShieldCheck,
    title: "Secure access",
    text: "Role-based dashboards with protected navigation and token-backed sessions.",
  },
  {
    icon: Activity,
    title: "Track outcomes",
    text: "Monitor appointment status from booking through arrival and completion.",
  },
  {
    icon: Stethoscope,
    title: "Clinical workflow",
    text: "Built for patients, doctors, and admins in one connected portal.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-32 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute top-24 right-[-6rem] h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.09),_transparent_46%)]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-12 sm:px-10 lg:py-16">
        <header className="flex items-center justify-between">
          <p className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
            MedStream
          </p>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link to="/register">Sign up</Link>
            </Button>
            <Button asChild variant="secondary" className="bg-white text-slate-900 hover:bg-slate-200">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-4 py-1 text-xs font-medium text-cyan-100">
              Healthcare Appointment Platform
            </p>
            <h1 className="max-w-2xl text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">
              Health access that feels immediate and intelligent.
            </h1>
            <p className="max-w-xl text-base text-slate-200/85 sm:text-lg">
              Coordinate patient care across booking, consultation, and operations with one unified experience.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-emerald-400 text-slate-900 hover:bg-emerald-300">
                <Link to="/login">Launch Portal</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                <a href="#highlights">Explore Features</a>
              </Button>
            </div>
          </div>

          <Card className="border border-white/20 bg-white/10 backdrop-blur-xl">
            <CardContent className="space-y-5 p-6">
              <p className="text-sm text-cyan-100">Live Preview</p>
              <div className="space-y-3">
                <div className="rounded-xl border border-white/20 bg-black/20 p-4">
                  <p className="text-xs text-slate-300">Upcoming appointment</p>
                  <p className="mt-1 text-lg font-semibold">Dr. Nadeesha Silva</p>
                  <p className="text-sm text-slate-200">Tue, 9:30 AM • Colombo Clinic</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Doctors</p>
                    <p className="text-2xl font-semibold">124</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Today bookings</p>
                    <p className="text-2xl font-semibold">318</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="highlights" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <Card key={item.title} className="border border-white/15 bg-white/10 text-white backdrop-blur">
              <CardContent className="space-y-3 p-5">
                <item.icon className="size-5 text-emerald-300" />
                <p className="text-base font-semibold">{item.title}</p>
                <p className="text-sm text-slate-200/90">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
