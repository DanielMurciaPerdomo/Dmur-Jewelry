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

El esquema completo se mantiene ahora en la carpeta `supabase/` y está alineado con `Markdown/plan-base-de-datos.md` y la sección 6 de `Markdown/plan-Dmur.md`.

- `supabase/01_schema.sql` → crea tablas, índices y triggers de `updated_at`.
- `supabase/02_rls_policies.sql` → activa RLS y crea las policies.
- `supabase/03_seeds.sql` → inserta datos de ejemplo (materiales, tipos, piedras, settings).

Para aplicar cambios en el proyecto de Supabase **"D'MUR Joyería"**:

1. Abre el **SQL Editor** en Supabase.
2. Ejecuta primero el contenido de `supabase/01_schema.sql`.
3. Ejecuta luego `supabase/02_rls_policies.sql`.
4. Ejecuta finalmente `supabase/03_seeds.sql`.

Las secciones siguientes mantienen una copia de referencia del SQL inicial, pero la fuente de verdad son los archivos de la carpeta `supabase/`.

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

> Nota: la definición actual de RLS/policies vive en `supabase/02_rls_policies.sql` y se basa en estas mismas reglas, usando `auth.role() = 'authenticated'` como criterio de admin (mientras solo exista la cuenta del joyero).

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

Con esto (y con `supabase/02_rls_policies.sql`) se cumple la tabla de permisos de la sección 7 de `plan-Dmur.md`:

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

- Implementar la UI de landing (Hero, About, Materials, FeaturedProducts, CTAFinal) - ✅ Completa.
- Implementar la UI de catálogo (JoyaGrid, JoyaCard, FiltrosCatalogo) - ✅ Completa.
- Implementar la UI del carrito (CarritoDrawer, CarritoItem, BotonContactar, Persistencia en localStorage) - ✅ Completa.
- Implementar la funcionalidad de agregar al carrito desde el catálogo - ✅ Completa.
- Construir servicios más ricos sobre Supabase (joins, filtros, paginación).
- Integrar Storage de Supabase para subir y gestionar imágenes de productos.

## 10. Estado actual del backend y servicios

### 10.1. Scripts de base de datos

- **Esquema y triggers**: `supabase/01_schema.sql`
  - Crea todas las tablas de negocio: `materials`, `product_types`, `products`, `stones`, `product_stones`, `product_images`, `settings`.
  - Configura índices para filtros habituales (`material_id`, `product_type_id`, `active`, joins de tablas de relación).
  - Define la función genérica `public.set_updated_at()` y triggers `before update` en todas las tablas para mantener `updated_at`.

- **RLS y policies**: `supabase/02_rls_policies.sql`
  - Activa y fuerza RLS en todas las tablas públicas de negocio.
  - Policies:
    - `products`: `SELECT` público solo cuando `active = true`; `INSERT/UPDATE/DELETE` solo para usuarios autenticados.
    - `product_images`, `materials`, `product_types`, `stones`, `product_stones`: `SELECT` para cualquier visitante; escrituras solo autenticados.
    - `settings`: `SELECT` público; `UPDATE` solo autenticados.
  - **Supuesto actual de admin**: cualquier usuario con `auth.role() = 'authenticated'` se considera admin (solo se creará la cuenta del joyero). Si en el futuro hay más usuarios autenticados no-admin, se deberá introducir un flag `is_admin` o claims personalizados y ajustar estas policies.

- **Seeds iniciales**: `supabase/03_seeds.sql`
  - Inserta materiales típicos (Oro 18K, Plata 925, Acero quirúrgico).
  - Inserta tipos de producto (Anillo, Collar, Pulsera, Aretes).
  - Inserta algunas piedras de ejemplo (Diamante, Esmeralda, Zirconia).
  - Crea una fila en `settings` con:
    - `whatsapp_number` de prueba (`573001234567`).
    - `currency = 'COP'`.
    - `business_name = 'Dmur Jewelry'`.
  - Todos los inserts son idempotentes (`on conflict do nothing` / `where not exists`).

### 10.2. Servicios de acceso a datos (`src/services`)

- **`supabaseClient.ts`**
  - Crea un client compartido de Supabase usando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

- **`joyasService.ts`**
  - `fetchActiveProducts(): Promise<Joya[]>` — listado plano de productos activos.
  - `fetchActiveProductsWithRelations(): Promise<JoyaWithRelations[]>` — productos activos con joins a `materials`, `product_types`, `product_images` (incluye `primary_image`) y `product_stones` + `stones`. Pensado para el catálogo público.
  - `fetchFeaturedProducts(): Promise<JoyaWithRelations[]>` — igual que lo anterior, filtrando `featured = true` (para la landing).
  - `fetchProductById(id)` / `fetchProductBySlug(slug)` — detalle de producto con todas sus relaciones (`JoyaWithRelations`).

- **`imagenesService.ts`**
  - `getProductImages(productId): Promise<ProductImage[]>` — lee imágenes de `product_images` ordenadas por `sort_order`.
  - `uploadProductImage(productId, file): Promise<ProductImage>` — sube la imagen al bucket `products` en Supabase Storage, genera `public_url` y crea el registro en `product_images`.
  - `setPrimaryImage(productId, imageId): Promise<ProductImage>` — limpia `is_primary` del resto y marca como principal la imagen indicada.
  - `deleteProductImage(image): Promise<void>` — borra tanto el archivo del bucket como el registro en `product_images`.

- **`settingsService.ts`**
  - `getSettings(): Promise<Settings | null>` — obtiene la única fila lógica de configuración (número de WhatsApp, moneda, nombre de negocio).
  - `updateSettings(id, payload): Promise<Settings>` — actualiza `whatsapp_number`, `currency` y/o `business_name` (requiere usuario autenticado por RLS).

- **`authService.ts`**
  - `getCurrentSession(): Promise<Session | null>` — helper para saber si hay sesión activa del admin.
  - `signInWithEmail({ email, password }): Promise<Session | null>` — login del admin usando Supabase Auth (email/contraseña).
  - `signOut(): Promise<void>` — cierra la sesión actual.

### 10.3. Tipos de dominio (`src/types/joya.types.ts`)

- Tipos base ya definidos:
  - `Material`, `ProductType`, `Joya` (producto plano).
- Nuevos tipos alineados al modelo:
  - `Stone` — fila de la tabla `stones`.
  - `ProductStone` — relación `product_stones`.
  - `ProductImage` — fila de `product_images`.
  - `JoyaWithRelations` — agrega a `Joya`:
    - `material: Material`.
    - `product_type: ProductType`.
    - `primary_image: ProductImage | null`.
    - `images: ProductImage[]`.
    - `stones: (Stone & { quantity: number })[]`.

Estos tipos y servicios están pensados para ser usados directamente por los futuros hooks (`useJoyas`, `useFeaturedJoyas`, `useAuth`) y componentes de catálogo/landing/carrito/admin definidos en `Markdown/plan-Dmur.md`.

## 11. Desarrollo de la Landing Page (Fase 2)

La Landing Page ha sido completamente implementada, incluyendo las siguientes secciones y componentes:

- **Hero (`src/components/landing/Hero.tsx`):** Componente principal que introduce la joyería.
- **About (`src/components/landing/About.tsx`):** Sección informativa sobre la joyería.
- **Materials (`src/components/landing/Materials.tsx`):** Muestra los materiales utilizados en las joyas.
- **FeaturedProducts (`src/components/landing/FeaturedProducts.tsx`):**
  - Muestra una selección de productos destacados.
  - Utiliza el hook `useFeaturedJoyas` (`src/hooks/useFeaturedJoyas.ts`) para obtener los datos de productos desde `joyasService.ts`.
  - Implementa la visualización de la tarjeta de producto (`ProductCard`) con imagen principal, nombre, tipo, material y precio.
  - Maneja los estados de carga, error y la ausencia de productos destacados.
- **CTAFinal (`src/components/landing/CTAFinal.tsx`):** Llamada a la acción final para dirigir a los usuarios al catálogo.

Todos los componentes de la landing page han sido desarrollados siguiendo la guía de estilos de Tailwind CSS con la paleta `metallic-gold` y `ocean-mist`, y se integran con los servicios de Supabase para la obtención de datos, como es el caso de los productos destacados.

## 12. Desarrollo del Catálogo (Fase 3)

El catálogo de productos ha sido implementado, incluyendo los siguientes componentes y hooks:

- **`src/hooks/useJoyas.ts`:** Hook personalizado para la obtención de todas las joyas activas con sus relaciones (materiales, tipos de producto, imágenes y piedras) desde `joyasService.ts`. Gestiona los estados de carga, éxito y error.
- **`src/components/catalog/JoyaCard.tsx`:** Componente que muestra una tarjeta individual para cada joya, incluyendo su imagen principal, nombre, tipo, material y precio. Está preparado para futuras integraciones, como un botón para añadir al carrito.
- **`src/components/catalog/JoyaGrid.tsx`:** Componente encargado de la maquetación en cuadrícula de las `JoyaCard`. Utiliza `useJoyas` para la obtención de datos y maneja los estados de carga y error, así como el caso de no encontrar joyas.
- **`src/components/catalog/FiltrosCatalogo.tsx`:** Componente placeholder para la funcionalidad de filtrado del catálogo, listo para ser expandido en futuras fases.
- **`src/pages/Catalogo.tsx`:** La página principal del catálogo, que integra `FiltrosCatalogo` en una barra lateral y `JoyaGrid` para la visualización principal de los productos.

## 13. Desarrollo del Carrito (Fase 4)

El apartado del carrito para el cliente ha sido implementado, manteniendo el estilo consistente con el landing y catálogo. Los componentes incluyen:

- **`src/context/CarritoContext.tsx`:** Contexto de React para gestionar el estado del carrito, que permite:
  - `addItem`: Agregar productos al carrito.
  - `removeItem`: Eliminar un producto del carrito (por ID).
  - `updateItem`: Actualizar la cantidad de un producto existente.
  - `clear`: Vaciar todo el carrito.
  - Los items del carrito ahora usan `JoyaWithRelations` para mostrar correctamente las relaciones en la UI.
  - Persistencia en `localStorage` para mantener el carrito entre sesiones.

- **`src/components/cart/CarritoItem.tsx`:** Componente visual para mostrar cada item en el carrito, incluyendo:
  - Imagen del producto.
  - Nombre, tipo y material.
  - Controles de cantidad (aumentar/reducir).
  - Precio unitario y total por ítem.
  - Botón para eliminar el item.

- **`src/components/cart/BotonContactar.tsx`:** Componente que genera el enlace de WhatsApp para contactar al joyero:
  - Obtiene el número de WhatsApp desde `settingsService`.
  - Genera un mensaje formateado con la lista de productos del carrito y sus cantidades.
  - Calcula el total del carrito.
  - Incluye un enlace a WhatsApp con el mensaje codificado.

- **`src/components/cart/CarritoDrawer.tsx`:** Componente principal que integra todos los elementos del carrito:
  - Muestra la lista de items usando `CarritoItemComponent`.
  - Incluye el botón de contacto.
  - Permite vaciar el carrito.
  - Muestra un mensaje cuando el carrito está vacío.

- **`src/pages/Carrito.tsx`:** La página principal del carrito que utiliza `CarritoDrawer` para la visualización.

- **`src/components/catalog/JoyaCard.tsx`:** Actualizado para incluir el botón "Agregar al carrito" que utiliza el hook `useCarrito` para agregar productos a la lista.

El flujo completo permite al usuario agregar productos desde el catálogo (haciendo clic en "Agregar al carrito"), revisar su selección en el carrito y contactar directamente al joyero por WhatsApp para proceder con la compra, tal como se especifica en los requerimientos del proyecto.
