// ═══════════════════════════════════════════════════════════════════
// AGENTE IA (Claude) — decide qué contestar y cuándo pasar a un humano
// ═══════════════════════════════════════════════════════════════════
import { CONFIG, esHorarioOficina, ahoraMonterrey } from './config.js';
import { EDIFICIOS, textoConocimiento, idEdificio, buscarUnidad, linkDirectBook, linkAirbnb, repartirHabitaciones } from './conocimiento.js';

const INSTRUCCIONES = `
Eres parte del equipo de Barrio Inn y atiendes su WhatsApp. Barrio Inn es un hospedaje boutique en Monterrey con 5 edificios.
Tu objetivo: que cada persona encuentre el lugar ideal y RESERVE, y que todo huésped se sienta bien atendido a cualquier hora.

## Cómo escribes (MUY IMPORTANTE)
- Como una persona real del equipo escribiendo por WhatsApp: cálido, cercano, amable y natural. De "tú". Español de México.
- Nada de frases de robot: no digas "soy un asistente virtual", "¿en qué más puedo ayudarte hoy?", "Opción 1/Opción 2", "como modelo de lenguaje", ni listas largas tipo menú.
- Mensajes cortos: normalmente 1 a 4 líneas. Si das varias opciones, máximo 3, cada una en una línea.
- Formato WhatsApp: *negritas* con un solo asterisco, sin #, sin tablas, sin markdown de links (pega el link tal cual).
- Máximo 1 emoji por mensaje y solo si suma (😊 🙌 🏡 ✨).
- Si te escriben en inglés u otro idioma, contesta en ese idioma con el mismo tono.
- Saluda por su nombre si lo sabes, solo al inicio.
- Si alguien te pregunta directo y en serio si eres un bot o una persona, no lo niegues: di con naturalidad que eres el asistente de Barrio Inn y que el equipo está en este mismo chat por si lo necesita. Fuera de eso, nunca hables de ti.

## Eres el mejor vendedor
- Haz 1 pregunta a la vez para entender: cuántas personas, qué fechas, qué busca (precio, baño privado, trabajar, pareja, alberca, mes completo...).
- Recomienda 1 a 3 opciones concretas y di POR QUÉ le conviene cada una (resalta lo mejor: ubicación, calificaciones altas, "Favorito entre huéspedes", baño privado, alberca, escritorio y WiFi rápido, cocina propia, todo incluido en Roma).
- Cierra SIEMPRE con el siguiente paso claro y el link para reservar. Si ya dio fechas y personas, usa la herramienta link_reserva para mandar el link con todo listo.
- Habla solo de lo bueno. No menciones quejas, problemas de reseñas ni defectos por tu cuenta.
- Si preguntan algo directo (¿tiene ventana?, ¿tiene refri?, ¿baño privado?), responde con la verdad del anuncio en tono positivo y, si no lo tiene, ofrece al momento la opción que sí lo tiene. Nunca prometas algo que el anuncio no dice.
- Si un edificio no tiene disponibilidad, ofrece otro cercano: Morelos, Hostal, Padre Mier y Abasolo están a pocas cuadras entre sí.
- Precios: no inventes. En los de noche, el precio exacto sale al poner fechas en el link (puedes dar la referencia de Padre Mier si ayuda). En Roma sí das la renta mensual publicada.

## Links (cada edificio tiene su propio sistema)
- Morelos → motor direct-book. Hostal y Abasolo → Airbnb (un link por habitación). Padre Mier → Cloudbeds (un solo link para todo el edificio; ahí eligen habitación). Roma → Belong.
- Usa SOLO links del conocimiento o los que devuelve la herramienta link_reserva. Nunca inventes ni modifiques un link.
- Explica brevemente cómo reservar en ese sistema si la persona parece no saber (sin fechas no salen precios; en Belong se crea cuenta y se agenda visita gratis; etc.).
- Fechas relativas ("este viernes", "del 20 al 22") se interpretan con la fecha actual de Monterrey; si el mes o año no es claro, confírmalo.

## Lo que no sabes o no te toca decidir → el dueño
- Si no sabes algo, o es una excepción (descuentos, early check-in, mascotas en edificios de noche, estancias cortas en Roma, unidades de Roma sin link, plazos, grupos grandes, casos especiales de factura, cambios o reembolsos), di con amabilidad algo como: "Eso lo platicas directo con el dueño; ya le avisé y te escribe aquí mismo 😊" y usa escalar_a_humano.
- Nunca inventes datos, políticas, direcciones exactas ni disponibilidad.

## Si piden hablar con una persona
- Responde algo como: "¡Claro! Ya le avisé al equipo. Una persona te va a escribir aquí mismo, en este chat; no necesitas llamar ni escribir a otro número." y usa escalar_a_humano (normal). Mientras tanto, si puedes ayudar en algo, ofrécelo sin presionar.

## Urgencias de huéspedes (usa escalar_a_humano con urgencia "urgente")
- No puede entrar, el código o la chapa no funcionan, se quedó afuera, seguridad, fuga, sin agua o luz, algo roto, ruido grave. Emergencia médica o de seguridad: que llame al 911 de inmediato.
- Si no puede entrar, mientras escalas ayúdale: 1) que revise el mensaje con instrucciones (Airbnb las manda ~2 pm del día de llegada); 2) que confirme que está en la dirección y puerta correctas (en el Hostal la entrada es por la Fonda Morelos); 3) en chapas digitales: tocar la pantalla, teclear el código completo despacio y luego ✓ o #. Dile que el equipo ya fue avisado.

## Otros
- No pidas ni recibas datos de tarjeta por WhatsApp: el pago es siempre en la página segura del sistema de reserva.
- No compartas códigos de acceso (no los tienes) ni datos de otros huéspedes.
- Solo temas de Barrio Inn y la estancia (incluye recomendar lugares de la zona, cómo llegar, qué hacer). Si piden algo ajeno (tareas, código, otros temas), declina con amabilidad en una línea y regresa a su estancia.
- Si alguien pide que no le escriban más, respétalo.
- Mensajes marcados [Respondió una persona del equipo] los escribió un humano de Barrio Inn: sé coherente con lo que dijo.
- Si mandan una imagen, úsala si ayuda (captura de un error, foto de la chapa, etc.).
`.trim();

const HERRAMIENTAS = [
  {
    name: 'link_reserva',
    description: 'Arma el link correcto para reservar según el edificio y su sistema (direct-book, Airbnb, Cloudbeds o Belong). Si das fechas y personas, el link ya va con todo listo cuando el sistema lo permite. Para Airbnb (Hostal, Abasolo) y Roma indica la unidad.',
    input_schema: {
      type: 'object',
      properties: {
        edificio: { type: 'string', enum: Object.keys(EDIFICIOS), description: 'id del edificio' },
        unidad: { type: 'string', description: 'Número de la unidad, p. ej. "13", "2", "1A". Obligatorio para hostal, abasolo y roma.' },
        check_in: { type: 'string', description: 'Fecha de llegada AAAA-MM-DD' },
        check_out: { type: 'string', description: 'Fecha de salida AAAA-MM-DD' },
        adultos: { type: 'integer', minimum: 1, maximum: 12, description: '13 años o más' },
        ninos: { type: 'integer', minimum: 0, maximum: 8, description: 'De 2 a 12 años' },
        bebes: { type: 'integer', minimum: 0, maximum: 4, description: 'Menores de 2 años' },
      },
      required: ['edificio'],
    },
  },
  {
    name: 'escalar_a_humano',
    description: 'Avisa al dueño / equipo de Barrio Inn que esta conversación necesita a una persona (responderá en este mismo chat). Úsala en urgencias, cuando piden hablar con alguien, excepciones, cotizaciones, cambios, reembolsos o cualquier cosa que no sepas.',
    input_schema: {
      type: 'object',
      properties: {
        urgencia: { type: 'string', enum: ['urgente', 'normal'], description: 'urgente = huésped afectado ahora mismo (no puede entrar, seguridad, daño, emergencia).' },
        motivo: { type: 'string', description: 'Motivo corto, p. ej. "No puede entrar - Hostal #13" o "Quiere Roma 2B, sin link".' },
        resumen: { type: 'string', description: 'Resumen para el equipo: quién es, qué edificio/unidad, fechas, qué pidió y qué ya se intentó.' },
      },
      required: ['urgencia', 'motivo', 'resumen'],
    },
  },
];

async function llamarClaude({ system, messages }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CONFIG.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: CONFIG.CLAUDE_MODEL, max_tokens: 900, system, tools: HERRAMIENTAS, messages }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Claude ${res.status}: ${json?.error?.message || JSON.stringify(json)}`);
  return json;
}

// Convierte el historial guardado en mensajes para Claude (alternando user/assistant)
export function armarMensajes(historial, imagenes = {}) {
  const msgs = [];
  for (const m of historial) {
    if (m.rol === 'sistema') continue;
    const role = m.rol === 'cliente' ? 'user' : 'assistant';
    let bloques;
    if (m.rol === 'humano') {
      bloques = [{ type: 'text', text: `[Respondió una persona del equipo]: ${m.texto}` }];
    } else if (m.rol === 'cliente' && imagenes[m.id]) {
      const img = imagenes[m.id];
      bloques = [
        { type: 'image', source: { type: 'base64', media_type: img.mime, data: img.base64 } },
        { type: 'text', text: m.texto || '(El cliente mandó esta imagen)' },
      ];
    } else {
      bloques = [{ type: 'text', text: m.texto || '(mensaje vacío)' }];
    }
    const ultimo = msgs[msgs.length - 1];
    if (ultimo && ultimo.role === role) ultimo.content.push(...bloques);
    else msgs.push({ role, content: bloques });
  }
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  return msgs;
}

// WhatsApp usa *un* asterisco para negritas; limpiamos markdown que se cuele
export function formatoWhatsApp(t) {
  return String(t)
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1: $2')
    .trim();
}

const hoyMonterrey = () => new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.TZ }).format(new Date()); // AAAA-MM-DD

const esFecha = f => /^\d{4}-\d{2}-\d{2}$/.test(f || '') && !isNaN(new Date(f + 'T12:00:00Z'));

export function herramientaLink({ edificio, unidad, check_in, check_out, adultos, ninos, bebes }) {
  const id = idEdificio(edificio);
  if (!id) return `No reconozco ese edificio. Opciones: ${Object.keys(EDIFICIOS).join(', ')}.`;
  const e = EDIFICIOS[id];

  // Validación de fechas (si vienen)
  let fechas = null;
  if (check_in || check_out) {
    if (!esFecha(check_in) || !esFecha(check_out)) return 'Fechas inválidas: usa AAAA-MM-DD en check_in y check_out, o pregunta las fechas al cliente.';
    if (check_in < hoyMonterrey()) return `La llegada ${check_in} ya pasó (hoy es ${hoyMonterrey()}). Confirma las fechas con el cliente.`;
    const noches = Math.round((new Date(check_out) - new Date(check_in)) / 86400000);
    if (noches < 1) return 'La salida debe ser al menos un día después de la llegada.';
    fechas = { checkIn: check_in, checkOut: check_out, noches };
  }
  const a = Math.max(1, Math.min(12, Number(adultos) || (id === 'morelos' ? 2 : 1)));
  const n = Math.max(0, Math.min(8, Number(ninos) || 0));
  const b = Math.max(0, Math.min(4, Number(bebes) || 0));
  const quien = `${a} adulto${a > 1 ? 's' : ''}${n ? `, ${n} niño${n > 1 ? 's' : ''}` : ''}${b ? `, ${b} bebé${b > 1 ? 's' : ''}` : ''}`;
  const noch = fechas ? `${fechas.noches} noche${fechas.noches > 1 ? 's' : ''}, ` : '';

  if (e.sistema === 'directbook') {
    if (n > a) return 'Hay más niños que adultos: cada habitación necesita al menos un adulto. Confírmalo con el cliente o escala.';
    const url = linkDirectBook(e.slug, fechas ? { ...fechas, adultos: a, ninos: n, bebes: b } : {});
    if (!fechas) return `Link de ${e.nombre} (sin fechas; al abrirlo eligen fechas y huéspedes): ${url}`;
    const habs = repartirHabitaciones(a, n);
    const rep = habs.length > 1 ? ` Ya va armado con ${habs.length} habitaciones (máx. 2 personas por habitación).` : '';
    return `Link de ${e.nombre} (${noch}${quien}) con fechas listas, ahí ve precio y disponibilidad reales: ${url}${rep}`;
  }

  if (e.sistema === 'cloudbeds') {
    const cap = fechas ? ` Dile que ponga ${fechas.checkIn} → ${fechas.checkOut} y ${quien} y le dé Buscar.` : ' Dile que ponga sus fechas y huéspedes y le dé Buscar.';
    return `Link de ${e.nombre} (un solo link para todas las habitaciones; ahí elige la suya): ${e.link}.${cap}`;
  }

  // Airbnb y Belong requieren unidad
  const u = buscarUnidad(id, unidad);
  if (!u) {
    const lista = e.unidades.map(x => x.n).join(', ');
    return `Indica la unidad de ${e.nombre}. Disponibles en el catálogo: ${lista}.`;
  }

  if (e.sistema === 'airbnb') {
    if (a + n > u.personas) return `${u.nombre} es para ${u.personas} persona${u.personas > 1 ? 's' : ''}. Para ${a + n} personas sugiere otra unidad o varias.`;
    const url = linkAirbnb(u.airbnb, fechas ? { ...fechas, adultos: a, ninos: n, bebes: b } : {});
    return `Link de ${u.nombre} en Airbnb${fechas ? ` (${noch}${quien}, con fechas listas)` : ''}: ${url}`;
  }

  if (e.sistema === 'belong') {
    if (!u.belong) return `${u.nombre} no tiene link publicado en Belong. Dile que esa unidad la ve directo con el dueño y usa escalar_a_humano (normal) con su interés.`;
    return `Link de ${u.nombre} en Belong (renta ${'$' + u.renta.toLocaleString('en-US')} MXN/mes; ahí puede agendar visita gratis o mandar mensaje): ${u.belong}`;
  }
  return 'Sistema no soportado.';
}

/**
 * Genera la respuesta del bot.
 * @param historial  mensajes guardados del chat
 * @param onEscalar  async ({urgencia,motivo,resumen}) => void
 * @returns { texto, escalado }
 */
export async function responder({ historial, nombreCliente, imagenes = {}, onEscalar }) {
  const enOficina = esHorarioOficina();
  const contexto = `Fecha y hora actual en Monterrey: ${ahoraMonterrey()}. ` +
    (enOficina
      ? 'El equipo SÍ está en horario ahora: si escalas, dile que una persona le escribe en breve aquí mismo.'
      : 'El equipo NO está en horario ahora (lun–vie 11:00–18:00): si escalas algo normal, dile con calidez que el dueño/equipo le escribe aquí mismo en cuanto esté disponible; si es urgente, que ya avisaste al equipo de guardia.') +
    (nombreCliente ? ` El cliente aparece en WhatsApp como "${nombreCliente}".` : '');

  // El bloque grande (instrucciones + info + catálogo) se cachea en Anthropic → más barato y rápido
  const system = [
    { type: 'text', text: `${INSTRUCCIONES}\n\n${textoConocimiento()}`, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: contexto },
  ];

  const messages = armarMensajes(historial, imagenes);
  if (!messages.length) return { texto: '', escalado: false };

  let escalado = false;
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    const r = await llamarClaude({ system, messages });
    const usos = (r.content || []).filter(b => b.type === 'tool_use');
    if (r.stop_reason !== 'tool_use' || !usos.length) {
      const texto = (r.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
      return { texto: formatoWhatsApp(texto), escalado };
    }
    messages.push({ role: 'assistant', content: r.content });
    const resultados = [];
    for (const uso of usos) {
      let contenido = 'Herramienta desconocida.';
      if (uso.name === 'link_reserva') {
        contenido = herramientaLink(uso.input || {});
      } else if (uso.name === 'escalar_a_humano') {
        try {
          await onEscalar?.(uso.input || {});
          escalado = true;
          contenido = enOficina
            ? 'Listo: el equipo ya fue avisado y está en horario. Dile al cliente que una persona le escribe en breve aquí mismo, en este chat.'
            : (uso.input?.urgencia === 'urgente'
              ? 'Listo: se avisó al equipo de guardia como URGENTE. Dile que ya avisaste y que le escriben aquí mismo lo antes posible; mientras, sigue ayudando.'
              : 'Listo: quedó avisado. Dile que el dueño/equipo le escribe aquí mismo en cuanto esté disponible (horario lun–vie 11:00–18:00) y sigue ayudando en lo que puedas.');
        } catch (e) {
          contenido = `No se pudo avisar al equipo (${e.message}). Dile con amabilidad que el equipo revisará este chat lo antes posible.`;
        }
      }
      resultados.push({ type: 'tool_result', tool_use_id: uso.id, content: contenido });
    }
    messages.push({ role: 'user', content: resultados });
  }
  return { texto: '¡Gracias por escribirnos! Una persona del equipo te va a contestar aquí mismo en un momento 🙏', escalado };
}
