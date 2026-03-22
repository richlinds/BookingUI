import { useState, useCallback, ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api/client";
import { User } from "../types";

// AuthProvider wraps the app and makes auth state available to all child components
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    api.setToken(data.access_token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    setToken(data.access_token);
    setUser(data.user);
    api.setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    api.setToken(null);
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
