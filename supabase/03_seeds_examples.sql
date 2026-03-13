-- Dmur Jewelry - Seeds iniciales
-- Proyecto Supabase: "D'MUR Joyería"
-- Seeds idempotentes para materiales, tipos de producto, piedras y settings.

-- ============================================================================
-- Materials
-- ============================================================================

insert into public.materials (id, name, material_value)
values
  (gen_random_uuid(), 'Oro 18K',        100000.00),
  (gen_random_uuid(), 'Plata 925',      50000.00),
  (gen_random_uuid(), 'Acero quirúrgico', 20000.00)
on conflict (name) do nothing;

-- ============================================================================
-- Product types
-- ============================================================================

insert into public.product_types (id, name, type_value)
values
  (gen_random_uuid(), 'Anillo',   80000.00),
  (gen_random_uuid(), 'Collar',   90000.00),
  (gen_random_uuid(), 'Pulsera',  70000.00),
  (gen_random_uuid(), 'Aretes',   60000.00)
on conflict (name) do nothing;

-- ============================================================================
-- Stones (opcional pero útil para demo)
-- ============================================================================

insert into public.stones (id, stone_type, stone_size, stone_value)
values
  (gen_random_uuid(), 'Diamante',  '0.25ct', 300000.00),
  (gen_random_uuid(), 'Esmeralda', '5x3mm',  150000.00),
  (gen_random_uuid(), 'Zirconia',  '3mm',     50000.00)
on conflict do nothing;

-- ============================================================================
-- Settings (una sola fila lógica)
-- ============================================================================

insert into public.settings (id, whatsapp_number, currency, business_name)
select
  gen_random_uuid(),
  '573001234567',       -- número de prueba, cambiar por el real en producción
  'COP',
  'Dmur Jewelry'
where not exists (select 1 from public.settings);

