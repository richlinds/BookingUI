import { useState, useCallback, useEffect, ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api/client";
import { User } from "../types";

// AuthProvider wraps the app and makes auth state available to all child components
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    // Clear both tokens from the API client
    api.setToken(null);
    api.setRefreshToken(null);
    // Clear from sessionStorage (httpOnly cookies are cleared by browser on logout)
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("refresh_token");
  }, []);

  // Restore auth from sessionStorage on mount
  // SECURITY NOTE: sessionStorage is cleared when the browser tab is closed
  // For production, switch to httpOnly cookies set by the backend:
  // Backend should set "access_token" and "refresh_token" as httpOnly cookies
  // and the browser will automatically send them with requests
  useEffect(() => {
    const savedToken = sessionStorage.getItem("auth_token");
    const savedUser = sessionStorage.getItem("auth_user");
    const savedRefreshToken = sessionStorage.getItem("refresh_token");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      api.setToken(savedToken);
      if (savedRefreshToken) {
        api.setRefreshToken(savedRefreshToken);
      }
    }
  }, []);

  // Register the logout callback with the API client on mount
  // This means any 401 that can't be recovered with a refresh token
  // will automatically call logout and redirect to the login page
  useEffect(() => {
    api.setOnUnauthorized(logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    // Store both tokens on the API client
    api.setToken(data.access_token);
    api.setRefreshToken(data.refresh_token);
    // Persist to sessionStorage (cleared when browser tab closes)
    sessionStorage.setItem("auth_token", data.access_token);
    sessionStorage.setItem("auth_user", JSON.stringify(data.user));
    sessionStorage.setItem("refresh_token", data.refresh_token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    setToken(data.access_token);
    setUser(data.user);
    api.setToken(data.access_token);
    api.setRefreshToken(data.refresh_token);
    // Persist to sessionStorage (cleared when browser tab closes)
    sessionStorage.setItem("auth_token", data.access_token);
    sessionStorage.setItem("auth_user", JSON.stringify(data.user));
    sessionStorage.setItem("refresh_token", data.refresh_token);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
