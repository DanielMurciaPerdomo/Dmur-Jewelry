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

### Optimizaciones Recientes

Se ha implementado una optimización de rendimiento en `JoyaForm.tsx` para evitar recargas innecesarias de datos:

- **Hooks con Caching Global**: Se crearon `useProductTypes` y `useStones`, y se actualizó `useMaterials` para implementar un patrón de singleton con caché global.
- **Mejora de Rendimiento**: Los datos de materiales, tipos de producto y piedras ahora se cargan una sola vez por sesión de la aplicación, evitando llamadas a la API redundantes al navegar entre formularios.
- **Componente `JoyaForm` Actualizado**: Ahora utiliza estos hooks en lugar de realizar llamadas directas a los servicios, mejorando la experiencia de usuario en el panel de administración.

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
│   ├── ui/          # Componentes genéricos (Button, Modal, Spinner)
│   ├── landing/     # Hero, About, Materials, FeaturedProducts, CTAFinal
│   ├── catalog/     # JoyaCard, JoyaGrid, FiltrosCatalogo
│   ├── cart/        # CarritoDrawer, CarritoItem, BotonContactar
│   ├── admin/       # AdminLogin, JoyaForm, JoyaTabla, ImageUploader, DashboardAdmin
│   └── layout/      # Navbar, Footer
├── pages/           # Landing, Catalogo, Carrito, Configuracion, NotFound
├── hooks/           # useCarrito, useJoyas, useFeaturedJoyas, useAuth
├── context/         # CarritoContext, AuthContext
├── services/        # supabaseClient, joyasService, imagenesService, settingsService, authService, dashboardService
├── types/           # joya.types.ts, auth.types.ts
├── utils/           # whatsapp.ts, formatters.ts
└── router/          # AppRouter.tsx, ProtectedRoute.tsx
```

---

## 4. Base de Datos (Supabase)

### 4.1. Esquema

El esquema se mantiene en la carpeta `supabase/` y está alineado con `Markdown/plan-base-de-datos.md`:

- `supabase/01_schema.sql`: Crea tablas, índices y triggers de `updated_at`.
- `supabase/02_rls_policies.sql`: Activa RLS y crea las políticas de acceso.
- `supabase/03_seeds.sql`: Inserta datos iniciales (materiales, tipos, piedras, settings).

### 4.2. Tablas Principales

- **materials**: Materiales disponibles (Oro 18K, Plata 925, etc.).
- **product_types**: Tipos de producto (Anillo, Collar, Pulsera, Aretes).
- **products**: Catálogo principal de joyas.
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
| `/carrito`                    | `CarritoPage`    | Carrito de interés                |
| `/admin/login`                | `AdminLogin`     | Login del panel de administración |
| `/admin`                      | `AdminLayout`    | Layout principal del admin        |
| `/admin`                      | `DashboardAdmin` | Dashboard con métricas            |
| `/admin/productos`            | `JoyaTabla`      | Tabla de productos (CRUD)         |
| `/admin/productos/nuevo`      | `JoyaForm`       | Formulario para nuevo producto    |
| `/admin/productos/:id/editar` | `JoyaForm`       | Formulario para editar producto   |
| `/admin/configuracion`        | `Configuracion`  | Configuración del negocio         |
| `*`                           | `NotFound`       | Página de error 404               |

---

## 6. Flujo de WhatsApp

El proyecto genera enlaces de WhatsApp para que los clientes contacten al joyero directamente desde el carrito o la landing page.

```typescript
// utils/whatsapp.ts
const mensaje = generarMensajeCarrito(carritoItems, total);
const url = `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(mensaje)}`;
```

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
| `supabase/03_seeds.sql`          | Datos iniciales de prueba          |
