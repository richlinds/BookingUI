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
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    setToken(data.access_token);
    setUser(data.user);
    api.setToken(data.access_token);
    api.setRefreshToken(data.refresh_token);
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
