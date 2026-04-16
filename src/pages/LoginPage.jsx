import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import api, { getAccessToken, setAccessToken, setRefreshToken } from "@/services/api";

function extractTokens(payload) {
  return (
    {
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
    }
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from || "/doctors";

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

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      toast.success("Login successful.");
      navigate(from, { replace: true });
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md bg-background">
        <CardHeader>
          <CardTitle className="text-2xl">Patient Login</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to continue booking appointments.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="size-4" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
