import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import PatientFooter from "@/components/patient-footer";
import PatientNavbar from "@/components/patient-navbar";
import { useAuth } from "@/contexts/useAuth";
import { ROLES, getHomeRouteForRole, isClinicRole } from "@/lib/auth";

function getNavItemsByRole(role, isAuthenticated) {
  if (role === ROLES.DOCTOR) {
    return [{ label: "Doctor Dashboard", to: "/doctor/dashboard" }];
  }

  if (isClinicRole(role)) {
    return [{ label: "Clinic Admin", to: "/admin/clinic/dashboard" }];
  }

  if (role === ROLES.ADMIN) {
    return [{ label: "Super Admin", to: "/admin/super/dashboard" }];
  }

  const base = [
    { label: "Find Doctors", to: "/doctors" },
    { label: "Clinics", to: "/join-with-us" },
    { label: "Join With Us", to: "/join-with-us" },
    { label: "Contact Us", to: "/contact-us" },
  ];

  if (isAuthenticated) {
    base.push({ label: "My Profile", to: "/patient/profile" });
  }

  return base;
}

function shouldShowGuestActions(role) {
  return !role || role === ROLES.PATIENT;
}

function shouldShowPatientFooter(role) {
  return !role || role === ROLES.PATIENT;
}

function getHomeRoute(role) {
  if (!role) {
    return "/";
  }

  return getHomeRouteForRole(role);
}

function getPortalSubtitle(role) {
  if (role === ROLES.DOCTOR) {
    return "Doctor portal";
  }
  if (isClinicRole(role)) {
    return "Clinic admin portal";
  }
  if (role === ROLES.ADMIN) {
    return "Super admin portal";
  }
  return "Clinic & patient booking platform";
}

export default function PatientPortalLayout() {
  const navigate = useNavigate();
  const { role, logout, isAuthenticated } = useAuth();
  const navItems = getNavItemsByRole(role, isAuthenticated);

  const handleLogout = () => {
    logout();
    toast.success("Logged out.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PatientNavbar
        links={navItems}
        homeTo={getHomeRoute(role)}
        subtitle={getPortalSubtitle(role)}
        showSignIn={shouldShowGuestActions(role)}
        showRegister={shouldShowGuestActions(role)}
        onLogout={handleLogout}
      />

      <main className="app-section">
        <Outlet />
      </main>

      {shouldShowPatientFooter(role) ? <PatientFooter /> : null}
    </div>
  );
}
