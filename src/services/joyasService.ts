import type { Joya } from "../types/joya.types";
import { supabase } from "./supabaseClient";

export const fetchActiveProducts = async (): Promise<Joya[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Joya[];
};

