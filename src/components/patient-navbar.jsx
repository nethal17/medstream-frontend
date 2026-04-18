import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { Bell, HeartPulse, LogOut, RefreshCw, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { ROLES, getHomeRouteForRole } from "@/lib/auth";
import logoImage from "@/assets/logo.png";
import { getCurrentUserProfile } from "@/services/auth";
import { getDoctorMe } from "@/services/doctors";

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
  const { isAuthenticated, role, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [authUserId, setAuthUserId] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const {
    items: notifications,
    unreadCount,
    isConnected,
    isHydrating,
    markRead,
    markAllRead,
    reconnect,
  } = useRealtimeNotifications(user?.accessToken, authUserId);

  const profileRoute = role === ROLES.PATIENT ? "/patient/profile" : getHomeRouteForRole(role);

  useEffect(() => {
    let ignore = false;

    async function loadProfileName() {
      if (!isAuthenticated) {
        setDisplayName("");
        setAuthUserId("");
        return;
      }

      try {
        let resolvedName = "";
        let profile = null;
        if (role === ROLES.DOCTOR) {
          // Try to get doctor profile for doctor users
          profile = await getDoctorMe();
          resolvedName =
            profile?.full_name ||
            profile?.fullName ||
            profile?.name ||
            [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
            "";
        } else {
          profile = await getCurrentUserProfile();
          resolvedName =
            profile?.full_name ||
            profile?.fullName ||
            profile?.name ||
            [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
            "";
        }
        if (ignore) {
          return;
        }
        setAuthUserId(String(profile?.id || profile?.user_id || ""));
        setDisplayName(resolvedName);
      } catch {
        if (!ignore) {
          setDisplayName("");
          setAuthUserId("");
        }
      }
    }

    loadProfileName();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, role]);

  const handleLogout = () => {
    setMenuOpen(false);
    setNotificationsOpen(false);
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
          {isAuthenticated ? (
            <span className="hidden max-w-[220px] truncate text-sm font-medium text-slate-700 md:block">
              {displayName || "My Account"}
            </span>
          ) : null}

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
                className="relative rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                aria-label="Open notifications"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setMenuOpen(false);
                }}
              >
                <Bell className="size-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-rose-500 px-1.5 text-center text-[10px] font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full border border-teal-100 bg-teal-50 text-teal-800 hover:bg-teal-100"
                aria-label="Open account menu"
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
              >
                <UserRound className="size-4" />
              </Button>

              {notificationsOpen ? (
                <div className="absolute top-12 right-12 z-50 w-[340px] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <span className="text-xs text-slate-500">
                      {isConnected ? "Realtime connected" : "Realtime reconnecting"}
                    </span>
                  </div>

                  <div className="mb-2 flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-medium text-teal-700 hover:underline"
                      disabled={isHydrating || notifications.length === 0}
                    >
                      Mark all read
                    </button>
                    <button
                      type="button"
                      onClick={reconnect}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                      <RefreshCw className="size-3.5" />
                      Reconnect
                    </button>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.slice(0, 12).map((item) => (
                      <button
                        key={item.notification_id || `${item.event_type}-${item.created_at}`}
                        type="button"
                        onClick={() => {
                          if (item.notification_id && !item.is_read) {
                            markRead(item.notification_id);
                          }
                        }}
                        className={[
                          "mb-1 block w-full rounded-lg px-2 py-2 text-left transition-colors",
                          item.is_read ? "hover:bg-slate-50" : "bg-teal-50/70 hover:bg-teal-100/70",
                        ].join(" ")}
                      >
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{item.message || item.event_type}</p>
                      </button>
                    ))}

                    {notifications.length === 0 ? (
                      <p className="px-2 py-6 text-center text-sm text-slate-500">
                        {isHydrating ? "Loading notifications..." : "No notifications yet."}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {menuOpen ? (
                <div className="absolute top-12 right-0 z-50 min-w-[170px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  {displayName ? (
                    <div className="px-3 py-2">
                      <p className="max-w-[220px] truncate text-sm font-semibold text-slate-800">{displayName}</p>
                      <p className="text-xs text-slate-500">Signed in</p>
                    </div>
                  ) : null}

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
