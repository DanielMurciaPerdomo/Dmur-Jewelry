# Dmur Jewelry — Plan Técnico de Desarrollo
> Catálogo web con panel de administración y carrito de interés vía WhatsApp.  
> Versión 1.0 · 2026

---

## 1. Objetivo del Producto

Desarrollar una página web para una joyería pequeña que permita a los clientes explorar el catálogo de productos y contactar directamente al joyero por WhatsApp con las joyas de su interés. El sitio **NO procesa pagos en línea**.

| Vista | Descripción |
|---|---|
| **Landing page** | Presentación de la joyería, slogan, contenido visual llamativo y accesos rápidos |
| **Catálogo público** | Listado de joyas con filtros por material, tipo y búsqueda |
| **Carrito de interés** | El visitante selecciona joyas y contacta al joyero vía WhatsApp |
| **Panel de administración** | El joyero gestiona productos, imágenes y configuración del negocio |

---

## 2. Stack Tecnológico

| Área | Tecnología | Razón |
|---|---|---|
| Frontend | React + TypeScript + Vite | Rápido, moderno, tipado seguro |
| Estilos | Tailwind CSS | Diseño elegante sin CSS personalizado |
| Base de datos | Supabase (PostgreSQL) | DB + Auth + Storage en uno |
| Autenticación | Supabase Auth | Login del joyero sin servidor propio |
| Almacenamiento | Supabase Storage | Imágenes de joyas en la nube |
| Contacto | WhatsApp `wa.me` | Simple, gratuito, natural para el negocio |
| Hosting | Vercel | Deploy automático, plan gratuito suficiente |

> **Decisiones clave:**
> - ❌ No se usa **Next.js** — para 4 vistas simples, React + Vite es la herramienta correcta. SSR es innecesario.
> - ❌ No se usa **Node.js separado** — Supabase actúa como backend completo.
> - ❌ No se usa **WhatsApp Business API** — un enlace `wa.me` es suficiente y gratuito.
> - ❌ No se usa **Zustand/Redux** — React Context cubre el carrito sin complejidad extra.

---

## 3. Flujo Principal

```
Landing Page
    │
    ├──> Catálogo ──> Vista de detalle de joya
    │         │
    │         └──> Agregar al carrito
    │                    │
    │                    └──> Botón "Contactar por WhatsApp"
    │                                │
    │                                └──> wa.me con mensaje pre-armado
    │
    └──> Contacto directo WhatsApp (desde landing, sin seleccionar joyas)

Panel Admin (ruta protegida /admin)
    │
    ├──> Login (Supabase Auth)
    ├──> CRUD de productos
    ├──> Gestión de imágenes (Supabase Storage)
    └──> Configuración (número WhatsApp, nombre del negocio)
```

---

## 4. Landing Page

Esta es la primera impresión del negocio. Debe transmitir **elegancia, confianza y exclusividad**.

### 4.1 Secciones de la Landing Page

#### Hero (sección principal)
- Imagen o video de fondo de alta calidad mostrando joyas
- Nombre del negocio: **Dmur Jewelry**
- Slogan destacado
- Dos botones de acción claros:
  - `Ver Catálogo` → navega a `/catalogo`
  - `Contactar al Joyero` → abre WhatsApp directamente

#### Sobre Nosotros
- Breve historia o filosofía de la joyería
- Qué hace especial a Dmur Jewelry (materiales, artesanía, personalización)

#### Materiales y Garantía
- Íconos o tarjetas mostrando: Oro 18K, Plata 925, Acero Quirúrgico
- Breve texto de confianza: calidad garantizada, piezas únicas

#### Productos Destacados
- Grilla de 3–6 joyas con `featured = true` en la base de datos
- Botón `Ver catálogo completo`

#### Llamada a la Acción Final (CTA)
- Sección de cierre con fondo oscuro o dorado
- Texto: "¿Buscas algo especial? Diseñamos tu joya a medida"
- Botón directo a WhatsApp

### 4.2 Componentes necesarios para la Landing

```
src/
├── pages/
│   └── Landing.tsx              ← página principal
│
└── components/
    └── landing/
        ├── Hero.tsx             ← sección hero con slogan y botones
        ├── About.tsx            ← sección sobre nosotros
        ├── Materials.tsx        ← materiales y garantía
        ├── FeaturedProducts.tsx ← joyas destacadas (featured = true)
        └── CTAFinal.tsx         ← llamada a la acción de cierre
```

### 4.3 Ruta en el Router

```tsx
// src/router/AppRouter.tsx
<Route path="/"        element={<Landing />} />
<Route path="/catalogo" element={<Catalogo />} />
<Route path="/carrito"  element={<Carrito />} />
<Route path="/admin"    element={<ProtectedRoute><Admin /></ProtectedRoute>} />
```

---

## 5. Estructura de Carpetas

```
dmur-jewelry/
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── assets/                        # Imágenes estáticas locales (logo, etc.)
│   │
│   ├── components/
│   │   ├── ui/                        # Componentes genéricos reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── landing/                   # Secciones de la landing page
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Materials.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   └── CTAFinal.tsx
│   │   │
│   │   ├── catalog/                   # Catálogo de joyas
│   │   │   ├── JoyaCard.tsx
│   │   │   ├── JoyaGrid.tsx
│   │   │   └── FiltrosCatalogo.tsx
│   │   │
│   │   ├── cart/                      # Carrito de interés
│   │   │   ├── CarritoDrawer.tsx
│   │   │   ├── CarritoItem.tsx
│   │   │   └── BotonContactar.tsx
│   │   │
│   │   ├── admin/                     # Panel de administración
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── JoyaForm.tsx
│   │   │   ├── JoyaTabla.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   └── Configuracion.tsx
│   │   │
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   │
│   ├── pages/
│   │   ├── Landing.tsx                # Página de presentación
│   │   ├── Catalogo.tsx               # Catálogo completo
│   │   ├── Carrito.tsx                # Carrito de interés
│   │   ├── Admin.tsx                  # Panel de administración
│   │   └── NotFound.tsx
│   │
│   ├── hooks/
│   │   ├── useCarrito.ts
│   │   ├── useJoyas.ts
│   │   ├── useFeaturedJoyas.ts        # Solo joyas con featured = true
│   │   └── useAuth.ts
│   │
│   ├── context/
│   │   ├── CarritoContext.tsx
│   │   └── AuthContext.tsx
│   │
│   ├── services/                      # Toda comunicación con Supabase
│   │   ├── supabaseClient.ts
│   │   ├── joyasService.ts
│   │   ├── imagenesService.ts
│   │   ├── settingsService.ts
│   │   └── authService.ts
│   │
│   ├── types/
│   │   ├── joya.types.ts
│   │   └── auth.types.ts
│   │
│   ├── utils/
│   │   ├── whatsapp.ts                # Armar mensaje y construir URL wa.me
│   │   └── formatters.ts             # Formatear precios en COP
│   │
│   ├── router/
│   │   └── AppRouter.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                      # Directivas de Tailwind
│
├── .env                               # ⛔ NUNCA subir a GitHub
├── .env.example                       # ✅ Subir sin valores reales
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── LICENSE                            # All Rights Reserved
├── README.md
└── package.json
```

---

## 6. Modelo de Datos (Supabase / PostgreSQL)

### 6.1 Convenciones generales

- **Motor**: PostgreSQL gestionado por Supabase
- **Primary keys**: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- **Timestamps**: todas las tablas tienen `created_at` y `updated_at` con `DEFAULT now()`
- **Trigger recomendado**: actualizar `updated_at` automáticamente en cada `UPDATE`
- **Soft delete**: no aplica por ahora — los borrados son físicos
- **Moneda**: Peso colombiano (COP) por defecto, configurable en `settings`
- **Autenticación**: manejada por Supabase Auth — no se define tabla `users` aquí

### 6.2 Tabla `materials`

Materiales disponibles (Oro 18K, Plata 925, Acero Quirúrgico, etc.). Un producto tiene un solo material.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Auto-generado |
| `name` | text NOT NULL UNIQUE | Nombre del material |
| `material_value` | numeric(10,2) NOT NULL | Valor base del material |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

```sql
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  material_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6.3 Tabla `product_types`

Tipos de producto normalizados (Anillo, Collar, Pulsera, Aretes, etc.).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Auto-generado |
| `name` | text NOT NULL UNIQUE | Nombre del tipo |
| `type_value` | numeric(10,2) NOT NULL | Valor base por tipo |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

```sql
create table public.product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type_value numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6.4 Tabla `products`

Tabla principal del catálogo de joyas.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Auto-generado |
| `name` | text NOT NULL | Nombre comercial de la joya |
| `slug` | text UNIQUE | Para URLs amigables (`/producto/anillo-oro-18k`) |
| `description` | text | Descripción larga del producto |
| `material_id` | uuid FK | → `materials.id` |
| `product_type_id` | uuid FK | → `product_types.id` |
| `sku` | text UNIQUE | Código interno opcional |
| `fixed_cost` | numeric(10,2) NOT NULL | Costo base (materiales + mano de obra) |
| `margin_percentage` | numeric(5,2) NOT NULL | Margen sobre el costo (ej: `30.00` = 30%) |
| `final_price` | numeric(10,2) NOT NULL | Precio final mostrado al cliente, editable por el admin |
| `active` | boolean DEFAULT true | Visible en el catálogo público |
| `featured` | boolean DEFAULT false | Destacado en la landing page |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

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

### 6.5 Tabla `stones`

Piedras disponibles que pueden asociarse a uno o varios productos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Auto-generado |
| `stone_type` | text NOT NULL | Tipo de piedra (Diamante, Esmeralda, Zirconia) |
| `stone_size` | text NOT NULL | Tamaño en mm, quilates o texto descriptivo |
| `stone_value` | numeric(10,2) NOT NULL | Valor base de la piedra |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

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

### 6.6 Tabla `product_stones`

Tabla de unión many-to-many entre `products` y `stones`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Auto-generado |
| `product_id` | uuid FK | → `products.id` (ON DELETE CASCADE) |
| `stone_id` | uuid FK | → `stones.id` (ON DELETE RESTRICT) |
| `quantity` | integer DEFAULT 1 | Cantidad de esta piedra en el producto |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

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

### 6.7 Tabla `product_images`

Imágenes de cada producto. El archivo físico vive en **Supabase Storage**; esta tabla guarda la referencia.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Auto-generado |
| `product_id` | uuid FK | → `products.id` (ON DELETE CASCADE) |
| `storage_path` | text NOT NULL | Ruta en el bucket (ej: `products/uuid/imagen-1.jpg`) |
| `public_url` | text | URL pública o firmada cacheada |
| `is_primary` | boolean DEFAULT false | Imagen principal del producto |
| `sort_order` | integer DEFAULT 0 | Orden de visualización (0, 1, 2…) |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

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

### 6.8 Tabla `settings`

Configuración global del negocio, editable desde el panel admin. Una sola fila.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Auto-generado |
| `whatsapp_number` | text NOT NULL | Número internacional sin `+` ni espacios (ej: `573001234567`) |
| `currency` | text DEFAULT 'COP' | Código de moneda |
| `business_name` | text | Nombre del negocio para headers y SEO |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

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

### 6.9 Diagrama de relaciones

```
materials (1) ────────< (N) products (1) ────────< (N) product_images
                                 │
product_types (1) ───────────────┘
                                 │
                     (N) product_stones (N) ────> (1) stones

settings: configuración global (1 fila)
```

### 6.10 Notas sobre el precio

El precio en `products` está compuesto por tres campos:

| Campo | Rol |
|---|---|
| `fixed_cost` | Costo base: materiales + mano de obra |
| `margin_percentage` | Margen aplicado sobre el costo (ej: `30.00` = 30%) |
| `final_price` | Precio final mostrado al cliente — **editable manualmente** |

**Fórmula de referencia (no obligatoria):**
```
precio_sugerido = fixed_cost * (1 + margin_percentage / 100)
```

**Comportamiento recomendado en el panel admin:**
- Calcular y mostrar el `precio_sugerido` en tiempo real
- Permitir que el admin acepte el sugerido o ingrese un `final_price` distinto
- Siempre guardar los tres campos para tener trazabilidad del margen real

---

## 7. Seguridad: Row Level Security (RLS)

> **CRÍTICO:** Debe configurarse en la **Fase 1**, no como tarea pendiente. Sin RLS, cualquier persona puede hacer peticiones directas a la base de datos aunque no sea admin.

| Tabla | Operación | Quién puede |
|---|---|---|
| `products` | SELECT | Cualquier visitante (solo `active = true`) |
| `products` | INSERT / UPDATE / DELETE | Solo admin autenticado |
| `product_images` | SELECT | Cualquier visitante |
| `product_images` | INSERT / UPDATE / DELETE | Solo admin autenticado |
| `materials` | SELECT | Cualquier visitante |
| `materials` | INSERT / UPDATE / DELETE | Solo admin autenticado |
| `product_types` | SELECT | Cualquier visitante |
| `product_types` | INSERT / UPDATE / DELETE | Solo admin autenticado |
| `stones` | SELECT | Cualquier visitante |
| `stones` | INSERT / UPDATE / DELETE | Solo admin autenticado |
| `settings` | SELECT | Cualquier visitante (para leer número de WhatsApp) |
| `settings` | UPDATE | Solo admin autenticado |

---

## 8. Flujo de Contacto WhatsApp

El carrito **NO procesa pagos**. Únicamente construye un mensaje de texto y redirige al joyero.

**Ejemplo del mensaje generado:**
```
Hola! Me interesan los siguientes productos de Dmur Jewelry:

1. Anillo Solitario Oro 18K - $850.000 COP
2. Pulsera Tejida Plata 925 - $320.000 COP
3. Collar Lágrima Esmeralda

Me gustaría recibir más información. ¡Gracias!
```

**URL generada:**
```
https://wa.me/573001234567?text=Hola!%20Me%20interesan...
```

El número `573001234567` se lee desde la tabla `settings`, editable por el joyero desde el panel admin.

---

## 9. Fases de Implementación

### Fase 1 — Setup inicial
1. Crear proyecto: `npm create vite@latest dmur-jewelry -- --template react-ts`
2. Instalar y configurar Tailwind CSS
3. Crear proyecto en Supabase y configurar variables de entorno en `.env`
4. Crear todas las tablas en Supabase con el SQL de la sección 6
5. **Configurar RLS desde este momento — no omitir**
6. Configurar Supabase Auth (email + contraseña, registro público deshabilitado)
7. Crear `src/services/supabaseClient.ts`
8. Configurar React Router con todas las rutas

### Fase 2 — Landing Page
1. Construir componente `Hero` con slogan, imagen de fondo y dos botones CTA
2. Construir sección `About` con filosofía del negocio
3. Construir sección `Materials` con íconos de materiales disponibles
4. Construir `FeaturedProducts` que carga desde Supabase joyas con `featured = true`
5. Construir `CTAFinal` con llamada a la acción directa a WhatsApp
6. Ensamblar todo en `pages/Landing.tsx`

### Fase 3 — Catálogo público
1. Crear `joyasService.ts` con query a Supabase (solo `active = true`, con join a imágenes, materiales y tipos)
2. Construir `JoyaCard` con imagen principal, nombre, tipo, material y precio final
3. Construir `JoyaGrid` con layout responsivo
4. Agregar `FiltrosCatalogo` por tipo de producto y material
5. Manejar estados de carga y error correctamente

### Fase 4 — Carrito y contacto WhatsApp
1. Crear `CarritoContext` con operaciones: agregar, quitar, limpiar
2. Persistir carrito en `localStorage` para que no se pierda al recargar
3. Construir `CarritoDrawer` con resumen visual de joyas seleccionadas
4. Implementar `utils/whatsapp.ts`: armar mensaje con lista de joyas y construir URL `wa.me`
5. Leer `whatsapp_number` desde `settings` en Supabase
6. Botón "Contactar por WhatsApp" que abre el enlace en nueva pestaña

### Fase 5 — Panel de administración
1. Página de login con Supabase Auth
2. Proteger ruta `/admin` — redirigir a login si no hay sesión activa
3. CRUD completo de productos con todos los campos del modelo
4. Subida de imágenes a Supabase Storage (validar: máx 5MB, formatos: jpg, png, webp)
5. Gestión de imágenes: marcar imagen principal, reordenar, eliminar
6. Gestión de materiales, tipos de producto y piedras
7. Sección de configuración: editar número de WhatsApp y nombre del negocio
8. Selector de joyas destacadas (`featured = true`) para la landing page

### Fase 6 — Cierre y despliegue
1. Revisión de SEO básico: meta tags, título, descripción
2. Favicon y ajustes visuales finales de marca
3. Verificar que `.env` **no está** en el repositorio de GitHub
4. Configurar variables de entorno en Vercel
5. Deploy en Vercel conectando el repositorio de GitHub
6. Configurar dominio propio si aplica
7. Prueba completa del flujo: landing → catálogo → carrito → WhatsApp

---

## 10. Variables de Entorno

**Archivo `.env`** (nunca subir a GitHub):
```bash
VITE_SUPABASE_URL=https://xyzxyzxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Archivo `.env.example`** (sí subir al repositorio):
```bash
# Copia este archivo como .env y rellena los valores reales
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

---

## 11. Resumen de Decisiones Técnicas

| Decisión | Elegido | Descartado | Razón |
|---|---|---|---|
| Framework | React + Vite | Next.js | 4 vistas simples, SSR innecesario |
| Backend | Supabase directo | Node.js + Express | Supabase cubre todo el caso de uso |
| Estado carrito | React Context | Zustand / Redux | Complejidad innecesaria |
| Contacto | `wa.me` link | WhatsApp Business API | Gratuito, sin burocracia |
| Tipado | TypeScript | JavaScript | Evita errores, mejor mantenimiento |
| API propia | No | Route Handlers | Supabase ya es la API |
| Landing page | Componentes propios | Template externo | Control total del diseño |
| Precio | 3 campos (`fixed_cost`, `margin`, `final_price`) | Solo `price` | Trazabilidad del margen real |

---

*Dmur Jewelry — Plan Técnico v1.0 · Todos los derechos reservados*