import { createContext } from "react";
import { User } from "../types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Kept in its own file so AuthProvider and useAuth can both import it
// without violating react-refresh rules (a file should export one type of thing)
export const AuthContext = createContext<AuthContextType | null>(null);
