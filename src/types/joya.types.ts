export interface Material {
  id: string;
  name: string;
  material_value: number;
  description: string;
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

export interface Stone {
  id: string;
  stone_type: string;
  stone_size: string;
  stone_value: number;
  created_at: string;
  updated_at: string;
}

export interface ProductStone {
  id: string;
  product_id: string;
  stone_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string | null;
  is_primary: boolean;
  sort_order: number;
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

export interface JoyaWithRelations extends Joya {
  material: Material;
  product_type: ProductType;
  primary_image: ProductImage | null;
  images: ProductImage[];
  stones: (Stone & { quantity: number })[];
}

export interface CarritoItem {
  product: JoyaWithRelations;
  quantity: number;
}

export interface CarritoContextValue {
  items: CarritoItem[];
  addItem: (item: CarritoItem) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}
