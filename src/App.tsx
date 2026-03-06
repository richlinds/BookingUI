import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import ResourcesPage from "./pages/ResourcesPage";
import BookingsPage from "./pages/BookingsPage";
import AdminPage from "./pages/AdminPage";
import Layout from "./components/Layout";

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  // If the user is not logged in, show the auth page instead of the app
  // This is the auth guard — all routes inside are protected
  if (!isAuthenticated) return <AuthPage />;

  return (
    <Routes>
      {/* Layout wraps all routes — it renders the nav header and an Outlet for child routes */}
      <Route element={<Layout />}>
        {/* Redirect the root path to /resources by default */}
        <Route index element={<Navigate to="/resources" replace />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    // BrowserRouter enables client-side routing using the browser's History API
    // This means navigating between pages doesn't reload the page
    <BrowserRouter>
      {/* AuthProvider must wrap ProtectedRoutes so useAuth() works inside it */}
      <AuthProvider>
        <ProtectedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
