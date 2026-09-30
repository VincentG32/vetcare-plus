import type { APIRoute } from 'astro';

// Relais entre le widget de chat et l'assistant n8n.
// Il ajoute l'adresse du visiteur (fournie par Vercel, non falsifiable par le navigateur)
// pour que n8n applique les limites de la demo par visiteur : 15 messages/heure, 30/jour.
// Les limites elles-memes (et le plafond global, la date de fin, la longueur max) vivent dans n8n.
export const prerender = false;

const N8N_CHAT = 'https://n8n-bbs9.vincentg-ia.cloud/webhook/beec9f62-2a90-4c5f-9b33-c216fb162cfd/chat';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return json({ output: 'Requête invalide.' }, 400);
  }

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip') || clientAddress || 'inconnu';
  body.metadata = { ...(body.metadata ?? {}), client_ip: ip };

  try {
    const res = await fetch(N8N_CHAT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return json({ output: 'L’assistant est momentanément indisponible. Réessayez dans un instant.' }, 502);
  }
};
