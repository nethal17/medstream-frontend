import { RefreshCw, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import SuperAdminSidePanel from "@/components/super-admin/SuperAdminSidePanel";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import SuperAdminAppointmentsPage from "@/pages/super-admin/SuperAdminAppointmentsPage";
import SuperAdminClinicsPage from "@/pages/super-admin/SuperAdminClinicsPage";
import SuperAdminConfigurationsPage from "@/pages/super-admin/SuperAdminConfigurationsPage";
import SuperAdminDoctorsPage from "@/pages/super-admin/SuperAdminDoctorsPage";
import SuperAdminOverviewPage from "@/pages/super-admin/SuperAdminOverviewPage";
import SuperAdminFinancialPage from "@/pages/super-admin/SuperAdminFinancialPage";
import {
  getAdminAppointments,
  getActivePolicy,
  getAdminStatistics,
  updateActivePolicy,
} from "@/services/appointments";
import {
  getGoogleOAuthLoginUrl,
  getGoogleOAuthStatus,
} from "@/services/telemedicine";

const defaultPolicy = {
  cancellation_window_hours: 12,
  reschedule_window_hours: 24,
  advance_booking_days: 14,
  no_show_grace_period_minutes: 15,
  max_reschedules: 2,
  reason: "",
};

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [googleStatus, setGoogleStatus] = useState(null);
  const [appointmentItems, setAppointmentItems] = useState([]);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsMeta, setAppointmentsMeta] = useState({ page: 1, size: 20, has_more: false, total: 0 });
  const [dashboardFilters, setDashboardFilters] = useState({
    date_from: "",
    date_to: "",
    clinic_id: "",
    doctor_id: "",
    outcome: "",
  });
  const [policy, setPolicy] = useState(defaultPolicy);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [isRefreshingAppointments, setIsRefreshingAppointments] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsPayload, policyPayload, oauthPayload, appointmentsPayload] = await Promise.all([
        getAdminStatistics(dashboardFilters),
        getActivePolicy(),
        getGoogleOAuthStatus(),
        getAdminAppointments({ page: appointmentsPage, size: 20, ...dashboardFilters }),
      ]);
      setStats(statsPayload || null);
      setGoogleStatus(oauthPayload || null);
      setAppointmentItems(appointmentsPayload?.items || appointmentsPayload?.results || []);
      setAppointmentsMeta({
        page: appointmentsPayload?.page || appointmentsPage,
        size: appointmentsPayload?.size || 20,
        has_more: Boolean(appointmentsPayload?.has_more),
        total: appointmentsPayload?.total || 0,
      });
      setPolicy({
        cancellation_window_hours: policyPayload?.cancellation_window_hours ?? 12,
        reschedule_window_hours: policyPayload?.reschedule_window_hours ?? 24,
        advance_booking_days: policyPayload?.advance_booking_days ?? 14,
        no_show_grace_period_minutes: policyPayload?.no_show_grace_period_minutes ?? 15,
        max_reschedules: policyPayload?.max_reschedules ?? 2,
        reason: "",
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to load super admin data."));
    } finally {
      setIsLoading(false);
    }
  }, [dashboardFilters, appointmentsPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onPolicyInputChange = (key, value) => {
    setPolicy((prev) => ({
      ...prev,
      [key]: key === "reason" ? value : Number.parseInt(value || "0", 10),
    }));
  };

  const handlePolicySave = async () => {
    setIsSavingPolicy(true);
    try {
      await updateActivePolicy(policy);
      toast.success("Policy updated.");
      await loadData();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to update policy."));
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const updateFilter = (key, value) => {
    setAppointmentsPage(1);
    setDashboardFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const refreshAppointments = async () => {
    setIsRefreshingAppointments(true);
    try {
      const [statsPayload, appointmentsPayload, oauthPayload] = await Promise.all([
        getAdminStatistics(dashboardFilters),
        getAdminAppointments({ page: appointmentsPage, size: 20, ...dashboardFilters }),
        getGoogleOAuthStatus(),
      ]);

      setStats(statsPayload || null);
      setGoogleStatus(oauthPayload || null);
      setAppointmentItems(appointmentsPayload?.items || appointmentsPayload?.results || []);
      setAppointmentsMeta({
        page: appointmentsPayload?.page || appointmentsPage,
        size: appointmentsPayload?.size || 20,
        has_more: Boolean(appointmentsPayload?.has_more),
        total: appointmentsPayload?.total || 0,
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Unable to refresh appointments."));
    } finally {
      setIsRefreshingAppointments(false);
    }
  };

  const renderActiveSection = () => {
    if (activeSection === "overview") {
      return <SuperAdminOverviewPage stats={stats} />;
    }

    if (activeSection === "doctors") {
      return <SuperAdminDoctorsPage />;
    }

    if (activeSection === "clinics") {
      return <SuperAdminClinicsPage />;
    }

    if (activeSection === "appointments-normal" || activeSection === "appointments-telemedicine") {
      return (
        <SuperAdminAppointmentsPage
          activeView={activeSection}
          onSelectView={setActiveSection}
          dashboardFilters={dashboardFilters}
          onFilterChange={updateFilter}
          appointmentItems={appointmentItems}
          appointmentMeta={appointmentsMeta}
          onPreviousPage={() => setAppointmentsPage((prev) => prev - 1)}
          onNextPage={() => setAppointmentsPage((prev) => prev + 1)}
          onRefresh={refreshAppointments}
          isRefreshing={isRefreshingAppointments}
        />
      );
    }

    if (activeSection === "configurations") {
      return (
        <SuperAdminConfigurationsPage
          googleStatus={googleStatus}
          onRefresh={refreshAppointments}
          isRefreshing={isRefreshingAppointments}
          connectUrl={getGoogleOAuthLoginUrl()}
          policy={policy}
          onPolicyInputChange={onPolicyInputChange}
          onPolicySave={handlePolicySave}
          isSavingPolicy={isSavingPolicy}
        />
      );
    }

    if (activeSection === "financial") {
      return <SuperAdminFinancialPage />;
    }

    return <SuperAdminOverviewPage stats={stats} />;
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(154,182,213,0.15),transparent_50%)] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Control center</p>
            <h1 className="mt-1 inline-flex items-center gap-2 text-3xl font-semibold text-slate-900">
              <Shield className="size-7 text-primary" />
              Super Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">System oversight, live visibility, and policy governance in one workspace.</p>
          </div>

          <Button variant="outline" onClick={refreshAppointments} disabled={isRefreshingAppointments || isLoading}>
            <RefreshCw className={`size-4 ${isRefreshingAppointments ? "animate-spin" : ""}`} />
            {isRefreshingAppointments ? "Refreshing..." : "Refresh data"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-16 shadow-sm">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <SuperAdminSidePanel activeKey={activeSection} onSelect={setActiveSection} />

          <div className="space-y-6">{renderActiveSection()}</div>
        </div>
      )}
    </section>
  );
}
