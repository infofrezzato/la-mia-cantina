/**
 * Netlify Edge Function — Proxy Perplexity API
 *
 * A differenza delle Serverless Functions (timeout 10s),
 * le Edge Functions non hanno limite di tempo per le chiamate di rete.
 * Girano su Deno Deploy (V8 Isolates) — nessun timeout problematico.
 */
export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Chiave Perplexity non configurata sul server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Body non valido' }), { status: 400 }); }

  try {
    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify(body)
    });

    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Errore proxy: ${err.message}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/api/perplexity' };
