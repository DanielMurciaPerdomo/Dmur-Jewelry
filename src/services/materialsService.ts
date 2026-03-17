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

export const createMaterial = async (
  material: Omit<Material, "id" | "created_at" | "updated_at">
): Promise<Material> => {
  const { data, error } = await supabase.from("materials").insert([material]).select().single();

  if (error) {
    throw error;
  }

  return data as Material;
};

export const updateMaterial = async (
  id: string,
  material: Partial<Omit<Material, "id" | "created_at" | "updated_at">>
): Promise<Material> => {
  const { data, error } = await supabase
    .from("materials")
    .update(material)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Material;
};

export const deleteMaterial = async (id: string): Promise<void> => {
  const { error } = await supabase.from("materials").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
