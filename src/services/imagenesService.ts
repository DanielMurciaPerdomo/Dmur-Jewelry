import { supabase } from "./supabaseClient";
import type { ProductImage } from "../types/joya.types";

const PRODUCTS_BUCKET = "products";

export const getProductImages = async (productId: string): Promise<ProductImage[]> => {
  const { data, error } = await supabase
    .from("product_images")
    .select(
      "id, product_id, storage_path, public_url, is_primary, sort_order, created_at, updated_at"
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProductImage[];
};

export const uploadProductImage = async (productId: string, file: File): Promise<ProductImage> => {
  // Sanitizar el nombre del archivo: reemplazar espacios por guiones y eliminar caracteres especiales
  const sanitizedFileName = file.name
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Caracteres especiales a guiones bajos
    .replace(/--+/g, "-"); // Múltiples guiones a uno solo

  const filePath = `${productId}/${Date.now()}-${sanitizedFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      storage_path: filePath,
      public_url: publicUrl,
    })
    .select(
      "id, product_id, storage_path, public_url, is_primary, sort_order, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as ProductImage;
};

export const setPrimaryImage = async (
  productId: string,
  imageId: string
): Promise<ProductImage> => {
  const { error: clearError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  if (clearError) {
    throw clearError;
  }

  const { data, error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .select(
      "id, product_id, storage_path, public_url, is_primary, sort_order, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as ProductImage;
};

export const deleteProductImage = async (image: ProductImage): Promise<void> => {
  const { error: storageError } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .remove([image.storage_path]);

  if (storageError) {
    throw storageError;
  }

  const { error } = await supabase.from("product_images").delete().eq("id", image.id);

  if (error) {
    throw error;
  }
};
