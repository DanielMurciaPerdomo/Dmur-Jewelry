import { createContext, ReactNode, useEffect, useState } from "react";
import type { AuthContextValue, AuthCredentials } from "../types/auth.types";
import {
  getCurrentSession,
  signInWithEmail,
  signOut as authServiceSignOut,
} from "../services/authService";

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

  const signIn = async (credentials: AuthCredentials) => {
    const session = await signInWithEmail(credentials);
    setIsAuthenticated(Boolean(session));
    return session;
  };

  const signOut = async () => {
    await authServiceSignOut();
    setIsAuthenticated(false);
  };

  const value: AuthContextValue = {
    isAuthenticated,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
