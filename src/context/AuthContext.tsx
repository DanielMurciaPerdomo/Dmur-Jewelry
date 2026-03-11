import { createContext, ReactNode, useEffect, useState } from "react";
import type { AuthContextValue } from "../types/auth.types";
import { getCurrentSession } from "../services/authService";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        setIsAuthenticated(Boolean(session));
      } finally {
        setLoading(false);
      }
    };

    void checkSession();
  }, []);

  const value: AuthContextValue = {
    isAuthenticated,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

