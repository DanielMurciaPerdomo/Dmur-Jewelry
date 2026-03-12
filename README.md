# Dmur Jewelry — Setup inicial

Proyecto base de Dmur Jewelry creado con **React + TypeScript + Vite**, **Tailwind CSS** y **Supabase**.

Esta fase corresponde a la **Fase 1 — Setup inicial** descrita en `plan-Dmur.md`.

## 1. Stack y scripts

- **Frontend**: React 18 + TypeScript + Vite.
- **Estilos**: Tailwind CSS.
- **BaaS**: Supabase (PostgreSQL + Auth + Storage).

Scripts principales:

- `npm run dev`: arranca el servidor de desarrollo.
- `npm run build`: compila el proyecto.
- `npm run preview`: sirve la build.
- `npm run lint`: ejecuta ESLint sobre `src`.

## 2. Variables de entorno

Crear un archivo `.env` (no se versiona) en la raíz del proyecto copiando desde `.env.example`:

```bash
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

Estos valores se usan en `src/services/supabaseClient.ts`.

## 3. Configuración de Supabase

### 3.1. Proyecto y Auth

1. Crea un nuevo proyecto en Supabase.
2. En la sección **Authentication → Providers**:
   - Habilita **Email + password**.
   - Deshabilita el **registro público** (solo el admin tendrá cuenta).
3. En **Authentication → Policies / Configuración avanzada**, asegúrate de que no haya invitaciones ni signups abiertos al público.

### 3.2. Creación Manual Del Usuario Admin

La cuenta del joyero/admin se crea **manual** desde el panel de Supabase:

1. Ve a **Authentication → Users**.
2. Crea un nuevo usuario con email y contraseña del joyero.
3. Opcionalmente marca el email como verificado.

No se expone registro público desde el frontend.

## 4. Modelo de datos (SQL)

Ejecuta el siguiente SQL en el editor de SQL de Supabase (basado en `plan-base-de-datos.md` y sección 6 de `plan-Dmur.md`).

### 4.1. Tablas

```sql
create extension if not exists "pgcrypto";

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  material_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table public.stones (
  id uuid primary key default gen_random_uuid(),
  stone_type text not null,
  stone_size text not null,
  stone_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text not null,
  currency text not null default 'COP',
  business_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.2. Trigger para `updated_at`

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp_materials
before update on public.materials
for each row execute procedure public.set_updated_at();

create trigger set_timestamp_product_types
before update on public.product_types
for each row execute procedure public.set_updated_at();

create trigger set_timestamp_products
before update on public.products
for each row execute procedure public.set_updated_at();

create trigger set_timestamp_stones
before update on public.stones
for each row execute procedure public.set_updated_at();

create trigger set_timestamp_product_stones
before update on public.product_stones
for each row execute procedure public.set_updated_at();

create trigger set_timestamp_product_images
before update on public.product_images
for each row execute procedure public.set_updated_at();

create trigger set_timestamp_settings
before update on public.settings
for each row execute procedure public.set_updated_at();
```

## 5. Seguridad: Row Level Security (RLS)

### 5.1. Activar RLS en todas las tablas

```sql
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.materials enable row level security;
alter table public.product_types enable row level security;
alter table public.stones enable row level security;
alter table public.product_stones enable row level security;
alter table public.settings enable row level security;
```

### 5.2. Políticas públicas (lectura anónima)

```sql
create policy "Public read active products"
on public.products
for select
using (active = true);

create policy "Public read product_images"
on public.product_images
for select
using (true);

create policy "Public read materials"
on public.materials
for select
using (true);

create policy "Public read product_types"
on public.product_types
for select
using (true);

create policy "Public read stones"
on public.stones
for select
using (true);

create policy "Public read settings"
on public.settings
for select
using (true);
```

### 5.3. Políticas de escritura (solo admin autenticado)

Asumiendo que **cualquier usuario autenticado** equivale al rol admin (solo se creará la cuenta del joyero):

```sql
create policy "Admin write products"
on public.products
for all
to authenticated
using (true)
with check (true);

create policy "Admin write product_images"
on public.product_images
for all
to authenticated
using (true)
with check (true);

create policy "Admin write materials"
on public.materials
for all
to authenticated
using (true)
with check (true);

create policy "Admin write product_types"
on public.product_types
for all
to authenticated
using (true)
with check (true);

create policy "Admin write stones"
on public.stones
for all
to authenticated
using (true)
with check (true);

create policy "Admin write product_stones"
on public.product_stones
for all
to authenticated
using (true)
with check (true);

create policy "Admin update settings"
on public.settings
for update
to authenticated
using (true)
with check (true);
```

Con esto se cumple la tabla de permisos de la sección 7 de `plan-Dmur.md`:

- Visitante anónimo:
  - `SELECT` en productos (solo `active = true`), imágenes, materiales, tipos, piedras y settings.
- Admin autenticado:
  - `INSERT/UPDATE/DELETE` en tablas de catálogo y configuración.

## 6. Estructura de `src/`

La estructura sigue la propuesta en `plan-Dmur.md` (solo se implementan placeholders en esta fase):

- `components/ui/*` — componentes reutilizables (p.ej. `Button`, `Spinner`).
- `components/landing/*` — secciones de landing (se implementarán en fases siguientes).
- `components/catalog/*` — componentes del catálogo.
- `components/cart/*` — componentes del carrito.
- `components/admin/*` — componentes del panel admin.
- `components/layout/*` — `Navbar`, `Footer`.
- `pages/*` — `Landing`, `Catalogo`, `Carrito`, `Admin`, `NotFound`.
- `services/*` — acceso a Supabase (`supabaseClient`, `joyasService`, `imagenesService`, `settingsService`, `authService`).
- `context/*` — `AuthContext`, `CarritoContext`.
- `hooks/*` — `useAuth`, `useCarrito`.
- `types/*` — tipos de dominio (`joya.types.ts`, `auth.types.ts`).
- `utils/*` — helpers (`whatsapp.ts`, `formatters.ts`).
- `router/AppRouter.tsx` — definición de rutas públicas y protegidas.

## 7. Sistema de colores y tema (light/dark)

- Tailwind está configurado con `darkMode: "class"` en `tailwind.config.js`.
- Paletas personalizadas:
  - `metallic-gold` (50–950): usada principalmente en **modo claro** para fondos y acentos.
  - `ocean-mist` (50–950): usada principalmente en **modo oscuro** como color de acento.
- Esquema recomendado:
  - **Modo claro**:
    - Fondos: `bg-metallic-gold-50`, `bg-metallic-gold-100`.
    - Texto principal: `text-metallic-gold-900` / `text-metallic-gold-800`.
    - Bordes y detalles: `border-metallic-gold-300`, `bg-metallic-gold-300/400` para botones.
  - **Modo oscuro**:
    - Fondos base: `bg-slate-950`, `bg-slate-900`.
    - Acentos: `text-ocean-mist-300`, `text-ocean-mist-200`, `bg-ocean-mist-800`.
    - Botones/links: `bg-ocean-mist-500 hover:bg-ocean-mist-400`, etc.
- Ejemplos de clases Tailwind para futuros componentes:
  - `bg-metallic-gold-500 text-slate-950`
  - `text-metallic-gold-800`
  - `text-ocean-mist-200`
  - `bg-ocean-mist-700 hover:bg-ocean-mist-600`

El modo oscuro se activa añadiendo la clase `dark` al elemento raíz (`<html>`).  
Existe un hook `useTheme` en `src/hooks/useTheme.ts` que:

- Lee y persiste el tema en `localStorage`.
- Aplica o quita la clase `dark` en `document.documentElement`.
- Expone `{ theme, toggleTheme }` para que futuros agentes puedan construir un toggle visual sin tocar el setup base.

## 8. Rutas configuradas

En `src/router/AppRouter.tsx` se definen:

- `/` → `Landing`.
- `/catalogo` → `Catalogo`.
- `/carrito` → `CarritoPage`.
- `/admin` → `ProtectedRoute` + `Admin`.
- `*` → `NotFound`.

`ProtectedRoute` usa `useAuth` (que a su vez lee de `AuthContext`) para permitir o no el acceso al panel admin.

## 9. Próximos pasos (Fases siguientes)

A partir de este setup, otros agentes pueden:

- Implementar la UI de landing, catálogo, carrito y admin.
- Completar la lógica de `CarritoContext` (incluyendo `localStorage`).
- Construir servicios más ricos sobre Supabase (joins, filtros, paginación).
- Integrar Storage de Supabase para subir y gestionar imágenes de productos.

