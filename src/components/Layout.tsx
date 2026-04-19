import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuthContext";
import { useTheme } from "../hooks/useTheme";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  const navItems = [
    { to: "/resources", label: "Resources" },
    { to: "/bookings", label: "My Bookings" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-surface text-gray-900 dark:text-gray-100 font-sans">
      <header className="sticky top-0 z-10 bg-surface border-b border-border flex items-center gap-6 px-6 py-3">
        <h1 className="text-xl font-bold text-accent tracking-tight">bookd.</h1>

        <nav className="flex gap-1 flex-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-border text-gray-900 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">{user?.name}</span>
          <button
            onClick={toggle}
            className="text-sm border border-border rounded-lg px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={logout}
            className="text-sm border border-border rounded-lg px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
