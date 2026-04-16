import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import PatientPortalLayout from "@/components/patient-portal-layout";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/useAuth";
import { ROLES, isAllowedRole } from "@/lib/auth";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import ClinicAdminDashboardPage from "@/pages/ClinicAdminDashboardPage";
import DoctorBookingPage from "@/pages/DoctorBookingPage";
import DoctorDashboardPage from "@/pages/DoctorDashboardPage";
import DoctorsPage from "@/pages/DoctorsPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import PatientProfilePage from "@/pages/PatientProfilePage";
import RegisterPage from "@/pages/RegisterPage";
import SuperAdminDashboardPage from "@/pages/SuperAdminDashboardPage";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
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
    return <Navigate to="/login" replace />;
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
    <section className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <h1 className="text-2xl font-semibold text-rose-800">Access denied</h1>
      <p className="mt-2 text-sm text-rose-700">You do not have permission to view this page.</p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<PatientPortalLayout />}>
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          <Route element={<RoleRoute allowedRoles={[ROLES.PATIENT]} />}>
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:doctorId" element={<DoctorBookingPage />} />
            <Route path="/doctors/confirmation" element={<BookingConfirmationPage />} />
            <Route path="/patient/profile" element={<PatientProfilePage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.DOCTOR]} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.CLINIC_ADMIN]} />}>
            <Route path="/admin/clinic/dashboard" element={<ClinicAdminDashboardPage />} />
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