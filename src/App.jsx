import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import PatientPortalLayout from "@/components/patient-portal-layout";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/useAuth";
import { ROLES, isAllowedRole } from "@/lib/auth";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import DoctorBookingPage from "@/pages/DoctorBookingPage";
import DoctorsPage from "@/pages/DoctorsPage";
import HomePage from "@/pages/HomePage";
import JoinWithUsPage from "@/pages/JoinWithUsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import SuperAdminDashboardPage from "@/pages/SuperAdminDashboardPage";
import ClinicAdminDashboardPage from "@/pages/clinic-admin/ClinicAdminDashboardPage";
import DoctorDashboardPage from "@/pages/doctor/DoctorDashboardPage";
import PatientDashboardPage from "@/pages/patient/PatientDashboardPage";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}

function PublicRoute() {
  const { isLoading, isAuthenticated, homeRoute } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={homeRoute} replace />;
  }

  return <Outlet />;
}

function ProtectedRoute() {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const { isLoading, isAuthenticated, homeRoute } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={homeRoute} replace />;
}

function RoleRoute({ allowedRoles }) {
  const location = useLocation();
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (!isAllowedRole(role, allowedRoles)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

function AccessDeniedPage() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-rose-200/70 bg-rose-50/70 px-6 py-10 text-center shadow-[0_8px_20px_-16px_rgba(15,23,42,0.25)]">
      <h1 className="text-2xl font-semibold text-rose-800">Access denied</h1>
      <p className="mt-2 text-sm text-rose-700">You do not have permission to view this page.</p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/join-with-us" element={<JoinWithUsPage />} />
      <Route element={<PatientPortalLayout />}>
        <Route path="/doctors" element={<DoctorsPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<PatientPortalLayout />}>
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          <Route element={<RoleRoute allowedRoles={[ROLES.PATIENT]} />}>
            <Route path="/doctors/:doctorId" element={<DoctorBookingPage />} />
            <Route path="/doctors/confirmation" element={<BookingConfirmationPage />} />
            <Route path="/patient/profile/*" element={<PatientDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.DOCTOR]} />}>
            <Route path="/doctor/dashboard/*" element={<DoctorDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.CLINIC_ADMIN]} />}>
            <Route path="/admin/clinic/dashboard/*" element={<ClinicAdminDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/super/dashboard" element={<SuperAdminDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.CLINIC_ADMIN, ROLES.ADMIN]} />}>
            <Route path="/admin/reports" element={<ClinicAdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}