import type { ProductStone } from "../types/joya.types";
import { supabase } from "./supabaseClient";

export const fetchProductStones = async (productId: string): Promise<ProductStone[]> => {
  const { data, error } = await supabase
    .from("product_stones")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProductStone[];
};

export const createProductStone = async (
  productStone: Omit<ProductStone, "id" | "created_at" | "updated_at">
): Promise<ProductStone> => {
  const { data, error } = await supabase
    .from("product_stones")
    .insert([productStone])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ProductStone;
};

export const updateProductStone = async (
  id: string,
  productStone: Partial<Omit<ProductStone, "id" | "created_at" | "updated_at">>
): Promise<ProductStone> => {
  const { data, error } = await supabase
    .from("product_stones")
    .update(productStone)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ProductStone;
};

export const deleteProductStone = async (id: string): Promise<void> => {
  const { error } = await supabase.from("product_stones").delete().eq("id", id);

  if (error) {
    throw error;
  }
};

export const deleteProductStonesByProduct = async (productId: string): Promise<void> => {
  const { error } = await supabase.from("product_stones").delete().eq("product_id", productId);

  if (error) {
    throw error;
  }
};
