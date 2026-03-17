import { supabase } from "./supabaseClient";

// 1. Tarjetas de resumen
export interface DashboardSummary {
  total_joyas: number;
  joyas_activas: number;
  joyas_inactivas: number;
  joyas_destacadas: number;
}

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  // Fallback a consultas separadas ya que no hay RPC predefinido en el schema
  const [{ count: total }, { count: active }, { count: inactive }, { count: featured }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", false),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("featured", true),
    ]);

  return {
    total_joyas: total || 0,
    joyas_activas: active || 0,
    joyas_inactivas: inactive || 0,
    joyas_destacadas: featured || 0,
  };
};

// 2. Distribución por tipo y material
export interface DistributionItem {
  name: string;
  count: number;
}

export const fetchDistributionByType = async (): Promise<DistributionItem[]> => {
  // Fetch all active products and aggregate in client
  const { data, error } = await supabase
    .from("products")
    .select("id, product_types (name)")
    .eq("active", true);

  if (error) throw error;

  const distribution: Record<string, number> = {};
  (data || []).forEach((item: any) => {
    const typeName = item.product_types?.name || "Sin tipo";
    distribution[typeName] = (distribution[typeName] || 0) + 1;
  });

  return Object.entries(distribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

export const fetchDistributionByMaterial = async (): Promise<DistributionItem[]> => {
  // Fetch all active products and aggregate in client
  const { data, error } = await supabase
    .from("products")
    .select("id, materials (name)")
    .eq("active", true);

  if (error) throw error;

  const distribution: Record<string, number> = {};
  (data || []).forEach((item: any) => {
    const materialName = item.materials?.name || "Sin material";
    distribution[materialName] = (distribution[materialName] || 0) + 1;
  });

  return Object.entries(distribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

// 3. Precios
export interface PriceStats {
  avg_price: number;
  max_price: number;
  min_price: number;
  avg_margin: number;
}

export const fetchPriceStats = async (): Promise<PriceStats> => {
  // Fallback: Consulta agregada en el cliente
  const { data, error } = await supabase
    .from("products")
    .select("final_price, margin_percentage")
    .eq("active", true);

  if (error) throw error;

  const prices = data || [];
  if (prices.length === 0) {
    return { avg_price: 0, max_price: 0, min_price: 0, avg_margin: 0 };
  }

  const finalPrices = prices.map((p: any) => p.final_price);
  const margins = prices.map((p: any) => p.margin_percentage);

  const sumPrices = finalPrices.reduce((a: number, b: number) => a + b, 0);
  const sumMargins = margins.reduce((a: number, b: number) => a + b, 0);

  return {
    avg_price: sumPrices / prices.length,
    max_price: Math.max(...finalPrices),
    min_price: Math.min(...finalPrices),
    avg_margin: sumMargins / prices.length,
  };
};

// 4. Contenido
export interface ContentStats {
  total_materiales: number;
  total_tipos: number;
  total_piedras: number;
}

export const fetchContentStats = async (): Promise<ContentStats> => {
  const [{ count: materialsCount }, { count: typesCount }, { count: stonesCount }] =
    await Promise.all([
      supabase.from("materials").select("*", { count: "exact", head: true }),
      supabase.from("product_types").select("*", { count: "exact", head: true }),
      supabase.from("stones").select("*", { count: "exact", head: true }),
    ]);

  return {
    total_materiales: materialsCount || 0,
    total_tipos: typesCount || 0,
    total_piedras: stonesCount || 0,
  };
};

// 5. Alertas
export interface AlertItem {
  id: string;
  name: string;
  sku?: string;
}

export const fetchProductsWithoutImages = async (): Promise<AlertItem[]> => {
  // Subconsulta para IDs de productos con imágenes
  const { data: productsWithImages, error: errorImages } = await supabase
    .from("product_images")
    .select("product_id");

  if (errorImages) throw errorImages;

  const idsWithImages = productsWithImages?.map((img) => img.product_id) || [];

  // Obtener productos que NO están en la lista de IDs con imágenes
  let query = supabase.from("products").select("id, name, sku").eq("active", true);

  if (idsWithImages.length > 0) {
    // Nota: `not.in` puede fallar si la lista es muy grande.
    // Si ocurre un error de tamaño, se podría usar una función RPC o limitar la cantidad de datos.
    // Asumimos que el dashboard no manejará miles de productos sin imágenes simultáneamente.
    query = query.not("id", "in", `(${idsWithImages.join(",")})`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
  }));
};

export const fetchInactiveProducts = async (): Promise<AlertItem[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku")
    .eq("active", false)
    .limit(100); // Limitar para el dashboard

  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
  }));
};

// 6. Actividad Reciente
export interface RecentActivity {
  id: string;
  name: string;
  created_at: string;
  final_price: number;
}

export const fetchRecentProducts = async (): Promise<RecentActivity[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, created_at, final_price")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;

  return (data || []) as RecentActivity[];
};
