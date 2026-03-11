import { supabase } from "./supabaseClient";

export const getProductImages = async (productId: string) => {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

