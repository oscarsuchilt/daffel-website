// ═══════════════════════════════════════════════════════════════════
// BASE DE DATOS — chats y mensajes de WhatsApp + catálogo de suites
// Usa la llave service_role (solo servidor). Las tablas wa_* tienen RLS
// activado SIN policies para anon: nadie desde el navegador puede leerlas.
// ═══════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';

let _sb = null;
function sb() {
  if (!_sb) {
    if (!CONFIG.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');
    _sb = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _sb;
}

// ─── Implementación en memoria (solo para pruebas locales) ───
const mem = { chats: new Map(), mensajes: [], complejos: [], propiedades: [], seq: 1 };
export const _memoria = mem;
const usarMemoria = () => process.env.DB_MEMORIA === '1';

function falla(error, que) {
  if (error) throw new Error(`Supabase (${que}): ${error.message}`);
}

// ─── CHATS ───
export async function obtenerChat(wa_id) {
  if (usarMemoria()) return mem.chats.get(wa_id) || null;
  const { data, error } = await sb().from('wa_chats').select('*').eq('wa_id', wa_id).maybeSingle();
  falla(error, 'obtenerChat');
  return data;
}

export async function guardarChat(wa_id, cambios) {
  const fila = { wa_id, ...cambios, actualizado_at: new Date().toISOString() };
  if (usarMemoria()) {
    const prev = mem.chats.get(wa_id) || { wa_id, modo: 'bot', necesita_humano: false, creado_at: fila.actualizado_at };
    const nuevo = { ...prev, ...fila };
    mem.chats.set(wa_id, nuevo);
    return nuevo;
  }
  const { data, error } = await sb().from('wa_chats').upsert(fila, { onConflict: 'wa_id' }).select().single();
  falla(error, 'guardarChat');
  return data;
}

export async function listarChats(limite = 100) {
  if (usarMemoria()) {
    return [...mem.chats.values()].sort((a, b) => (b.ultimo_mensaje_at || '').localeCompare(a.ultimo_mensaje_at || ''));
  }
  const { data, error } = await sb().from('wa_chats').select('*')
    .order('ultimo_mensaje_at', { ascending: false, nullsFirst: false }).limit(limite);
  falla(error, 'listarChats');
  return data || [];
}

// ─── MENSAJES ───
// rol: 'cliente' | 'bot' | 'humano' | 'sistema'
// Devuelve { duplicado:true } si Meta reenvió un mensaje que ya procesamos.
export async function guardarMensaje({ wa_id, wa_message_id = null, rol, texto, tipo = 'text', meta = null }) {
  const fila = { wa_id, wa_message_id, rol, texto, tipo, meta, creado_at: new Date().toISOString() };
  if (usarMemoria()) {
    if (wa_message_id && mem.mensajes.some(m => m.wa_message_id === wa_message_id)) return { duplicado: true };
    const m = { id: mem.seq++, ...fila };
    mem.mensajes.push(m);
    return { duplicado: false, mensaje: m };
  }
  const { data, error } = await sb().from('wa_mensajes').insert(fila).select().single();
  if (error && error.code === '23505') return { duplicado: true };
  falla(error, 'guardarMensaje');
  return { duplicado: false, mensaje: data };
}

export async function historial(wa_id, n = CONFIG.HISTORIAL_MENSAJES) {
  if (usarMemoria()) return mem.mensajes.filter(m => m.wa_id === wa_id).slice(-n);
  const { data, error } = await sb().from('wa_mensajes').select('*')
    .eq('wa_id', wa_id).order('id', { ascending: false }).limit(n);
  falla(error, 'historial');
  return (data || []).reverse();
}

export async function ultimoMensajeCliente(wa_id) {
  if (usarMemoria()) return [...mem.mensajes].reverse().find(m => m.wa_id === wa_id && m.rol === 'cliente') || null;
  const { data, error } = await sb().from('wa_mensajes').select('id,wa_message_id')
    .eq('wa_id', wa_id).eq('rol', 'cliente').order('id', { ascending: false }).limit(1).maybeSingle();
  falla(error, 'ultimoMensajeCliente');
  return data;
}

// ─── CATÁLOGO (las mismas tablas que usa la página y el administrador) ───
export async function leerCatalogo() {
  if (usarMemoria()) return { complejos: mem.complejos, propiedades: mem.propiedades };
  const [c, p] = await Promise.all([
    sb().from('complejos').select('*').order('_orden', { ascending: true, nullsFirst: false }),
    sb().from('propiedades').select('*').order('_orden', { ascending: true, nullsFirst: false }),
  ]);
  falla(c.error, 'complejos');
  falla(p.error, 'propiedades');
  return { complejos: c.data || [], propiedades: p.data || [] };
}
