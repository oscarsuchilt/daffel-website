-- ═══════════════════════════════════════════════════════════════════
-- LIMPIAR URLs DE AIRBNB — quitar parámetros de tracking
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════
--
-- PROBLEMA: varias URLs de Airbnb en la DB tienen colas de tracking como
--   ?source_impression_id=p3_1777953915_P3vpC0Igh21OFbpF&modal=PHOTO_TOUR_SCROLLABLE
-- Son largas, feas y no aportan nada (incluso pueden expirar).
--
-- SOLUCIÓN: recortar todo lo que va después del primer "?".
--   https://airbnb.com.co/rooms/12345?source_impression_id=... → https://airbnb.com.co/rooms/12345
--
-- split_part(url, '?', 1) devuelve todo lo anterior al primer "?".
-- Si la URL no tiene "?", queda igual. Seguro e idempotente.
-- ═══════════════════════════════════════════════════════════════════


-- ── 1. ANTES: ver las URLs con tracking ──
SELECT id, nombre, airbnb
FROM public.propiedades
WHERE airbnb LIKE '%?%'
ORDER BY id;


-- ── 2. Limpiar URLs de Airbnb ──
UPDATE public.propiedades
SET airbnb = split_part(airbnb, '?', 1)
WHERE airbnb LIKE '%?%';


-- ── 3. (opcional) Limpiar también Belong y Expedia por consistencia ──
-- Descomenta si quieres. Revisa primero que no tengan query params legítimos.
--
-- UPDATE public.propiedades
-- SET belong = split_part(belong, '?', 1)
-- WHERE belong LIKE '%?%';
--
-- UPDATE public.propiedades
-- SET expedia = split_part(expedia, '?', 1)
-- WHERE expedia LIKE '%?%';


-- ── 4. VERIFICACIÓN: ya no debe haber "?" en URLs de airbnb ──
SELECT 'airbnb_con_tracking' AS check, COUNT(*) AS sobran
FROM public.propiedades
WHERE airbnb LIKE '%?%';
-- → debe dar 0


-- ── 5. Reporte: ver las URLs ya limpias ──
SELECT id, nombre, airbnb
FROM public.propiedades
WHERE airbnb <> ''
ORDER BY id;
