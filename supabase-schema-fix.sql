-- ═══════════════════════════════════════════════════════════════════
-- FIX SCHEMA COMPLETO — Auditoría de las 3 tablas (complejos, propiedades, galeria)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════
--
-- RESULTADO DE LA AUDITORÍA (verificado contra tu DB con curl):
--
--   ┌──────────────┬─────────────────────────────────────────────────────────┐
--   │ Tabla        │ Estado vs código                                        │
--   ├──────────────┼─────────────────────────────────────────────────────────┤
--   │ complejos    │ ❌ Falta columna "descripcion" (causa el error del admin)│
--   │ propiedades  │ ✅ Schema completo (17 columnas, todas coinciden)       │
--   │ galeria      │ ✅ Schema completo (id auto + src + nombre)             │
--   └──────────────┴─────────────────────────────────────────────────────────┘
--
-- Solo hay un cambio real: añadir "descripcion" a complejos.
-- El resto del script es solo verificación + limpieza idempotente.
-- ═══════════════════════════════════════════════════════════════════


-- ── 1. FIX único: añadir columna 'descripcion' a 'complejos' ──
ALTER TABLE public.complejos
  ADD COLUMN IF NOT EXISTS descripcion TEXT;


-- ── 2. Limpieza preventiva: por si quedaron registros de prueba del audit ──
DELETE FROM public.propiedades WHERE id LIKE '\_\_audit%' ESCAPE '\'
   OR id LIKE '\_\_verify%' ESCAPE '\';
DELETE FROM public.complejos   WHERE id LIKE '\_\_audit%' ESCAPE '\'
   OR id LIKE '\_\_verify%' ESCAPE '\';


-- ── 3. VERIFICACIÓN: listar las columnas de las 3 tablas ──
-- Debes ver:
--   complejos    → id, nombre, direccion, unidades, tags, foto, descripcion
--   propiedades  → 17 columnas (id, complejo, nombre, badge, ..., fotos)
--   galeria      → id, src, nombre
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('complejos', 'propiedades', 'galeria')
ORDER BY table_name, ordinal_position;


-- ── 4. VERIFICACIÓN: confirmar que las RLS policies siguen activas ──
-- Debes ver 4 policies por tabla (SELECT/INSERT/UPDATE/DELETE) en complejos
-- y propiedades, más una FOR ALL en galeria.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('complejos', 'propiedades', 'galeria')
ORDER BY tablename, cmd;


-- ── 5. VERIFICACIÓN: conteo final de filas ──
-- Esperado: 6 complejos, 30 propiedades, 6 galería (los reales, sin tests)
SELECT 'complejos' AS tabla, COUNT(*) AS filas FROM public.complejos
UNION ALL
SELECT 'propiedades', COUNT(*) FROM public.propiedades
UNION ALL
SELECT 'galeria', COUNT(*) FROM public.galeria;
