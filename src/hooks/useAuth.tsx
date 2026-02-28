import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { User } from "../types";
import { api } from "../api/client";

// Define the shape of everything the auth context provides
// Any component that calls useAuth() will get these values
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean; // Convenience boolean so components don't have to check !!token
}

// createContext creates a React context — a way to share state across many components
// without passing props down through every level (prop drilling)
// null is the default value — it gets replaced once AuthProvider wraps the app
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider wraps the app and makes auth state available to all child components
// ReactNode is the TypeScript type for anything React can render — components, strings, etc.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // useCallback memoizes the function so it's only recreated when dependencies change
  // Without this, a new function reference would be created on every render,
  // which could cause unnecessary re-renders in child components that depend on it
  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    // Also set the token on the API client so future requests include the Authorization header
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
    // Clear the token from the API client so future requests are unauthenticated
    api.setToken(null);
  }, []);

  return (
    // AuthContext.Provider makes the value available to all components inside it
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token, // !! converts any value to a boolean
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook that components use to access auth state
// Throwing an error if used outside the provider gives a clear message
// instead of a confusing "cannot read properties of null" error
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
