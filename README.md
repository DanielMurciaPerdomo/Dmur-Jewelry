# Dmur Jewelry — Documentación del Proyecto

## 1. Estado Actual del Proyecto

El proyecto **Dmur Jewelry** se encuentra en una fase avanzada de desarrollo, correspondiente a la **Fase 5 — Admin** descrita en `AGENTS.md`. Todas las funcionalidades principales (Landing, Catálogo, Carrito y Panel de Administración) han sido implementadas y el código está estructurado siguiendo las mejores prácticas de TypeScript y Supabase.

### Resumen de Fases

| Fase         | Estado       | Descripción                                         |
| ------------ | ------------ | --------------------------------------------------- |
| 1 — Setup    | ✅ Completo  | Vite + React + TS + Tailwind + Supabase configurado |
| 2 — Landing  | ✅ Completo  | Hero, About, Materials, FeaturedProducts, CTAFinal  |
| 3 — Catálogo | ✅ Completo  | JoyaGrid, JoyaCard, FiltrosCatalogo                 |
| 4 — Carrito  | ✅ Completo  | CarritoContext, CarritoDrawer, BotonContactar       |
| 5 — Admin    | ✅ Completo  | Login, CRUD productos, gestión imágenes             |
| 6 — Deploy   | ⏳ Pendiente | Vercel + dominio                                    |

### Características Implementadas

**Página de Detalle de Producto (`DetalleJoya`)**

- **Vista Detallada**: Al hacer clic en cualquier producto (no en "Agregar al carrito"), se muestra una página dedicada con información completa del producto.
- **Carrusel de Imágenes**: Galería horizontal para navegar entre todas las imágenes del producto.
- **Acciones Rápidas**: Botones para agregar al carrito, contactar por WhatsApp (solo este producto) o volver al catálogo.
- **Estados Completos**: Manejo de loading, error y éxito con UI consistente.

**Panel de Administración Completo**

- **Dashboard (`DashboardAdmin`)**: Muestra métricas clave como resumen de joyas (totales, activas, inactivas, destacadas), distribución por tipo y material, estadísticas de precios (promedio, máximo, mínimo, margen promedio), estadísticas de contenido (total de materiales, tipos y piedras) y alertas para productos sin imágenes o inactivos.
- **Gestión de Piedras (`PiedrasTabla`, `PiedrasForm`)**: CRUD completo para administrar el catálogo de piedras disponibles.
- **Gestión de Materiales (`MaterialesGrid`)**: Interfaz para crear, editar y eliminar materiales.
- **Configuración (`Configuracion`)**: Página para gestionar número de WhatsApp, nombre del negocio y moneda.

**Optimización de Rendimiento**

- **Hooks con Caché Global**: `useMaterials`, `useProductTypes` y `useStones` implementan un patrón de singleton con caché global, cargando datos estáticos solo una vez por sesión.
- **`useSettings`**: Hook dedicado para acceder a la configuración global.

**Formulario de Productos (`JoyaForm`)**

- **Cálculo Dinámico de Precios**: El `fixed_cost` se calcula automáticamente en base al peso del material, piedras asociadas y tipo de producto. El `final_price` se deriva del costo fijo y el margen.
- **Gestión Integrada de Piedras**: Permite asociar piedras existentes, crear nuevas piedras al vuelo y ajustar cantidades.
- **Campo `phy_url`**: Nueva columna para registrar la ruta física de las imágenes.

---

## 2. Stack Tecnológico

| Área     | Tecnología                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | React 18 + TypeScript + Vite                                  |
| Estilos  | Tailwind CSS (paleta `gold` definida en `tailwind.config.js`) |
| Backend  | Supabase (PostgreSQL + Auth + Storage)                        |
| Contacto | WhatsApp `wa.me` — sin WhatsApp Business API                  |
| Hosting  | Vercel                                                        |

---

## 3. Estructura de Carpetas

```
src/
├── components/
│   ├── ui/          # Button, Modal, Spinner
│   ├── landing/     # Hero, About, Materials, FeaturedProducts, CTAFinal
│   ├── catalog/     # JoyaCard, JoyaGrid, FiltrosCatalogo
│   ├── cart/        # CarritoDrawer, CarritoItem, BotonContactar
│   ├── admin/        # AdminLogin, AdminLayout, JoyaForm, JoyaTabla,
│   │                 # ImageUploader, DashboardAdmin, PiedrasTabla,
│   │                 # PiedrasForm, MaterialesGrid
│   └── layout/       # Navbar, Footer
├── pages/            # Landing, Catalogo, Carrito, DetalleJoya, Configuracion, NotFound
├── hooks/            # useAuth, useCarrito, useJoyas, useFeaturedJoyas,
│                      # useMaterials, useProductTypes, useStones,
│                      # useSettings, useTheme
├── context/          # AuthContext, CarritoContext, SettingsContext
├── services/         # supabaseClient, joyasService, imagenesService,
│                      # settingsService, authService, dashboardService,
│                      # materialsService, piedrasService, productStonesService
├── types/            # joya.types.ts, auth.types.ts
├── utils/            # whatsapp.ts, formatters.ts
└── router/           # AppRouter.tsx, ProtectedRoute.tsx

public/
├── Dmur.png              # Logo principal
├── android-chrome-*.png # Iconos PWA para Android
├── apple-touch-icon.png  # Icono para iOS
├── favicon-*.png         # Favicons múltiples tamaños
├── favicon.ico           # Favicon legacy
└── site.webmanifest     # Manifesto PWA
```

---

## 4. Base de Datos (Supabase)

### 4.1. Esquema

El esquema se mantiene en la carpeta `supabase/` y está alineado con `Markdown/plan-base-de-datos.md`:

- `supabase/01_schema.sql`: Crea tablas, índices y triggers de `updated_at`.
- `supabase/02_rls_policies.sql`: Activa RLS y crea las políticas de acceso.
- `supabase/03_seeds_examples.sql`: Inserta datos iniciales (materiales, tipos, piedras, settings).
- `supabase/04_add_phy_url.sql`: Agrega la columna `phy_url` a la tabla `products` para almacenar la ruta física de las imágenes.

### 4.2. Tablas Principales

- **materials**: Materiales disponibles (Oro 18K, Plata 925, etc.).
- **product_types**: Tipos de producto (Anillo, Collar, Pulsera, Aretes).
- **products**: Catálogo principal de joyas (incluye `phy_url`).
- **stones**: Piedras disponibles.
- **product_stones**: Relación many-to-many productos ↔ piedras.
- **product_images**: Imágenes de cada producto (en Supabase Storage).
- **settings**: Configuración global (whatsapp_number, currency, business_name).

### 4.3. Seguridad (RLS)

- **SELECT**: Cualquier visitante anónimo puede leer (excepto `products` donde solo se devuelven registros con `active = true`).
- **INSERT / UPDATE / DELETE**: Solo usuarios autenticados (`auth.role() = 'authenticated'`).

---

## 5. Rutas de la Aplicación

| Ruta                          | Componente       | Descripción                       |
| ----------------------------- | ---------------- | --------------------------------- |
| `/`                           | `Landing`        | Página de inicio pública          |
| `/catalogo`                   | `Catalogo`       | Catálogo de joyas público         |
| `/joya/:slug`                 | `DetalleJoya`    | Detalle de producto con galería   |
| `/carrito`                    | `CarritoPage`    | Carrito de interés                |
| `/admin/login`                | `AdminLogin`     | Login del panel de administración |
| `/admin`                      | `AdminLayout`    | Layout principal del admin        |
| `/admin`                      | `DashboardAdmin` | Dashboard con métricas            |
| `/admin/productos`            | `JoyaTabla`      | Tabla de productos (CRUD)         |
| `/admin/productos/nuevo`      | `JoyaForm`       | Formulario para nuevo producto    |
| `/admin/productos/:id/editar` | `JoyaForm`       | Formulario para editar producto   |
| `/admin/piedras`              | `PiedrasTabla`   | Tabla de piedras (CRUD)           |
| `/admin/piedras/nueva`        | `PiedrasForm`    | Formulario para nueva piedra      |
| `/admin/piedras/:id/editar`   | `PiedrasForm`    | Formulario para editar piedra     |
| `/admin/materiales`           | `MaterialesGrid` | Grid de materiales (CRUD)         |
| `/admin/configuracion`        | `Configuracion`  | Configuración del negocio         |
| `*`                           | `NotFound`       | Página de error 404               |

---

## 6. Flujo de WhatsApp

El proyecto genera enlaces de WhatsApp para que los clientes contacten al joyero directamente.

```typescript
// utils/whatsapp.ts
// Mensaje de producto único (desde DetalleJoya)
const mensaje = buildSingleProductMessage(product);
const url = buildWhatsappUrl(whatsapp_number, mensaje);

// Mensaje de carrito (desde CarritoPage o CarritoDrawer)
const mensaje = buildWhatsappMessage(carritoItems);
const url = `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(mensaje)}`;
```

- **Desde detalle de producto**: El mensaje contiene solo la joya específica consultada.
- **Desde carrito**: El mensaje contiene todos los productos del carrito.

El número de WhatsApp se obtiene desde la tabla `settings` en Supabase.

---

## 7. Desarrollo y Scripts

### Scripts Principales

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila el proyecto para producción.
- `npm run preview`: Sirve la build compilada.
- `npm run lint`: Ejecuta ESLint sobre `src`.

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

---

## 8. Próximos Pasos (Deploy)

La fase actual es **Fase 6 — Deploy**. Los pasos pendientes son:

1.  **Configurar Vercel**:
    - Conectar el repositorio de GitHub/GitLab.
    - Añadir variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
2.  **Dominio personalizado (opcional)**:
    - Configurar DNS en el proveedor del dominio.
    - Añadir dominio en Vercel.
3.  **Verificar producción**:
    - Asegurar que el cliente pueda acceder a la URL de Vercel.
    - Verificar que Supabase acepte conexiones desde el dominio de Vercel (CORS).

---

## 9. Archivos de Referencia

| Archivo                          | Contenido                          |
| -------------------------------- | ---------------------------------- |
| `AGENTS.md`                      | Guía para agentes de IA y reglas   |
| `Markdown/plan-Dmur.md`          | Plan técnico completo del proyecto |
| `Markdown/plan-base-de-datos.md` | Modelo de datos detallado con SQL  |
| `supabase/01_schema.sql`         | DDL ejecutado en Supabase          |
| `supabase/02_rls_policies.sql`   | Políticas RLS ejecutadas           |
| `supabase/03_seeds_examples.sql` | Datos iniciales de prueba          |
| `supabase/04_add_phy_url.sql`    | Migración para columna phy_url     |
