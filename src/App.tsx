import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { useAuth } from "./hooks/useAuthContext";
import AuthPage from "./pages/AuthPage";
import ResourcesPage from "./pages/ResourcesPage";
import BookingsPage from "./pages/BookingsPage";
import AdminPage from "./pages/AdminPage";
import Layout from "./components/Layout";

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  // If the user is not logged in, show the auth page instead of the app
  if (!isAuthenticated) return <AuthPage />;

  return (
    <Routes>
      <Route element={<Layout />}>
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
    <BrowserRouter>
      {/* AuthProvider must wrap ProtectedRoutes so useAuth() works inside it */}
      <AuthProvider>
        <ProtectedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
