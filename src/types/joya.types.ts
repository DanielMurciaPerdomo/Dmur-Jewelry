export interface Material {
  id: string;
  name: string;
  material_value: number;
  created_at: string;
  updated_at: string;
}

export interface ProductType {
  id: string;
  name: string;
  type_value: number;
  created_at: string;
  updated_at: string;
}

export interface Joya {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  material_id: string;
  product_type_id: string;
  sku: string | null;
  fixed_cost: number;
  margin_percentage: number;
  final_price: number;
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarritoItem {
  product: Joya;
  quantity: number;
}

export interface CarritoContextValue {
  items: CarritoItem[];
  addItem: (item: CarritoItem) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

