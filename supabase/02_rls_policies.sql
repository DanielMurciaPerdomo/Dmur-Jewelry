-- Dmur Jewelry - RLS y Policies
-- Proyecto Supabase: "D'MUR Joyería"
-- Matriz de acceso basada en plan-Dmur.md §7
--
-- Supuesto actual de admin:
--   Se considera "admin" a cualquier usuario con rol auth.role() = 'authenticated'.
--   Esto es coherente mientras solo exista una cuenta de administrador.
--   Si en el futuro se agregan más usuarios autenticados no-admin,
--   se recomienda introducir una tabla de perfiles con flag is_admin
--   o claims personalizados en el JWT y ajustar estas policies.

-- ============================================================================
-- Activar Row Level Security en todas las tablas de negocio
-- ============================================================================

alter table if exists public.products        enable row level security;
alter table if exists public.product_images  enable row level security;
alter table if exists public.materials       enable row level security;
alter table if exists public.product_types   enable row level security;
alter table if exists public.stones          enable row level security;
alter table if exists public.product_stones  enable row level security;
alter table if exists public.settings        enable row level security;

-- Opcional pero recomendable: forzar RLS incluso para el owner
alter table if exists public.products        force row level security;
alter table if exists public.product_images  force row level security;
alter table if exists public.materials       force row level security;
alter table if exists public.product_types   force row level security;
alter table if exists public.stones          force row level security;
alter table if exists public.product_stones  force row level security;
alter table if exists public.settings        force row level security;

-- Helper de condición de admin (actualmente: cualquier usuario autenticado)
-- Se usa como comentario de referencia, no es una función.
--   admin_condition: auth.role() = 'authenticated'

-- ============================================================================
-- Tabla products
--  SELECT: cualquiera (solo active = true)
--  INSERT/UPDATE/DELETE: solo admin autenticado
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'products_select_public_active'
  ) then
    create policy products_select_public_active
      on public.products
      for select
      using (active = true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'products_write_admin_only'
  ) then
    create policy products_write_admin_only
      on public.products
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

-- ============================================================================
-- Tabla product_images
--  SELECT: cualquiera
--  INSERT/UPDATE/DELETE: solo admin autenticado
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_images'
      and policyname = 'product_images_select_public'
  ) then
    create policy product_images_select_public
      on public.product_images
      for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_images'
      and policyname = 'product_images_write_admin_only'
  ) then
    create policy product_images_write_admin_only
      on public.product_images
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

-- ============================================================================
-- Tabla materials
--  SELECT: cualquiera
--  INSERT/UPDATE/DELETE: solo admin autenticado
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'materials'
      and policyname = 'materials_select_public'
  ) then
    create policy materials_select_public
      on public.materials
      for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'materials'
      and policyname = 'materials_write_admin_only'
  ) then
    create policy materials_write_admin_only
      on public.materials
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

-- ============================================================================
-- Tabla product_types
--  SELECT: cualquiera
--  INSERT/UPDATE/DELETE: solo admin autenticado
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_types'
      and policyname = 'product_types_select_public'
  ) then
    create policy product_types_select_public
      on public.product_types
      for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_types'
      and policyname = 'product_types_write_admin_only'
  ) then
    create policy product_types_write_admin_only
      on public.product_types
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

-- ============================================================================
-- Tabla stones
--  SELECT: cualquiera
--  INSERT/UPDATE/DELETE: solo admin autenticado
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'stones'
      and policyname = 'stones_select_public'
  ) then
    create policy stones_select_public
      on public.stones
      for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'stones'
      and policyname = 'stones_write_admin_only'
  ) then
    create policy stones_write_admin_only
      on public.stones
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

-- ============================================================================
-- Tabla product_stones
--  (Tabla de relación; aplicar misma matriz que materials/stones)
--  SELECT: cualquiera
--  INSERT/UPDATE/DELETE: solo admin autenticado
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_stones'
      and policyname = 'product_stones_select_public'
  ) then
    create policy product_stones_select_public
      on public.product_stones
      for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_stones'
      and policyname = 'product_stones_write_admin_only'
  ) then
    create policy product_stones_write_admin_only
      on public.product_stones
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

-- ============================================================================
-- Tabla settings
--  SELECT: cualquiera
--  UPDATE: solo admin autenticado
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'settings'
      and policyname = 'settings_select_public'
  ) then
    create policy settings_select_public
      on public.settings
      for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'settings'
      and policyname = 'settings_update_admin_only'
  ) then
    create policy settings_update_admin_only
      on public.settings
      for update
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

