import type { Session } from "@supabase/supabase-js";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<Session | null>;
  signOut: () => Promise<void>;
}
