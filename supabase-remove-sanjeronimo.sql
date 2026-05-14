-- ═══════════════════════════════════════════════════════════════════
-- ELIMINAR SAN JERÓNIMO — tendrá su propia página web especial
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════
--
-- CONTEXTO: el complejo "San Jerónimo" se separa del sitio principal
-- porque tendrá una página web dedicada. Se elimina de:
--   • tabla propiedades  (sus 5 unidades: sanjeronimo_1 ... sanjeronimo_N)
--   • tabla complejos    (el registro 'sanjeronimo')
--
-- El código del sitio ya fue limpiado (no quedan referencias a San Jerónimo).
--
-- NOTA: las fotos en Storage (bucket fotos/propiedades/...) NO se borran
-- automáticamente. Si quieres liberar ese espacio, hazlo desde el
-- Dashboard → Storage → fotos. No es urgente, no afecta el sitio.
-- ═══════════════════════════════════════════════════════════════════


-- ── 1. ANTES: ver qué se va a eliminar ──
SELECT 'propiedades' AS tabla, id, nombre FROM public.propiedades WHERE complejo = 'sanjeronimo'
UNION ALL
SELECT 'complejos', id, nombre FROM public.complejos WHERE id = 'sanjeronimo';


-- ── 2. Eliminar las unidades de San Jerónimo ──
DELETE FROM public.propiedades WHERE complejo = 'sanjeronimo';


-- ── 3. Eliminar el complejo San Jerónimo ──
DELETE FROM public.complejos WHERE id = 'sanjeronimo';


-- ── 4. VERIFICACIÓN: ya no debe quedar nada ──
SELECT 'propiedades_sanjeronimo' AS check, COUNT(*) AS sobran
FROM public.propiedades WHERE complejo = 'sanjeronimo'
UNION ALL
SELECT 'complejos_sanjeronimo', COUNT(*)
FROM public.complejos WHERE id = 'sanjeronimo';
-- → ambos deben dar 0


-- ── 5. Conteo final esperado ──
-- complejos: 5 (abasolo, morelos, roma, aldea, padremier)
-- propiedades: 25 (5 complejos × 5 unidades)
SELECT 'complejos' AS tabla, COUNT(*) AS total FROM public.complejos
UNION ALL
SELECT 'propiedades', COUNT(*) FROM public.propiedades;
