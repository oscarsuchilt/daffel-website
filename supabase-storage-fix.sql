-- ═══════════════════════════════════════════════════════════════════
-- FIX STORAGE — Permitir uploads al bucket "fotos" desde anon
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════
--
-- PROBLEMA: al cambiar la imagen de un complejo (o subir fotos a una
-- propiedad / al marquee), el upload falla silenciosamente. El admin
-- "guarda" el complejo pero la foto no se reemplaza.
--
-- CAUSA: las URLs públicas del bucket "fotos" funcionan (SELECT abierto),
-- pero INSERT/UPDATE/DELETE en storage.objects están bloqueados por RLS
-- para el rol anon. El cliente Supabase recibe 403 y uploadFoto() retorna
-- null sin alertar al usuario.
--
-- Evidencia (curl directo):
--   POST /storage/v1/object/fotos/test
--   → 403 "new row violates row-level security policy"
--
-- IDEMPOTENTE: si ya existen las policies, se reemplazan.
-- ═══════════════════════════════════════════════════════════════════

-- ── SELECT (las URLs públicas ya funcionan, pero confirmamos) ──
DROP POLICY IF EXISTS "anon_select_fotos" ON storage.objects;
CREATE POLICY "anon_select_fotos" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'fotos');

-- ── INSERT (subir fotos nuevas) ──
DROP POLICY IF EXISTS "anon_upload_fotos" ON storage.objects;
CREATE POLICY "anon_upload_fotos" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'fotos');

-- ── UPDATE (necesario porque el código hace { upsert: true }) ──
DROP POLICY IF EXISTS "anon_update_fotos" ON storage.objects;
CREATE POLICY "anon_update_fotos" ON storage.objects
  FOR UPDATE TO anon
  USING (bucket_id = 'fotos')
  WITH CHECK (bucket_id = 'fotos');

-- ── DELETE (cuando se reemplaza foto o se borra del marquee) ──
DROP POLICY IF EXISTS "anon_delete_fotos" ON storage.objects;
CREATE POLICY "anon_delete_fotos" ON storage.objects
  FOR DELETE TO anon
  USING (bucket_id = 'fotos');

-- NOTA: la limpieza de archivos del bucket NO se puede hacer con DELETE
-- directo en storage.objects (Supabase lo bloquea para evitar orfandad).
-- Si quedó algún archivo de prueba __upload_test__, hay que borrarlo
-- desde el Dashboard: Storage → fotos → seleccionar archivo → Delete.
-- En todo caso, mi test inicial recibió 403 antes de subir, así que
-- probablemente no hay nada que limpiar.

-- ── Verificación: listar policies del bucket "fotos" ──
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY cmd;
