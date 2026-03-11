## Data model – Dmur Jewelry

Reference document for the Supabase (PostgreSQL) database of the Dmur Jewelry project.

Includes:
- Final tables and columns.
- Relationships and keys.
- UUID and timestamp conventions.
- Notes about price calculation.

---

## General conventions

- **Engine**: PostgreSQL (managed by Supabase).
- **Primary keys**:
  - All business tables use `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`.
- **Timestamps**:
  - All tables have:
    - `created_at timestamptz NOT NULL DEFAULT now()`
    - `updated_at timestamptz NOT NULL DEFAULT now()`
  - A trigger in PostgreSQL/Supabase is recommended to update `updated_at` on every `UPDATE`.
- **Soft delete**:
  - For now there is **no** `deleted_at` / soft delete; deletes are physical.
- **Names**:
  - English names for tables and internal columns (`products`, `materials`, etc.).
  - UI copy (product names, descriptions shown to users) can be in Spanish.
- **Currency**:
  - Main currency is **Colombian peso (COP)** by default, configurable in the `settings` table.

---

## Tables overview

- `products`: Main jewelry catalog.
- `materials`: Materials for the products (gold, silver, steel, etc.).
- `product_types`: Product types (ring, necklace, bracelet, etc.).
- `stones`: Stones associated with products (type, size, value).
- `product_images`: Images associated to each product (N per product).
- `settings`: Global business configuration (WhatsApp number, currency, etc.).

The users table is not defined here, since admin authentication is handled by **Supabase Auth**. If later you need extended profiles, you can add a `profiles` table linked to `auth.users`.

---

## Table `materials`

Single material per product; normalized in this table.

**Purpose**: avoid repeating material texts and allow filtering products by material, and track the material value.

**Columns**:

- `id uuid PK`
- `name text NOT NULL UNIQUE`  
  Examples: `"Gold 18K"`, `"Silver 925"`, `"Surgical steel"`.
- `material_value numeric(10,2) NOT NULL`  
  Base value/cost associated with this material.
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Reference SQL**:

```sql
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  material_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## Table `product_types`

Normalized product type (ring, necklace, etc.), with its own base value.

**Columns**:

- `id uuid PK`
- `name text NOT NULL UNIQUE`  
  Examples: `"Ring"`, `"Necklace"`, `"Bracelet"`, `"Earrings"`.
- `type_value numeric(10,2) NOT NULL`  
  Base value associated to this type of product.
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Reference SQL**:

```sql
create table public.product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## Table `products`

Main catalog table.

**Key decisions**:
- One material per product: `material_id` → `materials.id`.
- One normalized product type per product: `product_type_id` → `product_types.id`.
- One or more stones per product (optional): relation with `stones`.
- Multiple images per product: relation with `product_images`.
- Price split into:
  - `fixed_cost`
  - `margin_percentage`
  - `final_price` (manually editable).

**Columns**:

- `id uuid PK`
- `name text NOT NULL`  
  Commercial product name.
- `slug text UNIQUE`  
  Slug for friendly URLs (`/product/<slug>`).
- `description text`  
  Long product description.
- `material_id uuid NOT NULL`  
  FK to `materials.id`.
- `product_type_id uuid NOT NULL`  
  FK to `product_types.id`.
- `sku text UNIQUE`  
  Optional internal reference code.
- `fixed_cost numeric(10,2) NOT NULL`  
  Base cost of the product (materials, labor, etc.).
- `margin_percentage numeric(5,2) NOT NULL`  
  Margin applied over the cost (e.g. `30.00` for 30%).
- `final_price numeric(10,2) NOT NULL`  
  Final price shown to the customer, **editable** by the admin.
- `active boolean NOT NULL DEFAULT true`  
  Whether the product is visible in the public catalog.
- `featured boolean NOT NULL DEFAULT false`  
  Whether the product is highlighted.
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Keys and relationships**:

- `PRIMARY KEY (id)`
- `FOREIGN KEY (material_id) REFERENCES materials(id)`
- `FOREIGN KEY (product_type_id) REFERENCES product_types(id)`
- Recommended indexes:
  - `index_products_material_id`
  - `index_products_product_type_id`
  - `index_products_active`

**Reference SQL**:

```sql
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  material_id uuid not null references public.materials(id),
  product_type_id uuid not null references public.product_types(id),
  sku text unique,
  fixed_cost numeric(10,2) not null,
  margin_percentage numeric(5,2) not null,
  final_price numeric(10,2) not null,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index index_products_material_id on public.products(material_id);
create index index_products_product_type_id on public.products(product_type_id);
create index index_products_active on public.products(active);
```

---

## Table `stones`

Master table of stones that can be used in one or many products.

**Columns**:

- `id uuid PK`
- `stone_type text NOT NULL`  
  Type of stone (e.g. `"Diamond"`, `"Emerald"`, `"Zirconia"`).
- `stone_size text NOT NULL`  
  Size information (could be in mm, carats, or a descriptive size; stored as text).
- `stone_value numeric(10,2) NOT NULL`  
  Base value of this stone.
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Keys**:

- `PRIMARY KEY (id)`

**Reference SQL**:

```sql
create table public.stones (
  id uuid primary key default gen_random_uuid(),
  stone_type text not null,
  stone_size text not null,
  stone_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## Table `product_stones`

Join table for the many-to-many relationship between `products` and `stones`.

**Columns**:

- `id uuid PK`
- `product_id uuid NOT NULL`  
  FK to `products.id`.
- `stone_id uuid NOT NULL`  
  FK to `stones.id`.
- `quantity integer NOT NULL DEFAULT 1`  
  How many stones of this type are used in the product.
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Keys and relationships**:

- `PRIMARY KEY (id)`
- `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`
- `FOREIGN KEY (stone_id) REFERENCES stones(id) ON DELETE RESTRICT`
- Recommended indexes:
  - `index_product_stones_product_id`
  - `index_product_stones_stone_id`

**Reference SQL**:

```sql
create table public.product_stones (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  stone_id uuid not null references public.stones(id) on delete restrict,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index index_product_stones_product_id on public.product_stones(product_id);
create index index_product_stones_stone_id on public.product_stones(stone_id);
```

---

## Table `product_images`

Images associated to each product. The actual image is stored in **Supabase Storage**; this table stores the reference.

**Columns**:

- `id uuid PK`
- `product_id uuid NOT NULL`  
  FK to `products.id`.
- `storage_path text NOT NULL`  
  Path in the Supabase Storage bucket (for example: `products/uuid/image-1.jpg`).
- `public_url text`  
  Public or signed URL, if you decide to cache it.
- `is_primary boolean NOT NULL DEFAULT false`  
  Marks the main image of the product.
- `sort_order integer NOT NULL DEFAULT 0`  
  Defines the order of the images (0, 1, 2, …).
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Keys and relationships**:

- `PRIMARY KEY (id)`
- `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`
- Indexes:
  - `index_product_images_product_id`
  - `index_product_images_is_primary`

**Reference SQL**:

```sql
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index index_product_images_product_id on public.product_images(product_id);
create index index_product_images_is_primary on public.product_images(is_primary);
```

---

## Table `settings`

Global configuration editable from the admin panel. It starts with a **simple** structure that can be extended later.

**Recommended usage**:
- Use a single row for global configuration.

**Columns**:

- `id uuid PK`
- `whatsapp_number text NOT NULL`  
  Number in international format, without `+` or spaces (example: `573001234567`).  
  Used to build the link `https://wa.me/<whatsapp_number>?text=<encoded_message>`.
- `currency text NOT NULL DEFAULT 'COP'`  
  Main currency code (default to Colombian peso).
- `business_name text`  
  Business name (optional, for headers and SEO).
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Notes**:
- You can enforce a “singleton table” constraint later (for example, with a check ensuring only one row), or handle it in the application.

**Reference SQL**:

```sql
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text not null,
  currency text not null default 'COP',
  business_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## Table relationships

- `products.material_id` → `materials.id` (N products per material).
- `products.product_type_id` → `product_types.id` (N products per product type).
- `product_stones.product_id` → `products.id` (N rows per product-stone combination; `ON DELETE CASCADE`).
- `product_stones.stone_id` → `stones.id` (N rows per product-stone combination).
- `product_images.product_id` → `products.id` (N images per product; `ON DELETE CASCADE`).
- `settings` has no FKs for now; it is logically linked to the application for:
  - WhatsApp number used in the cart link.
  - Currency and business name.

Conceptual diagram (simplified):

```text
materials (1) ────< (N) products (1) ────< (N) product_images

product_types (1) ────< (N) products

stones (1) ────< (N) product_stones (N) ────> (1) products

settings: global configuration (1 row)
```

---

## Price calculation notes

In the `products` table, price-related fields are:

- `fixed_cost`:
  - Base cost of the product.
  - Includes materials, labor and other direct costs.
- `margin_percentage`:
  - Percentage margin to apply over the cost.
  - Example: `30.00` represents a 30% margin.
- `final_price`:
  - Final price shown in the catalog.
  - It is **manually editable** by the administrator.

**Recommended reference formula** (not mandatory):

```text
suggested_price = fixed_cost * (1 + margin_percentage / 100)
```

**Recommended admin panel behavior**:

- When creating or editing a product:
  - Calculate and show `suggested_price` based on `fixed_cost` and `margin_percentage`.
  - Allow the admin to:
    - Accept `suggested_price` as `final_price`, or
    - Manually adjust `final_price` (for example to round it).
- Always store the three fields so you can later review:
  - How the price was composed.
  - What the effective margin is in practice.

With this model:
- The frontend shows the **final_price** to customers.
- The backend and admin panel can use `fixed_cost` and `margin_percentage` for internal analysis and price simulations, while materials, product types and stones store their own value contributions.

