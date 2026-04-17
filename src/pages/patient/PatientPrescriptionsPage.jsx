import { AlertTriangle, CalendarDays, Pill, RefreshCw, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/useAuth";
import { formatDisplayDate } from "@/lib/appointment-utils";
import { getCurrentUserProfile } from "@/services/auth";
import { getPatientPrescriptions, getPatientProfileByUserId } from "@/services/patients";

function normalizeMedications(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => item && typeof item === "object");
}

function toTimestamp(value) {
  const ms = new Date(value || "").getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function getErrorView(statusCode) {
  if (statusCode === 401) {
    return {
      title: "Session expired",
      message: "Please sign in again to view prescriptions.",
      tone: "rose",
    };
  }

  if (statusCode === 403 || statusCode === 404) {
    return {
      title: "Not accessible",
      message: "This patient's prescriptions are not available for your account.",
      tone: "amber",
    };
  }

  return {
    title: "Temporary service issue",
    message: "We could not load prescriptions right now. Please try again.",
    tone: "slate",
  };
}

function getStatusBadgeClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "final" || normalized === "finalized") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  if (normalized === "draft") {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function PrescriptionSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-56 rounded bg-slate-100" />
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <div className="h-16 rounded bg-slate-100" />
            <div className="h-16 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PatientPrescriptionsPage() {
  const { user } = useAuth();
  const { patientId: routePatientId } = useParams();

  const [prescriptions, setPrescriptions] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    let ignore = false;
    let timeoutId = null;

    async function resolvePatientId() {
      if (!user?.accessToken) {
        if (!ignore) {
          setPatientId("");
          setErrorState({ statusCode: 401, correlationId: null });
          setIsLoading(false);
        }
        return;
      }

      if (routePatientId) {
        timeoutId = setTimeout(() => {
          if (!ignore) {
            setPatientId(String(routePatientId));
            setErrorState(null);
          }
        }, 250);
        return;
      }

      try {
        const authUser = await getCurrentUserProfile();
        const userId = authUser?.user_id || authUser?.id;

        if (!userId) {
          throw new Error("Authenticated user id not found.");
        }

        const profile = await getPatientProfileByUserId(userId);
        if (!ignore) {
          setPatientId(profile?.patient_id ? String(profile.patient_id) : "");
          setErrorState(null);
        }
      } catch (error) {
        const statusCode = error?.response?.status || null;
        const correlationId =
          error?.response?.headers?.["x-correlation-id"] || error?.response?.headers?.["x-request-id"] || null;

        console.error("Failed to resolve patient id", {
          statusCode,
          correlationId,
          url: error?.config?.url,
        });

        if (!ignore) {
          setPatientId("");
          setErrorState({ statusCode, correlationId });
          setIsLoading(false);
        }
      }
    }

    resolvePatientId();

    return () => {
      ignore = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [routePatientId, user?.accessToken]);

  useEffect(() => {
    let ignore = false;

    async function loadPrescriptions() {
      if (!patientId || !user?.accessToken) {
        return;
      }

      setIsRefreshing(true);
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }

      try {
        const payload = await getPatientPrescriptions(patientId);
        const normalized = Array.isArray(payload) ? payload : [];
        const sorted = [...normalized].sort((a, b) => {
          const aDate = a?.issued_at || a?.created_at;
          const bDate = b?.issued_at || b?.created_at;
          return toTimestamp(bDate) - toTimestamp(aDate);
        });

        if (ignore) {
          return;
        }

        setPrescriptions(sorted);
        setErrorState(null);
        setHasLoadedOnce(true);
      } catch (error) {
        const statusCode = error?.response?.status || null;
        const correlationId =
          error?.response?.headers?.["x-correlation-id"] || error?.response?.headers?.["x-request-id"] || null;

        console.error("Prescriptions request failed", {
          statusCode,
          correlationId,
          patientId,
          url: error?.config?.url,
        });

        if (!ignore) {
          setErrorState({ statusCode, correlationId });
          setHasLoadedOnce(true);
        }
      } finally {
        if (!ignore) {
          setIsRefreshing(false);
          setIsLoading(false);
        }
      }
    }

    loadPrescriptions();

    return () => {
      ignore = true;
    };
  }, [hasLoadedOnce, patientId, user?.accessToken]);

  const groupedByDate = prescriptions.reduce((acc, item) => {
    const sourceDate = item?.issued_at || item?.created_at;
    const dateKey = sourceDate ? new Date(sourceDate).toISOString().slice(0, 10) : "unknown";

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push(item);
    return acc;
  }, {});

  const groupedEntries = Object.entries(groupedByDate).sort((a, b) => {
    if (a[0] === "unknown") return 1;
    if (b[0] === "unknown") return -1;
    return toTimestamp(b[0]) - toTimestamp(a[0]);
  });

  const onRefresh = async () => {
    if (!patientId || !user?.accessToken) {
      return;
    }

    setIsRefreshing(true);
    try {
      const payload = await getPatientPrescriptions(patientId);
      const normalized = Array.isArray(payload) ? payload : [];
      const sorted = [...normalized].sort((a, b) => {
        const aDate = a?.issued_at || a?.created_at;
        const bDate = b?.issued_at || b?.created_at;
        return toTimestamp(bDate) - toTimestamp(aDate);
      });
      setPrescriptions(sorted);
      setErrorState(null);
    } catch (error) {
      const statusCode = error?.response?.status || null;
      const correlationId =
        error?.response?.headers?.["x-correlation-id"] || error?.response?.headers?.["x-request-id"] || null;

      console.error("Manual refresh failed", {
        statusCode,
        correlationId,
        patientId,
        url: error?.config?.url,
      });

      setErrorState({ statusCode, correlationId });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PrescriptionSkeleton />;
  }

  if (errorState) {
    const { title, message, tone } = getErrorView(errorState.statusCode);

    return (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <ShieldAlert className="size-5 text-rose-600" />
            Patient Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={[
              "rounded-xl border px-4 py-4",
              tone === "rose" ? "border-rose-200 bg-rose-50" : "",
              tone === "amber" ? "border-amber-200 bg-amber-50" : "",
              tone === "slate" ? "border-slate-200 bg-slate-50" : "",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-700">{message}</p>
            {errorState?.correlationId ? (
              <p className="mt-2 text-xs text-slate-500">Correlation ID: {errorState.correlationId}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={onRefresh} disabled={isRefreshing}>
                <RefreshCw className={["size-4", isRefreshing ? "animate-spin" : ""].join(" ")} />
                Retry
              </Button>
              {errorState.statusCode === 401 ? (
                <Button asChild size="sm" variant="outline">
                  <Link to="/login">Go to login</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <Pill className="size-5 text-primary" />
          Patient Prescriptions
        </CardTitle>
        <Button size="sm" variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={["size-4", isRefreshing ? "animate-spin" : ""].join(" ")} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {prescriptions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-base font-medium text-slate-800">No prescriptions yet</p>
            <p className="mt-1 text-sm text-slate-600">Book and complete a consultation to receive prescriptions.</p>
            <Button className="mt-4" size="sm" asChild>
              <Link to="/doctors">Book consultation</Link>
            </Button>
          </div>
        ) : null}

        {groupedEntries.map(([dateKey, items]) => (
          <section key={dateKey} className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              <CalendarDays className="size-3.5" />
              {dateKey === "unknown" ? "Unknown date" : formatDisplayDate(dateKey)}
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const medications = normalizeMedications(item?.medications);

                return (
                  <article
                    key={item.prescription_id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_6px_16px_-14px_rgba(15,23,42,0.35)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        Prescription {item.prescription_id || "-"}
                      </p>
                      <span
                        className={[
                          "rounded-full border px-2.5 py-1 text-xs font-medium",
                          getStatusBadgeClass(item.status),
                        ].join(" ")}
                      >
                        {item.status || "unknown"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Issued: {formatDisplayDate(item.issued_at || item.created_at)}
                    </p>

                    {item.instructions ? (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Instructions</p>
                        <p className="mt-1 text-sm text-slate-700">{item.instructions}</p>
                      </div>
                    ) : null}

                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medications</p>
                      {medications.length === 0 ? (
                        <p className="mt-1 text-sm text-slate-600">No medications listed.</p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {medications.map((medication, index) => {
                            const name = String(medication.name || medication.drug || medication.medication || "Medication");
                            const dosage = medication.dosage ? String(medication.dosage) : null;
                            const duration = medication.duration ? String(medication.duration) : null;

                            return (
                              <li key={`${item.prescription_id}-${index}`} className="rounded-lg border border-slate-200 p-2">
                                <p className="text-sm font-medium text-slate-800">{name}</p>
                                <p className="mt-1 text-xs text-slate-600">
                                  Dosage: {dosage || "-"} | Duration: {duration || "-"}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600 sm:grid-cols-2">
                      <p>Doctor: {item.doctor_id || "Not available"}</p>
                      <p>Clinic: {item.clinic_id || "Not available"}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {errorState?.correlationId ? (
          <p className="text-xs text-slate-500">Last request correlation ID: {errorState.correlationId}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
