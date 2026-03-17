-- Dmur Jewelry - Esquema principal
-- Proyecto Supabase: "D'MUR Joyería"
-- Este script crea tablas, índices y trigger de updated_at

-- Extensión necesaria para gen_random_uuid (suele venir ya activa en Supabase)
create extension if not exists "pgcrypto";

-- ============================================================================
-- Función genérica para actualizar updated_at en cada UPDATE
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- Tabla materials
-- ============================================================================

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  material_value numeric(10,2) not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Tabla product_types
-- ============================================================================

create table if not exists public.product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Tabla products
-- ============================================================================

create table if not exists public.products (
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

create index if not exists index_products_material_id
  on public.products(material_id);

create index if not exists index_products_product_type_id
  on public.products(product_type_id);

create index if not exists index_products_active
  on public.products(active);

-- ============================================================================
-- Tabla stones
-- ============================================================================

create table if not exists public.stones (
  id uuid primary key default gen_random_uuid(),
  stone_type text not null,
  stone_size text not null,
  stone_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Tabla product_stones (relación many-to-many products <-> stones)
-- ============================================================================

create table if not exists public.product_stones (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  stone_id uuid not null references public.stones(id) on delete restrict,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists index_product_stones_product_id
  on public.product_stones(product_id);

create index if not exists index_product_stones_stone_id
  on public.product_stones(stone_id);

-- ============================================================================
-- Tabla product_images
-- ============================================================================

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists index_product_images_product_id
  on public.product_images(product_id);

create index if not exists index_product_images_is_primary
  on public.product_images(is_primary);

-- ============================================================================
-- Tabla settings (configuración global, una sola fila lógica)
-- ============================================================================

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text not null,
  currency text not null default 'COP',
  business_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Triggers updated_at para todas las tablas de negocio
-- (idempotentes usando verificación en pg_trigger)
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_timestamp_materials'
  ) then
    create trigger set_timestamp_materials
    before update on public.materials
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_timestamp_product_types'
  ) then
    create trigger set_timestamp_product_types
    before update on public.product_types
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_timestamp_products'
  ) then
    create trigger set_timestamp_products
    before update on public.products
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_timestamp_stones'
  ) then
    create trigger set_timestamp_stones
    before update on public.stones
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_timestamp_product_stones'
  ) then
    create trigger set_timestamp_product_stones
    before update on public.product_stones
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_timestamp_product_images'
  ) then
    create trigger set_timestamp_product_images
    before update on public.product_images
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_timestamp_settings'
  ) then
    create trigger set_timestamp_settings
    before update on public.settings
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

