import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export interface AuthCredentials {
  email: string;
  password: string;
}

export const getCurrentSession = async (): Promise<Session | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
};

export const signInWithEmail = async ({
  email,
  password,
}: AuthCredentials): Promise<Session | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.session ?? null;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

