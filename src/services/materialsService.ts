import type { Material } from "../types/joya.types";
import { supabase } from "./supabaseClient";

export const fetchMaterials = async (): Promise<Material[]> => {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Material[];
};
