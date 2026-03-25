import type { ProductType } from "../types/joya.types";
import { supabase } from "./supabaseClient";

export const fetchProductTypes = async (): Promise<ProductType[]> => {
  const { data, error } = await supabase
    .from("product_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProductType[];
};

export const fetchProductTypeById = async (id: string): Promise<ProductType | null> => {
  const { data, error } = await supabase.from("product_types").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data as ProductType;
};

export const createProductType = async (
  productType: Omit<ProductType, "id" | "created_at" | "updated_at">
): Promise<ProductType> => {
  const { data, error } = await supabase
    .from("product_types")
    .insert([productType])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ProductType;
};

export const updateProductType = async (
  id: string,
  productType: Partial<Omit<ProductType, "id" | "created_at" | "updated_at">>
): Promise<ProductType> => {
  const { data, error } = await supabase
    .from("product_types")
    .update(productType)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ProductType;
};

export const deleteProductType = async (id: string): Promise<void> => {
  const { error } = await supabase.from("product_types").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
