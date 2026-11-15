// WEBHOOK DE WHATSAPP → https://www.barrioinn.com/api/whatsapp
import { waitUntil } from '@vercel/functions';
import { CONFIG } from './_lib/config.js';
import { firmaValida } from './_lib/whatsapp.js';
import { procesarWebhook } from './_lib/procesar.js';

export function GET(request) {
  const u = new URL(request.url);
  const mode = u.searchParams.get('hub.mode');
  const token = u.searchParams.get('hub.verify_token');
  const challenge = u.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token && token === CONFIG.WA_VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(request) {
  if (CONFIG.WEBHOOK_KEY && new URL(request.url).searchParams.get('k') !== CONFIG.WEBHOOK_KEY) {
    return new Response('Forbidden', { status: 403 });
  }
  const raw = await request.text();
  if (!firmaValida(raw, request.headers.get('x-hub-signature-256'))) {
    return new Response('Firma inválida', { status: 401 });
  }
  let payload;
  try { payload = JSON.parse(raw); } catch { return new Response('JSON inválido', { status: 400 }); }

  const trabajo = procesarWebhook(payload).catch(e => console.error('Webhook:', e));
  waitUntil(trabajo);
  return new Response('OK', { status: 200 });
}
