import type {
  Joya,
  JoyaWithRelations,
  ProductImage,
  Stone,
  ProductType,
} from "../types/joya.types";
import { supabase } from "./supabaseClient";

type RawProductRow = Joya & {
  materials?: {
    id: string;
    name: string;
    value_per_gram: number;
    description: string;
    created_at: string;
    updated_at: string;
  } | null;
  product_types?: {
    id: string;
    name: string;
    type_value: number;
    created_at: string;
    updated_at: string;
  } | null;
  product_images?: ProductImage[] | null;
  product_stones?:
    | {
        id: string;
        quantity: number;
        stones: Stone;
      }[]
    | null;
};

const baseProductSelectPublic = `
  id, name, slug, description, material_id, product_type_id, sku, fixed_cost, margin_percentage, final_price, active, featured, weight_grams, created_at, updated_at,
  materials (
    id,
    name,
    value_per_gram,
    description,
    created_at,
    updated_at
  ),
  product_types (
    id,
    name,
    type_value,
    created_at,
    updated_at
  ),
  product_images (
    id,
    product_id,
    storage_path,
    public_url,
    is_primary,
    sort_order,
    created_at,
    updated_at
  ),
  product_stones (
    id,
    quantity,
    stones (
      id,
      stone_type,
      stone_size,
      stone_value,
      created_at,
      updated_at
    )
  )
`;

const baseProductSelectAdmin = `
  *,
  materials (
    id,
    name,
    value_per_gram,
    description,
    created_at,
    updated_at
  ),
  product_types (
    id,
    name,
    type_value,
    created_at,
    updated_at
  ),
  product_images (
    id,
    product_id,
    storage_path,
    public_url,
    is_primary,
    sort_order,
    created_at,
    updated_at
  ),
  product_stones (
    id,
    quantity,
    stones (
      id,
      stone_type,
      stone_size,
      stone_value,
      created_at,
      updated_at
    )
  )
`;

const mapRawProduct = (row: RawProductRow): JoyaWithRelations => {
  const images = (row.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const primary = images.find((img) => img.is_primary) ?? images[0] ?? null;
  const stones =
    row.product_stones?.map((ps) => ({
      ...ps.stones,
      quantity: ps.quantity,
    })) ?? [];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    material_id: row.material_id,
    product_type_id: row.product_type_id,
    sku: row.sku,
    fixed_cost: row.fixed_cost,
    margin_percentage: row.margin_percentage,
    final_price: row.final_price,
    active: row.active,
    featured: row.featured,
    weight_grams: row.weight_grams,
    phy_url: row.phy_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    material: row.materials!,
    product_type: row.product_types!,
    primary_image: primary,
    images,
    stones,
  };
};

export const fetchActiveProducts = async (filters?: {
  name?: string;
  sku?: string;
  productTypeId?: string;
}): Promise<Joya[]> => {
  let query = supabase.from("products").select("*").eq("active", true);

  if (filters?.name) {
    query = query.ilike("name", `%${filters.name}%`);
  }
  if (filters?.sku) {
    query = query.ilike("sku", `%${filters.sku}%`);
  }
  if (filters?.productTypeId) {
    query = query.eq("product_type_id", filters.productTypeId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Joya[];
};

export const fetchAllProducts = async (filters?: {
  name?: string;
  sku?: string;
  productTypeId?: string;
}): Promise<Joya[]> => {
  let query = supabase.from("products").select("*");

  if (filters?.name) {
    query = query.ilike("name", `%${filters.name}%`);
  }
  if (filters?.sku) {
    query = query.ilike("sku", `%${filters.sku}%`);
  }
  if (filters?.productTypeId) {
    query = query.eq("product_type_id", filters.productTypeId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Joya[];
};

export const fetchActiveProductsWithRelations = async (): Promise<JoyaWithRelations[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(baseProductSelectPublic)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as RawProductRow[];
  return rows.map(mapRawProduct);
};

export const fetchFeaturedProducts = async (): Promise<JoyaWithRelations[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(baseProductSelectPublic)
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as RawProductRow[];
  return rows.map(mapRawProduct);
};

export const fetchProductById = async (id: string): Promise<JoyaWithRelations | null> => {
  const { data, error } = await supabase
    .from("products")
    .select(baseProductSelectAdmin)
    .eq("id", id)
    .limit(1)
    .maybeSingle<RawProductRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapRawProduct(data);
};

export const fetchProductBySlug = async (slug: string): Promise<JoyaWithRelations | null> => {
  const { data, error } = await supabase
    .from("products")
    .select(baseProductSelectPublic)
    .eq("slug", slug)
    .limit(1)
    .maybeSingle<RawProductRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapRawProduct(data);
};

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

// CRUD Operations
export const createProduct = async (
  product: Omit<Joya, "id" | "created_at" | "updated_at">
): Promise<Joya> => {
  const { data, error } = await supabase.from("products").insert([product]).select().single();

  if (error) {
    throw error;
  }

  return data as Joya;
};

export const updateProduct = async (id: string, updates: Partial<Joya>): Promise<Joya> => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Joya;
};

export const fetchProductSuggestionsByName = async (nameTerm: string): Promise<Joya[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, sku")
    .ilike("name", `%${nameTerm}%`)
    .limit(10)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []) as Joya[];
};

export const fetchProductSuggestionsBySku = async (skuTerm: string): Promise<Joya[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, sku")
    .ilike("sku", `%${skuTerm}%`)
    .limit(10)
    .order("sku", { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []) as Joya[];
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
