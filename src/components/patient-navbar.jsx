import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { ROLES, getHomeRouteForRole } from "@/lib/auth";
import logoImage from "@/assets/logo.png";

function itemClass(isActive) {
  return [
    "text-sm font-medium transition-colors",
    isActive ? "text-teal-800" : "text-slate-600 hover:text-teal-700",
  ].join(" ");
}

export default function PatientNavbar({
  links = [],
  homeTo = "/",
  subtitle = "Clinic & patient booking platform",
  showSignIn = false,
  showRegister = false,
  onLogout,
}) {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const profileRoute = role === ROLES.PATIENT ? "/patient/profile" : getHomeRouteForRole(role);

  const handleLogout = () => {
    setMenuOpen(false);
    if (onLogout) {
      onLogout();
      return;
    }

    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={homeTo} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-teal-50 ring-1 ring-teal-100">
            <img src={logoImage} alt="MedStream logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-slate-900">MedStream</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((item) => {
            if (item.href?.startsWith("#")) {
              return (
                <a key={item.label} href={item.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-700">
                  {item.label}
                </a>
              );
            }

            return (
              <NavLink key={item.label} to={item.to || item.href || "/"} className={({ isActive }) => itemClass(isActive)}>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="relative flex items-center gap-2">
          {!isAuthenticated && showSignIn ? (
            <Button
              variant="default"
              size="sm"
              className="rounded-xl bg-teal-700 px-4 text-white shadow-sm hover:bg-teal-800"
              asChild
            >
              <Link to="/login">Sign in</Link>
            </Button>
          ) : null}

          {!isAuthenticated && showRegister ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-teal-200 bg-teal-50/80 px-4 text-teal-800 hover:bg-teal-100"
              asChild
            >
              <Link to="/register">Register for free</Link>
            </Button>
          ) : null}

          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full border border-teal-100 bg-teal-50 text-teal-800 hover:bg-teal-100"
                aria-label="Open account menu"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <UserRound className="size-4" />
              </Button>

              {menuOpen ? (
                <div className="absolute top-12 right-0 z-50 min-w-[170px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <Link
                    to={profileRoute}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Profile
                  </Link>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-800"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
