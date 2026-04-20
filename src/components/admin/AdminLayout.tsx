import { useEffect, useState } from "react";
import { Navigate, Outlet, NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { currentUser, signOut } from "@/lib/adminStore";
import logo from "@/assets/ranola-logo.jpg";
import { cn } from "@/lib/utils";

const items = [
  { to: "/ranola-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ranola-admin/sales", label: "Sales", icon: Receipt },
  { to: "/ranola-admin/expenses", label: "Expenses", icon: Wallet },
  { to: "/ranola-admin/reports", label: "Reports", icon: BarChart3 },
];

export const AdminLayout = () => {
  const user = currentUser();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [loc.pathname]);

  if (!user) return <Navigate to="/ranola-admin" replace state={{ from: loc.pathname }} />;

  const handleSignOut = () => {
    signOut();
    nav("/ranola-admin", { replace: true });
  };

  const Sidebar = (
    <aside className="bg-sidebar text-sidebar-foreground h-full w-full md:w-64 flex flex-col">
      <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
        <div className="h-10 w-10 rounded-sm overflow-hidden bg-sidebar-accent">
          <img src={logo} alt="Rañola" className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="font-serif text-base">Rañola</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Admin</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" /> {it.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2">
          <div className="text-xs text-sidebar-foreground/60">Signed in as</div>
          <div className="text-sm truncate">{user.name || user.email}</div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <Link
          to="/"
          className="block text-center text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80 mt-3"
        >
          ← Back to website
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen">{Sidebar}</div>

      {/* Mobile sidebar */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[85vw] h-full">{Sidebar}</div>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex-1 bg-foreground/40 backdrop-blur-sm"
          />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border h-14 flex items-center justify-between px-4">
          <button onClick={() => setOpen(true)} className="p-2 -ml-2">
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-serif">Rañola Admin</div>
          <div className="w-9" />
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
