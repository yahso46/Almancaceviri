// Vercel serverless function: Almanca -> Türkçe çeviri, DeepSeek üzerinden.
// API anahtarı yalnızca sunucuda durur: Vercel > Settings > Environment Variables > DEEPSEEK_API_KEY

const API_URL = "https://api.deepseek.com/chat/completions";

function buildPrompt(body) {
  if (body.mode === "words") {
    const words = (Array.isArray(body.words) ? body.words : [])
      .filter((w) => typeof w === "string" && w.length > 0 && w.length <= 40)
      .slice(0, 25);
    if (!words.length) return null;
    return (
      "For each German word, give its most common Turkish meaning (max 3 words). " +
      'Return JSON exactly like {"meanings":{"<german word as given>":"<turkish meaning>"}}. Words: ' +
      JSON.stringify(words)
    );
  }
  if (body.mode === "sentence") {
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text || text.length > 400) return null;
    return (
      "Translate this German sentence into natural Turkish and give the meaning of each word as used in this sentence. " +
      'Return JSON exactly like {"translation":"<turkish>","words":[{"de":"<german word>","tr":"<meaning in this sentence, max 3 words>"}]}. ' +
      "List the words in sentence order. Sentence: " +
      JSON.stringify(text)
    );
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return res.status(500).json({ error: "no_key" });

  // Başka sitelerin bu uç noktayı kullanmasını engelle.
  const origin = req.headers.origin;
  if (origin) {
    let ok = false;
    try { ok = new URL(origin).host === req.headers.host; } catch (e) { ok = false; }
    if (!ok) return res.status(403).json({ error: "forbidden" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const prompt = buildPrompt(body);
  if (!prompt) return res.status(400).json({ error: "bad_request" });

  try {
    const r = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a precise German-Turkish translator. Reply with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: "upstream", status: r.status });
    const data = await r.json();
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    let parsed;
    try { parsed = JSON.parse(content); } catch (e) { return res.status(502).json({ error: "bad_upstream_json" }); }
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(504).json({ error: "timeout_or_network" });
  }
};
