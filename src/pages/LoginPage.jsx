import { Activity, CalendarClock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/useAuth";
import { getHomeRouteForRole, getRoleFromToken } from "@/lib/auth";
import api, { getAccessToken } from "@/services/api";

const insights = [
  { icon: CalendarClock, text: "Book and reschedule instantly" },
  { icon: ShieldCheck, text: "Protected role-based access" },
  { icon: Activity, text: "Live appointment status tracking" },
];

function extractTokens(payload) {
  return {
    accessToken:
      payload?.data?.accessToken ||
      payload?.data?.access_token ||
      payload?.accessToken ||
      payload?.access_token ||
      payload?.data?.token ||
      payload?.token ||
      null,
    refreshToken:
      payload?.data?.refreshToken ||
      payload?.data?.refresh_token ||
      payload?.refreshToken ||
      payload?.refresh_token ||
      null,
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from || "/";

  useEffect(() => {
    if (getAccessToken()) {
      navigate(from, { replace: true });
    }
  }, [from, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { accessToken, refreshToken } = extractTokens(response.data);

      if (!accessToken) {
        toast.error("Login succeeded but no access token was returned.");
        return;
      }

      setAuthSession(accessToken, refreshToken);
      toast.success("Welcome back.");

      const role = getRoleFromToken(accessToken);
      const destination = location.state?.from || getHomeRouteForRole(role);

      navigate(destination || from, { replace: true });
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Invalid credentials.");
      } else if (status === 422) {
        toast.error("Please provide a valid email and password.");
      } else {
        toast.error("Login failed. Please try again.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(134,208,193,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(186,230,253,0.22),transparent_45%),#f8fbfb] px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute -top-14 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />

      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-5 flex items-center justify-between rounded-2xl border border-teal-100/80 bg-white/75 px-4 py-3 backdrop-blur sm:px-5">
          <div>
            <p className="text-sm font-semibold text-slate-900">MedStream</p>
            <p className="text-xs text-slate-500">Patient care coordination platform</p>
          </div>
          <Link to="/" className="text-sm font-medium text-teal-800 hover:text-teal-700">
            Back to home
          </Link>
        </header>

        <div className="grid gap-6 rounded-3xl border border-teal-100/80 bg-white/70 p-3 shadow-[0_28px_60px_-44px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-[1.05fr_0.95fr] md:p-4">
          <section className="relative overflow-hidden rounded-2xl border border-teal-100/70 bg-gradient-to-br from-white via-teal-50/55 to-sky-50/70 p-6 sm:p-8">
            <p className="inline-flex rounded-full border border-teal-200 bg-teal-100/70 px-3 py-1 text-xs font-semibold tracking-wide text-teal-800">
              Secure Sign In
            </p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              Welcome back.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              Continue managing appointments, outcomes, and records in one calm and reliable workspace.
            </p>

            <div className="mt-8 grid gap-3">
              {insights.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-xl border border-teal-100 bg-white/85 px-3.5 py-3 text-sm text-slate-700"
                >
                  <item.icon className="size-4 text-teal-700" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-teal-100 bg-white/80 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Need an account?</p>
              <p className="mt-1 text-sm text-slate-700">
                New to MedStream?{" "}
                <Link to="/register" className="font-semibold text-teal-800 hover:text-teal-700">
                  Create one in under a minute.
                </Link>
              </p>
            </div>
          </section>

          <Card className="rounded-2xl border border-teal-100/80 bg-white/95 py-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-3">
              <div className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                Account Access
              </div>
              <CardTitle className="text-2xl text-slate-900">Sign in to your account</CardTitle>
              <p className="text-sm text-slate-600">Enter your details below to continue.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    className="h-11 rounded-xl border-teal-100 bg-teal-50/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="h-11 rounded-xl border-teal-100 bg-teal-50/40"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="size-4" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          By continuing, you agree to secure use of MedStream services.
        </p>
      </div>
    </div>
  );
}
