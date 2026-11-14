// ═══════════════════════════════════════════════════════════════════
// WHATSAPP — enviar mensajes, marcar leído, descargar imágenes
// Soporta Meta Cloud API directo o 360dialog (mismo formato de mensajes).
// ═══════════════════════════════════════════════════════════════════
import crypto from 'node:crypto';
import { CONFIG } from './config.js';

function base() {
  return CONFIG.WA_PROVIDER === '360dialog'
    ? { url: 'https://waba-v2.360dialog.io/messages', headers: { 'D360-API-KEY': CONFIG.WA_TOKEN } }
    : {
        url: `https://graph.facebook.com/${CONFIG.GRAPH_VERSION}/${CONFIG.WA_PHONE_NUMBER_ID}/messages`,
        headers: { Authorization: `Bearer ${CONFIG.WA_TOKEN}` },
      };
}

async function post(body) {
  const { url, headers } = base();
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`WhatsApp ${res.status}: ${json?.error?.message || JSON.stringify(json)}`);
    err.codigo = json?.error?.code;
    throw err;
  }
  return json;
}

// WhatsApp acepta hasta 4096 caracteres por mensaje; partimos en párrafos.
export function partirTexto(texto, max = 3800) {
  const partes = [];
  let actual = '';
  for (const parrafo of String(texto).split(/\n{2,}/)) {
    if ((actual + '\n\n' + parrafo).length > max && actual) {
      partes.push(actual);
      actual = parrafo;
    } else {
      actual = actual ? actual + '\n\n' + parrafo : parrafo;
    }
    while (actual.length > max) {
      partes.push(actual.slice(0, max));
      actual = actual.slice(max);
    }
  }
  if (actual.trim()) partes.push(actual);
  return partes;
}

// Devuelve los ids (wamid) de los mensajes enviados
export async function enviarTexto(to, texto) {
  const ids = [];
  for (const parte of partirTexto(texto)) {
    const r = await post({ to, type: 'text', text: { body: parte, preview_url: true } });
    ids.push(r?.messages?.[0]?.id);
  }
  return ids;
}

export async function enviarPlantilla(to, nombre, idioma, parametros = []) {
  return post({
    to, type: 'template',
    template: {
      name: nombre, language: { code: idioma },
      components: parametros.length
        ? [{ type: 'body', parameters: parametros.map(t => ({ type: 'text', text: String(t).slice(0, 900) })) }]
        : [],
    },
  });
}

// Palomitas azules + "escribiendo…" mientras la IA piensa (solo Meta lo soporta)
export async function marcarLeido(messageId, escribiendo = true) {
  try {
    const body = { status: 'read', message_id: messageId };
    if (escribiendo && CONFIG.WA_PROVIDER === 'meta') body.typing_indicator = { type: 'text' };
    await post(body);
  } catch (e) {
    console.warn('marcarLeido falló:', e.message);
  }
}

// Descarga una imagen que mandó el cliente → { base64, mime } (o null)
export async function descargarMedia(mediaId) {
  try {
    const meta360 = CONFIG.WA_PROVIDER === '360dialog';
    const headers = meta360 ? { 'D360-API-KEY': CONFIG.WA_TOKEN } : { Authorization: `Bearer ${CONFIG.WA_TOKEN}` };
    const infoUrl = meta360
      ? `https://waba-v2.360dialog.io/${mediaId}`
      : `https://graph.facebook.com/${CONFIG.GRAPH_VERSION}/${mediaId}`;
    const info = await (await fetch(infoUrl, { headers })).json();
    if (!info?.url) return null;
    let url = info.url;
    if (meta360) url = url.replace('https://lookaside.fbsbx.com', 'https://waba-v2.360dialog.io');
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 4.5 * 1024 * 1024) return null; // límite práctico para la IA
    return { base64: buf.toString('base64'), mime: info.mime_type || res.headers.get('content-type') || 'image/jpeg' };
  } catch (e) {
    console.warn('descargarMedia falló:', e.message);
    return null;
  }
}

// Valida que el webhook realmente venga de Meta
export function firmaValida(rawBody, header) {
  if (!CONFIG.META_APP_SECRET) return true; // sin secreto configurado no se valida (no recomendado)
  if (!header || !header.startsWith('sha256=')) return false;
  const esperado = 'sha256=' + crypto.createHmac('sha256', CONFIG.META_APP_SECRET).update(rawBody).digest('hex');
  const a = Buffer.from(esperado), b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
