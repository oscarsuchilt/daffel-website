-- ═══════════════════════════════════════════════════════════════════
-- FIX RLS — Policies completas para que el admin funcione al 100%
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════
--
-- DIAGNÓSTICO actual (verificado con curl):
--   ✅ SELECT: permitido
--   ✅ INSERT: permitido (gracias a la SQL anterior que ya corriste)
--   ❌ UPDATE: silenciosamente bloqueado (devuelve 204 OK pero 0 filas afectadas)
--   ❌ DELETE: silenciosamente bloqueado (mismo síntoma)
--
-- CAUSA: cuando una tabla tiene RLS y no existe policy para una operación,
-- Postgres acepta la query pero NO afecta filas. PostgREST devuelve 204 OK,
-- así que el frontend "cree" que todo salió bien. Bug silencioso.
--
-- Este script es idempotente (DROP IF EXISTS + CREATE), puedes correrlo
-- las veces que quieras sin romper nada.
-- ═══════════════════════════════════════════════════════════════════

-- ─── COMPLEJOS: SELECT, INSERT, UPDATE, DELETE para anon ──
DROP POLICY IF EXISTS "anon_select_complejos" ON public.complejos;
CREATE POLICY "anon_select_complejos" ON public.complejos
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_complejos" ON public.complejos;
CREATE POLICY "anon_insert_complejos" ON public.complejos
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_complejos" ON public.complejos;
CREATE POLICY "anon_update_complejos" ON public.complejos
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_complejos" ON public.complejos;
CREATE POLICY "anon_delete_complejos" ON public.complejos
  FOR DELETE TO anon USING (true);

-- ─── PROPIEDADES: SELECT, INSERT, UPDATE, DELETE para anon ──
DROP POLICY IF EXISTS "anon_select_propiedades" ON public.propiedades;
CREATE POLICY "anon_select_propiedades" ON public.propiedades
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_propiedades" ON public.propiedades;
CREATE POLICY "anon_insert_propiedades" ON public.propiedades
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_propiedades" ON public.propiedades;
CREATE POLICY "anon_update_propiedades" ON public.propiedades
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_propiedades" ON public.propiedades;
CREATE POLICY "anon_delete_propiedades" ON public.propiedades
  FOR DELETE TO anon USING (true);

-- ─── GALERIA: ALL operaciones para anon ──
DROP POLICY IF EXISTS "anon_all_galeria" ON public.galeria;
CREATE POLICY "anon_all_galeria" ON public.galeria
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── Limpieza: borrar registros de prueba que dejé durante el audit ──
DELETE FROM public.propiedades WHERE id LIKE '__audit%';
DELETE FROM public.complejos   WHERE id LIKE '__audit%';

-- ─── Verificación final: listar policies activas ──
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
