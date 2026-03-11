import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export const getCurrentSession = async (): Promise<Session | null> => {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session;
};

