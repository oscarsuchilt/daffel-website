-- ═══════════════════════════════════════════════════════════════════
-- BOT DE WHATSAPP — tablas de conversaciones
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- IDEMPOTENTE: se puede correr varias veces.
-- ═══════════════════════════════════════════════════════════════════
--
-- IMPORTANTE: estas tablas guardan teléfonos y conversaciones de clientes.
-- Tienen RLS activado y NINGUNA policy para anon → la llave pública del
-- sitio NO puede leerlas ni modificarlas. Solo el servidor (llave
-- service_role, guardada en Vercel) tiene acceso.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Chats (uno por número de cliente) ──
CREATE TABLE IF NOT EXISTS public.wa_chats (
  wa_id              TEXT PRIMARY KEY,              -- número del cliente, ej. 5218112345678
  nombre             TEXT,                          -- nombre de perfil de WhatsApp
  modo               TEXT NOT NULL DEFAULT 'bot' CHECK (modo IN ('bot','humano')),
  pausado_hasta      TIMESTAMPTZ,                   -- si modo='humano': el bot vuelve solo después de esta hora (NULL = hasta reactivarlo)
  necesita_humano    BOOLEAN NOT NULL DEFAULT FALSE,
  urgencia           TEXT,                          -- 'urgente' | 'normal'
  motivo_escalado    TEXT,
  escalado_at        TIMESTAMPTZ,
  ultimo_mensaje     TEXT,
  ultimo_mensaje_at  TIMESTAMPTZ,
  no_leidos          INTEGER NOT NULL DEFAULT 0,
  creado_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Mensajes ──
CREATE TABLE IF NOT EXISTS public.wa_mensajes (
  id             BIGSERIAL PRIMARY KEY,
  wa_id          TEXT NOT NULL,
  wa_message_id  TEXT UNIQUE,                       -- evita procesar dos veces el mismo mensaje
  rol            TEXT NOT NULL CHECK (rol IN ('cliente','bot','humano','sistema')),
  texto          TEXT,
  tipo           TEXT DEFAULT 'text',
  meta           JSONB,
  creado_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wa_mensajes_chat_idx ON public.wa_mensajes (wa_id, id DESC);
CREATE INDEX IF NOT EXISTS wa_chats_ultimo_idx  ON public.wa_chats (ultimo_mensaje_at DESC);

-- ── 3. Seguridad: RLS sin policies públicas ──
ALTER TABLE public.wa_chats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_mensajes ENABLE ROW LEVEL SECURITY;

-- Por si alguien creó policies abiertas antes, se eliminan:
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT policyname, tablename FROM pg_policies
           WHERE schemaname = 'public' AND tablename IN ('wa_chats','wa_mensajes')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

REVOKE ALL ON public.wa_chats, public.wa_mensajes FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.wa_mensajes_id_seq FROM anon, authenticated;

-- ── 4. Verificación ──
-- Debe mostrar las 2 tablas con rowsecurity = true y 0 policies.
SELECT tablename, rowsecurity,
       (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename) AS policies
FROM pg_tables t
WHERE schemaname = 'public' AND tablename IN ('wa_chats','wa_mensajes');
