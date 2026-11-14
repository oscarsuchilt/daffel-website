// ═══════════════════════════════════════════════════════════════════
// API DE LA BANDEJA → /api/bandeja  (la usa /bandeja.html)
// Protegida con ADMIN_TOKEN (variable de entorno). Nada de esto es público.
//
//   GET  /api/bandeja               → lista de chats
//   GET  /api/bandeja?chat=52181…   → mensajes de un chat
//   POST { accion:'responder', wa_id, texto }   → contestar como humano (pausa al bot)
//   POST { accion:'modo', wa_id, modo:'bot'|'humano' }
//   POST { accion:'resuelto', wa_id }           → quitar la alerta "necesita humano"
// ═══════════════════════════════════════════════════════════════════
import crypto from 'node:crypto';
import { CONFIG } from './_lib/config.js';
import * as db from './_lib/db.js';
import * as wa from './_lib/whatsapp.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

function autorizado(request) {
  if (!CONFIG.ADMIN_TOKEN) return false;
  const h = request.headers.get('authorization') || '';
  const token = h.replace(/^Bearer\s+/i, '');
  const a = Buffer.from(token), b = Buffer.from(CONFIG.ADMIN_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const soloDigitos = s => String(s || '').replace(/\D/g, '');

export async function GET(request) {
  if (!autorizado(request)) return json({ error: 'No autorizado' }, 401);
  const u = new URL(request.url);
  const chat = soloDigitos(u.searchParams.get('chat'));
  try {
    if (chat) {
      const [info, mensajes] = await Promise.all([db.obtenerChat(chat), db.historial(chat, 200)]);
      if (info?.no_leidos) await db.guardarChat(chat, { no_leidos: 0 });
      return json({ chat: info, mensajes });
    }
    return json({
      chats: await db.listarChats(150),
      config: { botActivo: CONFIG.BOT_ACTIVO, horario: CONFIG.BOT_HORARIO, pausaHoras: CONFIG.HUMANO_PAUSA_HORAS },
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export async function POST(request) {
  if (!autorizado(request)) return json({ error: 'No autorizado' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'JSON inválido' }, 400); }
  const wa_id = soloDigitos(body.wa_id);
  if (!wa_id) return json({ error: 'Falta wa_id' }, 400);
  const ahora = new Date().toISOString();

  try {
    if (body.accion === 'responder') {
      const texto = String(body.texto || '').trim();
      if (!texto) return json({ error: 'Mensaje vacío' }, 400);
      let ids;
      try {
        ids = await wa.enviarTexto(wa_id, texto);
      } catch (e) {
        // 131047 = pasaron más de 24 h desde el último mensaje del cliente
        const fuera = e.codigo === 131047 || /24/.test(e.message);
        return json({ error: fuera ? 'Pasaron más de 24 h desde el último mensaje del cliente: WhatsApp solo permite escribirle con una plantilla aprobada.' : e.message }, 502);
      }
      await db.guardarMensaje({ wa_id, wa_message_id: ids[0] || null, rol: 'humano', texto, meta: { ids, via: 'bandeja' } });
      const pausa = new Date(Date.now() + CONFIG.HUMANO_PAUSA_HORAS * 3600 * 1000).toISOString();
      const chat = await db.guardarChat(wa_id, {
        modo: 'humano', pausado_hasta: pausa, necesita_humano: false,
        ultimo_mensaje_at: ahora, ultimo_mensaje: texto.slice(0, 200),
      });
      return json({ ok: true, chat });
    }

    if (body.accion === 'modo') {
      if (!['bot', 'humano'].includes(body.modo)) return json({ error: 'modo inválido' }, 400);
      const chat = await db.guardarChat(wa_id, body.modo === 'bot'
        ? { modo: 'bot', pausado_hasta: null }
        : { modo: 'humano', pausado_hasta: null }); // null = pausado sin vencimiento hasta reactivarlo
      await db.guardarMensaje({ wa_id, rol: 'sistema', texto: body.modo === 'bot' ? 'Bot reactivado desde la bandeja' : 'Bot pausado desde la bandeja', tipo: 'nota' });
      return json({ ok: true, chat });
    }

    if (body.accion === 'resuelto') {
      const chat = await db.guardarChat(wa_id, { necesita_humano: false, urgencia: null });
      return json({ ok: true, chat });
    }

    return json({ error: 'acción desconocida' }, 400);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
