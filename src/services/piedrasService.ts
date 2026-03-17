import type { Stone } from "../types/joya.types";
import { supabase } from "./supabaseClient";

export const fetchStones = async (): Promise<Stone[]> => {
  const { data, error } = await supabase
    .from("stones")
    .select("*")
    .order("stone_type", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Stone[];
};

export const fetchStoneById = async (id: string): Promise<Stone | null> => {
  const { data, error } = await supabase.from("stones").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data as Stone;
};

export const createStone = async (
  stone: Omit<Stone, "id" | "created_at" | "updated_at">
): Promise<Stone> => {
  const { data, error } = await supabase.from("stones").insert([stone]).select().single();

  if (error) {
    throw error;
  }

  return data as Stone;
};

export const updateStone = async (
  id: string,
  stone: Partial<Omit<Stone, "id" | "created_at" | "updated_at">>
): Promise<Stone> => {
  const { data, error } = await supabase
    .from("stones")
    .update(stone)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Stone;
};

export const deleteStone = async (id: string): Promise<void> => {
  const { error } = await supabase.from("stones").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
