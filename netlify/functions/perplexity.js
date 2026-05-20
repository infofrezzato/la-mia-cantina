/**
 * Netlify Function — Proxy Perplexity API
 *
 * Riceve dal browser il body della richiesta (model, messages, …)
 * e la gira a Perplexity usando la chiave segreta PERPLEXITY_API_KEY
 * salvata come variabile d'ambiente Netlify (mai esposta al browser).
 */
exports.handler = async (event) => {
  /* Solo POST */
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Chiave Perplexity non configurata sul server. Imposta PERPLEXITY_API_KEY nelle variabili d\'ambiente Netlify.' })
    };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Body non valido' }) }; }

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
    return {
      statusCode: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: `Errore proxy Perplexity: ${err.message}` })
    };
  }
};
