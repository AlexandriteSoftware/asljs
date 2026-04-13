/**
 * AI generation module for ASLJS App Builder.
 *
 * Calls OpenAI directly from the browser using the user's own API key.
 * No server proxy is involved.
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert web app generator.
The user will describe a simple web app. You must respond with a JSON object only — no markdown, no explanation, just raw JSON.

The JSON must have this exact shape:
{
  "description": "one-sentence description of the app",
  "files": [
    { "name": "index.html", "content": "..." },
    { "name": "style.css",  "content": "..." },
    { "name": "app.js",     "content": "..." }
  ]
}

Rules:
- Always include index.html, style.css, and app.js.
- index.html must be a complete standalone HTML file that loads style.css and app.js.
- style.css and app.js must be valid CSS and JavaScript respectively.
- Do not use external CDNs or network resources.
- The app must work fully offline in a sandboxed iframe (allow-scripts only).
- Keep code concise and readable.
- Do not use ES modules (use regular script tags).`;

/**
 * @param {string} prompt - User's description of the app
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<{ description: string, files: Array<{name: string, content: string}> }>}
 */
export async function generateApp(
    prompt,
    apiKey
  ) {
  const response =
    await fetch(
      OPENAI_CHAT_URL,
      { method: 'POST',
        headers:
          { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(
          { model: 'gpt-4o-mini',
            temperature: 0.3,
            messages:
              [ { role: 'system',
                  content: SYSTEM_PROMPT },
                { role: 'user',
                  content: prompt } ] }) });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message
      ?? `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();

  const raw =
    data?.choices?.[0]?.message?.content ?? '';

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed?.files)) {
      throw new Error('Unexpected response shape from AI.');
    }

    return parsed;
  } catch {
    throw new Error(
      'AI returned an unexpected response format. Please try again.');
  }
}
