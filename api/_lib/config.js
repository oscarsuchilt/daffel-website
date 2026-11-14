// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN — todo sale de variables de entorno de Vercel
// (Vercel → Project → Settings → Environment Variables)
// ═══════════════════════════════════════════════════════════════════

const env = (k, def = '') => (process.env[k] ?? def).toString().trim();
const num = (k, def) => {
  const v = Number(process.env[k]);
  return Number.isFinite(v) && process.env[k] !== '' && process.env[k] != null ? v : def;
};

export const CONFIG = {
  // ── WhatsApp ──
  // 'meta' = WhatsApp Cloud API directo · '360dialog' = vía 360dialog (BSP)
  WA_PROVIDER: env('WA_PROVIDER', 'meta'),
  WA_TOKEN: env('WA_TOKEN'),                    // Meta: token permanente del System User · 360dialog: D360-API-KEY
  WA_PHONE_NUMBER_ID: env('WA_PHONE_NUMBER_ID'), // solo Meta
  WA_VERIFY_TOKEN: env('WA_VERIFY_TOKEN'),       // texto que tú inventas para verificar el webhook
  META_APP_SECRET: env('META_APP_SECRET'),       // para validar la firma X-Hub-Signature-256 (recomendado)
  WEBHOOK_KEY: env('WEBHOOK_KEY'),               // opcional: clave en la URL (?k=...) — útil con 360dialog, que no firma
  GRAPH_VERSION: env('GRAPH_VERSION', 'v23.0'),

  // ── IA (Claude) ──
  ANTHROPIC_API_KEY: env('ANTHROPIC_API_KEY'),
  CLAUDE_MODEL: env('CLAUDE_MODEL', 'claude-sonnet-5-5'),

  // ── Supabase (llave service_role: SOLO en el servidor, nunca en el HTML) ──
  SUPABASE_URL: env('SUPABASE_URL', 'https://zwbvugshnjenrysqallo.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: env('SUPABASE_SERVICE_ROLE_KEY'),

  // ── Comportamiento del bot ──
  BOT_ACTIVO: env('BOT_ACTIVO', 'true') !== 'false',          // apagador general
  BOT_HORARIO: env('BOT_HORARIO', 'siempre'),                 // 'siempre' | 'fuera_de_oficina'
  HUMANO_PAUSA_HORAS: num('HUMANO_PAUSA_HORAS', 8),           // cuánto se calla el bot cuando un humano contesta
  DEBOUNCE_MS: num('DEBOUNCE_MS', 3000),                      // espera para juntar mensajes seguidos
  HISTORIAL_MENSAJES: num('HISTORIAL_MENSAJES', 24),

  // ── Avisos al equipo cuando el bot escala ──
  STAFF_NUMEROS: env('STAFF_NUMEROS').split(',').map(s => s.replace(/\D/g, '')).filter(Boolean),
  STAFF_TEMPLATE: env('STAFF_TEMPLATE'),            // nombre de plantilla aprobada (opcional, ver README)
  STAFF_TEMPLATE_LANG: env('STAFF_TEMPLATE_LANG', 'es_MX'),

  // ── Bandeja web ──
  ADMIN_TOKEN: env('ADMIN_TOKEN'),

  // ── Negocio ──
  TZ: 'America/Monterrey',
  SITIO: 'https://www.barrioinn.com',
};

// Horario de oficina: lun–vie 11:00–18:00 hora de Monterrey (igual que en index.html)
export function esHorarioOficina(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: CONFIG.TZ, weekday: 'short', hour: 'numeric', hour12: false,
  }).formatToParts(fecha);
  const dia = partes.find(p => p.type === 'weekday')?.value;
  const hora = Number(partes.find(p => p.type === 'hour')?.value) % 24;
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dia) && hora >= 11 && hora < 18;
}

export function ahoraMonterrey(fecha = new Date()) {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: CONFIG.TZ, weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(fecha);
}
