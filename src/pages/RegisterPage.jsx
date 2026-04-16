import { Activity, CalendarClock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import api from "@/services/api";

const benefits = [
  { icon: CalendarClock, text: "Instant appointment booking" },
  { icon: ShieldCheck, text: "Secure patient account" },
  { icon: Activity, text: "Track every visit update" },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role: "patient",
      });

      toast.success("Account created. Please sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error("An account with this email already exists.");
      } else if (status === 422) {
        toast.error("Please check your details and try again.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-4rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-5rem] bottom-[-4rem] h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl gap-6 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl md:grid-cols-[1.1fr_1fr] md:p-8">
        <section className="space-y-5 rounded-xl border border-white/10 bg-black/20 p-6">
          <p className="inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
            Patient Onboarding
          </p>
          <h1 className="text-3xl font-semibold leading-tight">Start your MedStream journey today.</h1>
          <p className="text-sm text-slate-200/90">
            Create your patient account to book doctors, track appointments, and manage your healthcare timeline.
          </p>

          <div className="space-y-3 pt-1">
            {benefits.map((item) => (
              <div key={item.text} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <item.icon className="size-4 text-emerald-300" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        <Card className="border border-white/15 bg-slate-950/70 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Create account</CardTitle>
            <p className="text-sm text-slate-300">Sign up as a patient in under a minute.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full name</label>
                <Input
                  placeholder="Kamal Perera"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm password</label>
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-slate-400"
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-400 text-slate-900 hover:bg-emerald-300" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="size-4" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-300">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-cyan-200 hover:text-cyan-100">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
