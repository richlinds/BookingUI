import { useContext } from "react";
import { AuthContext, AuthContextType } from "../context/AuthContext";

// Custom hook that components use to access auth state
// Kept separate from AuthProvider so each file exports one type of thing
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
