## Modelo de datos – Dmur Joyería

Documento de referencia para la base de datos en Supabase (PostgreSQL) del proyecto Dmur Joyería.

Incluye:
- Tablas y columnas definitivas.
- Relaciones y claves.
- Convenciones de UUID y timestamps.
- Notas sobre el cálculo de precios.

---

## Convenciones generales

- **Motor**: PostgreSQL (gestionado por Supabase).
- **Claves primarias**:
  - Todas las tablas de negocio usan `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`.
- **Timestamps**:
  - Todas las tablas tienen:
    - `created_at timestamptz NOT NULL DEFAULT now()`
    - `updated_at timestamptz NOT NULL DEFAULT now()`
  - Se recomienda un trigger en PostgreSQL/Supabase para actualizar `updated_at` en cada `UPDATE`.
- **Soft delete**:
  - De momento **no** se implementa `deleted_at` ni soft delete; los borrados son físicos.
- **Nombres**:
  - Nombres en inglés para tablas y columnas internas (`products`, `materials`, etc.).
  - Textos visibles (nombre de producto, descripciones) pueden estar en español.
- **Moneda**:
  - Se asume una moneda principal (por defecto COP, configurable en `settings`).

---

## Resumen de tablas

- `products`: Productos de la joyería (catálogo principal).
- `materials`: Materiales de los productos (oro, plata, acero, etc.).
- `product_types`: Tipos de producto (anillo, collar, pulsera, etc.).
- `product_images`: Imágenes asociadas a cada producto (N por producto).
- `settings`: Configuración general del negocio (número de WhatsApp, moneda, etc.).

No se define aquí la tabla de usuarios, ya que la autenticación de administrador se gestiona con **Supabase Auth**. Si más adelante se necesita un perfil extendido, se puede agregar una tabla `profiles` enlazada a `auth.users`.

---

## Tabla `materials`

Material único por producto; se normaliza en esta tabla.

**Propósito**: evitar repetir textos de material y permitir filtrar productos por material.

**Columnas**:

- `id uuid PK`
- `name text NOT NULL UNIQUE`  
  Ejemplos: `"Oro 18K"`, `"Plata 925"`, `"Acero quirúrgico"`.
- `description text` (opcional, descripción interna).
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**SQL de referencia**:

```sql
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## Tabla `product_types`

Tipo normalizado por producto (anillo, collar, etc.).

**Columnas**:

- `id uuid PK`
- `name text NOT NULL UNIQUE`  
  Ejemplos: `"Anillo"`, `"Collar"`, `"Pulsera"`, `"Aros"`.
- `description text` (opcional).
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**SQL de referencia**:

```sql
create table public.product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## Tabla `products`

Tabla principal del catálogo.

**Decisiones clave**:
- Un solo material por producto: `material_id` → `materials.id`.
- Un solo tipo normalizado por producto: `product_type_id` → `product_types.id`.
- Múltiples imágenes por producto: relación con `product_images`.
- Precio con separación entre:
  - `costo_fijo`
  - `margen_porcentaje`
  - `precio_final` (editable manualmente).

**Columnas**:

- `id uuid PK`
- `name text NOT NULL`  
  Nombre comercial del producto.
- `slug text UNIQUE`  
  Usado para URLs amigables si se desea (`/producto/<slug>`).
- `description text`  
  Descripción larga del producto.
- `material_id uuid NOT NULL`  
  FK a `materials.id`.
- `product_type_id uuid NOT NULL`  
  FK a `product_types.id`.
- `sku text UNIQUE` (opcional, código interno de referencia).
- `costo_fijo numeric(10,2) NOT NULL`  
  Costo base del producto (material, mano de obra, etc.).
- `margen_porcentaje numeric(5,2) NOT NULL`  
  Margen aplicado sobre el costo (por ejemplo `30.00` para 30 %).
- `precio_final numeric(10,2) NOT NULL`  
  Precio final que se muestra al público, **editable** por el admin.
- `active boolean NOT NULL DEFAULT true`  
  Define si el producto se muestra en el catálogo público.
- `featured boolean NOT NULL DEFAULT false`  
  Permite marcar productos destacados.
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Relaciones y claves**:

- `PRIMARY KEY (id)`
- `FOREIGN KEY (material_id) REFERENCES materials(id)`
- `FOREIGN KEY (product_type_id) REFERENCES product_types(id)`
- Índices recomendados:
  - `index_products_material_id`
  - `index_products_product_type_id`
  - `index_products_active`

**SQL de referencia**:

```sql
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  material_id uuid not null references public.materials(id),
  product_type_id uuid not null references public.product_types(id),
  sku text unique,
  costo_fijo numeric(10,2) not null,
  margen_porcentaje numeric(5,2) not null,
  precio_final numeric(10,2) not null,
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

## Tabla `product_images`

Imágenes asociadas a cada producto. La imagen real vive en **Supabase Storage**; aquí se guarda la referencia.

**Columnas**:

- `id uuid PK`
- `product_id uuid NOT NULL`  
  FK a `products.id`.
- `storage_path text NOT NULL`  
  Ruta en el bucket de Supabase Storage (por ejemplo: `products/uuid/imagen-1.jpg`).
- `public_url text`  
  URL pública o firmada, si se decide cachearla.
- `is_primary boolean NOT NULL DEFAULT false`  
  Marca la imagen principal del producto.
- `sort_order integer NOT NULL DEFAULT 0`  
  Permite ordenar las imágenes (0, 1, 2, …).
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

**Relaciones y claves**:

- `PRIMARY KEY (id)`
- `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`
- Índices:
  - `index_product_images_product_id`
  - `index_product_images_is_primary`

**SQL de referencia**:

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

## Tabla `settings`

Configuración general editable desde el panel de administración. Se plantea una estructura **simple** para comenzar, con la posibilidad de extenderla luego.

**Uso recomendado**:
- Usar una sola fila para la configuración global.

**Columnas**:

- `id uuid PK`
- `whatsapp_number text NOT NULL`  
  Número en formato internacional sin `+` ni espacios (ejemplo: `5491112345678`).  
  Se usará para construir el enlace `https://wa.me/<whatsapp_number>?text=<mensaje_codificado>`.
- `currency text NOT NULL DEFAULT 'ARS'`  
  Código de moneda principal.
- `business_name text`  
  Nombre del negocio (opcional, para encabezados y SEO).
- `updated_at timestamptz NOT NULL DEFAULT now()`
- `created_at timestamptz NOT NULL DEFAULT now()`

**Notas**:
- Se puede añadir una restricción de **tabla singleton** más adelante (por ejemplo, un check que fuerce solo una fila) o gestionarlo a nivel de aplicación.

**SQL de referencia**:

```sql
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text not null,
  currency text not null default 'ARS',
  business_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## Relaciones entre tablas

- `products.material_id` → `materials.id` (N productos por material).
- `products.product_type_id` → `product_types.id` (N productos por tipo de producto).
- `product_images.product_id` → `products.id` (N imágenes por producto; `ON DELETE CASCADE`).
- `settings` no tiene FKs por ahora; se relaciona lógicamente con la aplicación para:
  - Número de WhatsApp del enlace de carrito.
  - Moneda y nombre del negocio.

Diagrama conceptual (simplificado):

```text
materials (1) ────< (N) products (1) ────< (N) product_images
                     |
                     └─── (N) product_types

settings: configuración global (1 fila)
```

---

## Notas sobre cálculo de precio

En la tabla `products` se manejan tres campos relacionados al precio:

- `costo_fijo`:
  - Representa el costo base del producto.
  - Incluye materiales, mano de obra y otros costos directos.
- `margen_porcentaje`:
  - Margen que se desea aplicar sobre el costo.
  - Ejemplo: `30.00` representa un 30 % de margen.
- `precio_final`:
  - Precio final que se muestra en el catálogo.
  - Es **editable** manualmente por el administrador.

**Fórmula de referencia recomendada** (no obligatoria):

```text
precio_sugerido = costo_fijo * (1 + margen_porcentaje / 100)
```

**Estrategia recomendada en el panel de administración**:

- Al crear o editar un producto:
  - Calcular y mostrar `precio_sugerido` en base a `costo_fijo` y `margen_porcentaje`.
  - Permitir al administrador:
    - Aceptar ese `precio_sugerido` como `precio_final`, o
    - Ajustar `precio_final` manualmente (por ej. para redondear).
- Guardar siempre los tres campos para poder revisar posteriormente:
  - Cómo se compuso el precio.
  - Qué margen efectivo se está aplicando realmente.

Con este modelo:
- El frontend puede mostrar el **precio final** al usuario.
- El backend y el panel pueden usar `costo_fijo` y `margen_porcentaje` para análisis internos y simulaciones de precio.

