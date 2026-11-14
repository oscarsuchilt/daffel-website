// ═══════════════════════════════════════════════════════════════════
// PROCESADOR DEL WEBHOOK — qué hacer con cada evento de WhatsApp
//
//  • Mensaje del cliente  → se guarda → (si el bot está activo en ese chat) responde la IA
//  • Mensaje que manda una PERSONA desde la app WhatsApp Business (coexistencia)
//      → llega como "smb_message_echoes" → se guarda y el bot SE CALLA en ese chat
//        durante HUMANO_PAUSA_HORAS (o hasta que lo reactiven en /bandeja)
// ═══════════════════════════════════════════════════════════════════
import { CONFIG, esHorarioOficina } from './config.js';
import * as db from './db.js';
import * as wa from './whatsapp.js';
import { responder } from './agente.js';

const dormir = ms => new Promise(r => setTimeout(r, ms));
const ahoraISO = () => new Date().toISOString();
const MENSAJE_RESPALDO = '¡Hola! Gracias por escribir a Barrio Inn 😊 En un momento alguien del equipo te contesta aquí mismo.';

// Convierte cualquier tipo de mensaje de WhatsApp a texto entendible para la IA
export function extraerTexto(msg) {
  switch (msg.type) {
    case 'text': return { texto: msg.text?.body || '', tipo: 'text' };
    case 'interactive': {
      const r = msg.interactive?.button_reply || msg.interactive?.list_reply;
      return { texto: r?.title || '', tipo: 'interactive' };
    }
    case 'button': return { texto: msg.button?.text || '', tipo: 'button' };
    case 'image': return { texto: msg.image?.caption || '', tipo: 'image', media_id: msg.image?.id };
    case 'audio': return { texto: '[El cliente mandó una nota de voz. No puedes escucharla: pídele amablemente que lo escriba.]', tipo: 'audio' };
    case 'video': return { texto: `[El cliente mandó un video que no puedes ver] ${msg.video?.caption || ''}`.trim(), tipo: 'video' };
    case 'document': return { texto: `[El cliente mandó un documento: ${msg.document?.filename || 'archivo'}] ${msg.document?.caption || ''}`.trim(), tipo: 'document' };
    case 'location': return { texto: `[Ubicación compartida: ${msg.location?.name || ''} ${msg.location?.address || ''} (${msg.location?.latitude}, ${msg.location?.longitude})]`.trim(), tipo: 'location' };
    case 'contacts': return { texto: '[El cliente compartió un contacto]', tipo: 'contacts' };
    case 'reaction': case 'sticker': case 'unsupported': return null; // no ameritan respuesta
    default: return { texto: `[Mensaje de tipo ${msg.type}]`, tipo: msg.type };
  }
}

// ¿Debe contestar el bot en este chat ahora mismo?
export async function botPuedeResponder(chat) {
  if (!CONFIG.BOT_ACTIVO) return false;
  if (CONFIG.BOT_HORARIO === 'fuera_de_oficina' && esHorarioOficina()) return false;
  if (chat?.modo === 'humano') {
    const hasta = chat.pausado_hasta ? new Date(chat.pausado_hasta).getTime() : Infinity;
    if (Date.now() < hasta) return false;
    await db.guardarChat(chat.wa_id, { modo: 'bot', pausado_hasta: null }); // la pausa ya venció
  }
  return true;
}

async function avisarEquipo({ wa_id, nombre, urgencia, motivo, resumen }) {
  if (!CONFIG.STAFF_NUMEROS.length) return;
  const etiqueta = urgencia === 'urgente' ? '🚨 URGENTE' : '🔔 Atención';
  const texto = `${etiqueta} · Barrio Inn WhatsApp\nCliente: ${nombre || 'sin nombre'} (+${wa_id})\nMotivo: ${motivo}\n${resumen}\n\nAbre el chat en la app o en ${CONFIG.SITIO}/bandeja`;
  await Promise.all(CONFIG.STAFF_NUMEROS.map(async numero => {
    try {
      if (CONFIG.STAFF_TEMPLATE) {
        await wa.enviarPlantilla(numero, CONFIG.STAFF_TEMPLATE, CONFIG.STAFF_TEMPLATE_LANG,
          [`${etiqueta} ${nombre || ''}`.trim(), `+${wa_id}`, `${motivo}. ${resumen}`]);
      } else {
        await wa.enviarTexto(numero, texto); // solo llega si ese número escribió al bot en las últimas 24 h
      }
    } catch (e) {
      console.error(`No se pudo avisar a ${numero}:`, e.message);
    }
  }));
}

// ─── Mensaje entrante del cliente ───
export async function procesarMensajeCliente(msg, contacto) {
  const wa_id = msg.from;
  const nombre = contacto?.profile?.name || null;
  const extraido = extraerTexto(msg);
  if (!extraido) return { accion: 'ignorado' };

  const { duplicado } = await db.guardarMensaje({
    wa_id, wa_message_id: msg.id, rol: 'cliente', texto: extraido.texto, tipo: extraido.tipo,
    meta: extraido.media_id ? { media_id: extraido.media_id } : null,
  });
  if (duplicado) return { accion: 'duplicado' };

  const previo = await db.obtenerChat(wa_id);
  const chat = await db.guardarChat(wa_id, {
    nombre: nombre || previo?.nombre || null,
    ultimo_mensaje_at: ahoraISO(),
    ultimo_mensaje: (extraido.texto || `[${extraido.tipo}]`).slice(0, 200),
    no_leidos: (previo?.no_leidos || 0) + 1,
    modo: previo?.modo || 'bot',
  });

  if (!(await botPuedeResponder(chat))) return { accion: 'humano_atiende' };

  await wa.marcarLeido(msg.id, true);

  // Si el cliente manda varios mensajes seguidos, solo el último dispara la respuesta
  if (CONFIG.DEBOUNCE_MS > 0) {
    await dormir(CONFIG.DEBOUNCE_MS);
    const ultimo = await db.ultimoMensajeCliente(wa_id);
    if (ultimo && ultimo.wa_message_id !== msg.id) return { accion: 'agrupado' };
    // ¿Un humano tomó el chat mientras esperábamos?
    if (!(await botPuedeResponder(await db.obtenerChat(wa_id)))) return { accion: 'humano_atiende' };
  }

  const hist = await db.historial(wa_id);

  // Descarga las imágenes recientes del cliente para que la IA las vea
  const imagenes = {};
  for (const m of hist.slice(-6)) {
    if (m.rol === 'cliente' && m.tipo === 'image' && m.meta?.media_id) {
      const img = await wa.descargarMedia(m.meta.media_id);
      if (img) imagenes[m.id] = img;
      else m.texto = `[El cliente mandó una imagen que no se pudo abrir] ${m.texto || ''}`.trim();
    }
  }

  let respuesta;
  try {
    respuesta = await responder({
      historial: hist, nombreCliente: chat.nombre, imagenes,
      onEscalar: async ({ urgencia = 'normal', motivo = 'Requiere atención', resumen = '' }) => {
        await db.guardarChat(wa_id, { necesita_humano: true, urgencia, motivo_escalado: motivo, escalado_at: ahoraISO() });
        await db.guardarMensaje({ wa_id, rol: 'sistema', texto: `Escalado (${urgencia}): ${motivo} — ${resumen}`, tipo: 'nota' });
        await avisarEquipo({ wa_id, nombre: chat.nombre, urgencia, motivo, resumen });
      },
    });
  } catch (e) {
    console.error('Error de la IA:', e.message);
    await db.guardarChat(wa_id, { necesita_humano: true, urgencia: 'normal', motivo_escalado: 'La IA falló al responder', escalado_at: ahoraISO() });
    respuesta = { texto: MENSAJE_RESPALDO, escalado: true };
  }

  if (!respuesta.texto) return { accion: 'sin_respuesta' };

  // Última verificación: si un humano contestó mientras la IA pensaba, no enviar
  if (!(await botPuedeResponder(await db.obtenerChat(wa_id)))) return { accion: 'humano_atiende' };

  const ids = await wa.enviarTexto(wa_id, respuesta.texto);
  await db.guardarMensaje({ wa_id, wa_message_id: ids[0] || null, rol: 'bot', texto: respuesta.texto, meta: { ids } });
  await db.guardarChat(wa_id, { ultimo_mensaje_at: ahoraISO(), ultimo_mensaje: respuesta.texto.slice(0, 200) });
  return { accion: 'respondido', escalado: respuesta.escalado, texto: respuesta.texto };
}

// ─── Una persona contestó desde la app WhatsApp Business (coexistencia) ───
export async function procesarEcoHumano(eco) {
  const wa_id = eco.to;
  if (!wa_id) return { accion: 'ignorado' };
  const extraido = extraerTexto(eco) || { texto: `[${eco.type}]`, tipo: eco.type };
  const { duplicado } = await db.guardarMensaje({
    wa_id, wa_message_id: eco.id, rol: 'humano', texto: extraido.texto, tipo: extraido.tipo,
  });
  if (duplicado) return { accion: 'duplicado' }; // era un mensaje que mandó el propio bot
  const pausa = new Date(Date.now() + CONFIG.HUMANO_PAUSA_HORAS * 3600 * 1000).toISOString();
  await db.guardarChat(wa_id, {
    modo: 'humano', pausado_hasta: pausa, necesita_humano: false, no_leidos: 0,
    ultimo_mensaje_at: ahoraISO(), ultimo_mensaje: (extraido.texto || '').slice(0, 200),
  });
  return { accion: 'bot_pausado', hasta: pausa };
}

// ─── Punto de entrada: recorre el payload completo de Meta ───
export async function procesarWebhook(payload) {
  const tareas = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry.changes || []) {
      const v = change.value || {};
      if (change.field === 'messages') {
        for (const msg of v.messages || []) {
          const contacto = (v.contacts || []).find(c => c.wa_id === msg.from) || v.contacts?.[0];
          tareas.push(procesarMensajeCliente(msg, contacto));
        }
        for (const st of v.statuses || []) {
          if (st.status === 'failed') console.warn('Mensaje no entregado a', st.recipient_id, JSON.stringify(st.errors || []));
        }
      } else if (change.field === 'smb_message_echoes') {
        for (const eco of v.message_echoes || []) tareas.push(procesarEcoHumano(eco));
      }
    }
  }
  const res = await Promise.allSettled(tareas);
  res.filter(r => r.status === 'rejected').forEach(r => console.error('Error procesando evento:', r.reason));
  return res.map(r => (r.status === 'fulfilled' ? r.value : { accion: 'error', error: String(r.reason?.message || r.reason) }));
}
