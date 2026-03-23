// NavLink and Outlet are from React Router
// NavLink is like a regular <a> tag but adds an "active" class when the route matches
// Outlet renders whichever child route is currently active — like a slot in the layout
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  // Build nav items dynamically — only show Admin tab to admin users
  const navItems = [
    { to: "/resources", label: "Resources" },
    { to: "/bookings", label: "My Bookings" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-surface text-gray-200 font-sans">
      {/* sticky top-0 keeps the header visible as you scroll */}
      <header className="sticky top-0 z-10 bg-surface border-b border-border flex items-center gap-6 px-6 py-3">
        <h1 className="text-xl font-bold text-accent tracking-tight">bookd.</h1>

        <nav className="flex gap-1 flex-1">
          {navItems.map(({ to, label }) => (
            // NavLink passes an isActive boolean to the className function
            // so we can apply different styles to the current page's link
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-border text-gray-100"
                    : "text-gray-500 hover:text-gray-300"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.name}</span>
          {/* ?. is optional chaining — safely access name even if user is null */}
          <button
            onClick={logout}
            className="text-sm border border-border text-gray-500 rounded-lg px-3 py-1.5 hover:text-gray-300"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Outlet renders the matched child route — ResourcesPage, BookingsPage, or AdminPage */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
