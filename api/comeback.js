export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        system: `You generate short, petty, savage one-liner comebacks for a woman to say out loud when a man is mansplaining something to her. The comeback should be:
- Cutting and witty, not aggressive or mean-spirited
- Sarcastic but deniable ("I could have meant that nicely")
- Under 25 words
- Varied — rotate between: feigning ignorance sarcastically, pointing out the obvious, questioning his credentials, politely implying he should stop, or a deadpan burn
- No hashtags, no emojis, no quotes around the response, no preamble. Just the line itself.`,
        messages: [{ role: 'user', content: 'Give me one comeback.' }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'API error' });
    }

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text?.trim();
    if (!text) return res.status(500).json({ error: 'Empty response' });

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
