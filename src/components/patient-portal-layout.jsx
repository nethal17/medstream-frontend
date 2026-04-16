import { Bell, LogOut, UserCircle2 } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { setAccessToken } from "@/services/api";

const navItems = [
  { label: "Appointments", href: "/doctors" },
  { label: "Find a Doctor", href: "/doctors" },
];

export default function PatientPortalLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAccessToken(null);
    toast.success("Logged out.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link to="/doctors" className="font-semibold text-primary">
              Patient Portal
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
