-- ═══════════════════════════════════════════════════════════════════
-- LIMPIEZA COMPLETA DE TAGS — Pet-friendly + tipos de cama + WiFi
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════
--
-- AUDITORÍA detallada (verificada con curl contra tu DB):
--
--   PROPIEDADES con problemas (12):
--   ───────────────────────────────
--   Pet-friendly (3):
--     • roma_1, roma_3, roma_5
--   Tipo de cama inconsistente (9):
--     • aldea_6  "...cama individual"   → tiene tag "Cama Queen"
--     • aldea_7  "...cama individual"   → tiene tag "Cama King"
--     • aldea_8  "...cama individual"   → tiene tag "Cama matrimonial"
--     • aldea_9  "...cama matrimonial"  → tiene tag "Cama Queen"
--     • padremier_2 "...cama Individual" → tiene tag "Cama Queen"
--     • padremier_3 "...cama individual" → tiene tag "Cama matrimonial"
--     • padremier_4 "...cama matrimonial" → tiene tag "Cama King"
--     • padremier_5 "...cama matrimonial" → tiene tag "Cama Queen"
--     • padremier_8 "...cama matrimonial" → tiene tag "Cama Queen"
--
--   COMPLEJOS con problemas (2):
--   ────────────────────────────
--     • roma:    tiene tag "Pet-friendly"
--     • abasolo: tiene tag "WiFi" (pelado, sin Mbps)
--
-- ESTRATEGIA:
--   1. Quitar "Pet-friendly" de todo
--   2. Si el nombre dice "individual" → eliminar otros tipos de cama y poner "Cama individual"
--   3. Si el nombre dice "matrimonial" → eliminar otros y poner "Cama matrimonial"
--   4. Normalizar "WiFi" pelado → "WiFi 100+ Mbps"
--
-- IDEMPOTENTE: las operaciones son seguras de correr varias veces.
-- ═══════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────
-- 1. ANTES: snapshot del estado actual
-- ─────────────────────────────────────────────────────────────────
SELECT id, nombre, tags FROM public.propiedades
WHERE 'Pet-friendly' = ANY(tags)
   OR nombre ILIKE '%individual%'
   OR nombre ILIKE '%matrimonial%'
ORDER BY id;


-- ─────────────────────────────────────────────────────────────────
-- 2. QUITAR "Pet-friendly" de propiedades y complejos
-- ─────────────────────────────────────────────────────────────────
UPDATE public.propiedades
SET tags = array_remove(tags, 'Pet-friendly')
WHERE 'Pet-friendly' = ANY(tags);

UPDATE public.complejos
SET tags = array_remove(tags, 'Pet-friendly')
WHERE 'Pet-friendly' = ANY(tags);


-- ─────────────────────────────────────────────────────────────────
-- 3. NORMALIZAR TIPO DE CAMA SEGÚN EL NOMBRE
-- ─────────────────────────────────────────────────────────────────

-- 3.1 Para habitaciones cuyo nombre dice "individual":
--     eliminar tags de otros tipos de cama
UPDATE public.propiedades
SET tags = (
  SELECT COALESCE(array_agg(t), ARRAY[]::text[])
  FROM unnest(tags) AS t
  WHERE t NOT IN ('Cama matrimonial','Cama King','Cama Queen','Cama doble','Cama Doble')
)
WHERE nombre ILIKE '%individual%';

-- 3.2 Agregar "Cama individual" si no lo tienen
UPDATE public.propiedades
SET tags = tags || ARRAY['Cama individual']
WHERE nombre ILIKE '%individual%'
  AND NOT ('Cama individual' = ANY(tags));

-- 3.3 Para habitaciones cuyo nombre dice "matrimonial":
--     eliminar tags de otros tipos de cama
UPDATE public.propiedades
SET tags = (
  SELECT COALESCE(array_agg(t), ARRAY[]::text[])
  FROM unnest(tags) AS t
  WHERE t NOT IN ('Cama individual','Cama King','Cama Queen','Cama doble','Cama Doble')
)
WHERE nombre ILIKE '%matrimonial%';

-- 3.4 Agregar "Cama matrimonial" si no lo tienen
UPDATE public.propiedades
SET tags = tags || ARRAY['Cama matrimonial']
WHERE nombre ILIKE '%matrimonial%'
  AND NOT ('Cama matrimonial' = ANY(tags));


-- ─────────────────────────────────────────────────────────────────
-- 4. NORMALIZAR "WiFi" pelado → "WiFi 100+ Mbps"
-- ─────────────────────────────────────────────────────────────────
UPDATE public.complejos
SET tags = array_replace(tags, 'WiFi', 'WiFi 100+ Mbps')
WHERE 'WiFi' = ANY(tags);


-- ─────────────────────────────────────────────────────────────────
-- 5. VERIFICACIÓN: ya no debe haber inconsistencias
-- ─────────────────────────────────────────────────────────────────

-- 5.1 Pet-friendly ya no debe aparecer
SELECT 'propiedades_pet' AS check, COUNT(*) AS sobran
FROM public.propiedades WHERE 'Pet-friendly' = ANY(tags)
UNION ALL
SELECT 'complejos_pet', COUNT(*)
FROM public.complejos WHERE 'Pet-friendly' = ANY(tags)
UNION ALL
-- 5.2 No debe haber tipos de cama conflictivos
SELECT 'individual_con_otros', COUNT(*)
FROM public.propiedades
WHERE nombre ILIKE '%individual%'
  AND (tags && ARRAY['Cama matrimonial','Cama King','Cama Queen','Cama doble'])
UNION ALL
SELECT 'matrimonial_con_otros', COUNT(*)
FROM public.propiedades
WHERE nombre ILIKE '%matrimonial%'
  AND (tags && ARRAY['Cama individual','Cama King','Cama Queen','Cama doble'])
UNION ALL
-- 5.3 WiFi pelado ya no debe existir
SELECT 'wifi_pelado', COUNT(*)
FROM public.complejos WHERE 'WiFi' = ANY(tags);
-- → Todos deben dar 0


-- 5.4 Reporte final: tags únicas con conteos (para que veas el estado)
SELECT tag, COUNT(*) AS veces
FROM public.propiedades, unnest(tags) AS tag
GROUP BY tag
ORDER BY veces DESC, tag;
