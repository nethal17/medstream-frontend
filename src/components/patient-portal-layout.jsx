import { Bell, LogOut, UserCircle2 } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { ROLES, getHomeRouteForRole, isClinicRole } from "@/lib/auth";

function getNavItemsByRole(role) {
  if (role === ROLES.DOCTOR) {
    return [{ label: "Doctor Dashboard", href: "/doctor/dashboard" }];
  }

  if (isClinicRole(role)) {
    return [{ label: "Clinic Admin", href: "/admin/clinic/dashboard" }];
  }

  if (role === ROLES.ADMIN) {
    return [{ label: "Super Admin", href: "/admin/super/dashboard" }];
  }

  return [
    { label: "Find a Doctor", href: "/doctors" },
    { label: "My Profile", href: "/patient/profile" },
  ];
}

function getPortalLabel(role) {
  if (role === ROLES.DOCTOR) {
    return "Doctor Portal";
  }
  if (isClinicRole(role)) {
    return "Clinic Admin Portal";
  }
  if (role === ROLES.ADMIN) {
    return "Super Admin Portal";
  }
  return "Patient Portal";
}

export default function PatientPortalLayout() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const navItems = getNavItemsByRole(role);

  const handleLogout = () => {
    logout();
    toast.success("Logged out.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link to={getHomeRouteForRole(role)} className="font-semibold text-primary">
              {getPortalLabel(role)}
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive }) =>
                    [
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <Bell className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Profile">
              <UserCircle2 className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
