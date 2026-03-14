# AGENTS.md — Dmur Jewelry

Antes de cualquier tarea, lee este archivo completo.
Los planes de referencia completos están en `Markdown/plan-Dmur.md` y `Markdown/plan-base-de-datos.md`.

---

## Contexto del proyecto

Catálogo web para una joyería pequeña. El sitio **NO procesa pagos**.
El cliente (joyero) gestiona su catálogo desde un panel de administración protegido.
Los visitantes exploran joyas y contactan al joyero directamente por WhatsApp.

---

## Stack — No cambies estas tecnologías

| Área     | Tecnología                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | React 18 + TypeScript + Vite                                  |
| Estilos  | Tailwind CSS (paleta `gold` definida en `tailwind.config.js`) |
| Backend  | Supabase (PostgreSQL + Auth + Storage)                        |
| Contacto | WhatsApp `wa.me` — sin WhatsApp Business API                  |
| Hosting  | Vercel                                                        |

---

## Estructura de carpetas — Respétala siempre

```
src/
├── components/
│   ├── ui/          # Componentes genéricos (Button, Modal, Spinner)
│   ├── landing/     # Hero, About, Materials, FeaturedProducts, CTAFinal
│   ├── catalog/     # JoyaCard, JoyaGrid, FiltrosCatalogo
│   ├── cart/        # CarritoDrawer, CarritoItem, BotonContactar
│   ├── admin/       # AdminLogin, JoyaForm, JoyaTabla, ImageUploader
│   └── layout/      # Navbar, Footer
├── pages/           # Landing, Catalogo, Carrito, Admin, NotFound
├── hooks/           # useCarrito, useJoyas, useFeaturedJoyas, useAuth
├── context/         # CarritoContext, AuthContext
├── services/        # supabaseClient, joyasService, imagenesService, settingsService, authService
├── types/           # joya.types.ts, auth.types.ts
├── utils/           # whatsapp.ts, formatters.ts
└── router/          # AppRouter.tsx
```

---

## Base de datos — Tablas existentes en Supabase

```
materials        → materiales disponibles (Oro 18K, Plata 925, etc.)
product_types    → tipos de producto (Anillo, Collar, Pulsera, Aretes)
products         → catálogo principal de joyas
stones           → piedras disponibles
product_stones   → relación many-to-many productos ↔ piedras
product_images   → imágenes de cada producto (en Supabase Storage)
settings         → configuración global (whatsapp_number, currency, business_name)
```

**Reglas estrictas:**

- ❌ No renombres tablas ni columnas
- ❌ No cambies tipos de datos existentes
- ✅ Usa siempre `IF NOT EXISTS` en migraciones SQL
- ✅ RLS está activo en todas las tablas — respétalo

---

## Seguridad RLS — Regla general

```
SELECT    → cualquier visitante anónimo puede leer
INSERT / UPDATE / DELETE → solo auth.role() = 'authenticated' (el joyero)

Excepción products:
  SELECT público solo devuelve registros con active = true
```

---

## Rutas de la aplicación

```
/              → Landing (pública)
/catalogo      → Catálogo (pública)
/carrito       → Carrito de interés (pública)
/[ruta-admin]  → Panel admin (protegida — solo usuario autenticado)
```

> La ruta exacta del admin no es `/admin` sino una ruta con segmento
> aleatorio definida en `src/router/AppRouter.tsx`. No la cambies.

---

## Reglas de desarrollo

### Siempre

- ✅ Usa TypeScript estricto — cero `any`
- ✅ Usa los tipos definidos en `src/types/joya.types.ts`
- ✅ Toda comunicación con Supabase va en `src/services/`
- ✅ Usa la paleta de colores `gold` de Tailwind para estilos
- ✅ Maneja siempre los estados: cargando, error y vacío
- ✅ Las imágenes se validan antes de subir: máx 5MB, solo jpg/png/webp

### Nunca

- ❌ No instales librerías no mencionadas en el stack sin preguntar
- ❌ No uses `any` en TypeScript
- ❌ No pongas lógica de negocio dentro de componentes visuales
- ❌ No hagas llamadas a Supabase directamente desde componentes — usa los servicios
- ❌ No modifiques `.env` ni expongas claves

---

## Precios — Campos importantes

Cada producto tiene tres campos de precio:

```
fixed_cost         → costo base (materiales + mano de obra)
margin_percentage  → margen sobre el costo (ej: 30.00 = 30%)
final_price        → precio mostrado al cliente (editable manualmente)

precio_sugerido = fixed_cost * (1 + margin_percentage / 100)
```

El frontend siempre muestra `final_price`. Los otros dos son internos del admin.

---

## Flujo WhatsApp

```typescript
// utils/whatsapp.ts ya implementado
// El mensaje se arma con la lista de joyas del carrito
// La URL tiene la forma:
`https://wa.me/${whatsapp_number}?text=${encodeURIComponent(mensaje)}`;
// El número se lee desde la tabla settings de Supabase
```

---

## Fases del proyecto

| Fase         | Estado       | Descripción                                         |
| ------------ | ------------ | --------------------------------------------------- |
| 1 — Setup    | ✅ Completo  | Vite + React + TS + Tailwind + Supabase configurado |
| 2 — Landing  | ✅ Completo  | Hero, About, Materials, FeaturedProducts, CTAFinal  |
| 3 — Catálogo | ✅ Completo  | JoyaGrid, JoyaCard, FiltrosCatalogo                 |
| 4 — Carrito  | ⏳ Pendiente | CarritoContext, CarritoDrawer, BotonContactar       |
| 5 — Admin    | ⏳ Pendiente | Login, CRUD productos, gestión imágenes             |
| 6 — Deploy   | ⏳ Pendiente | Vercel + dominio                                    |

**Actualiza el estado de cada fase cuando la completes.**

---

## Archivos de referencia

| Archivo                          | Contenido                          |
| -------------------------------- | ---------------------------------- |
| `Markdown/plan-Dmur.md`          | Plan técnico completo del proyecto |
| `Markdown/plan-base-de-datos.md` | Modelo de datos detallado con SQL  |
| `supabase/01_schema.sql`         | DDL ejecutado en Supabase          |
| `supabase/02_rls.sql`            | Políticas RLS ejecutadas           |
| `supabase/03_seeds.sql`          | Datos iniciales de prueba          |
