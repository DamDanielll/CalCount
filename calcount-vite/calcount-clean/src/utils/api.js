export async function scanLabel(dataUrl, apiKey) {
  const base64 = dataUrl.split(',')[1];
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
            },
            {
              type: 'text',
              text: `This is a nutrition label photo. Extract nutrition facts and return ONLY a valid JSON object with exactly these fields (numbers only, no units in values):
{
  "name": "product name if visible on label, else 'Scanned Item'",
  "calories": <number per serving>,
  "protein": <grams per serving>,
  "carbs": <grams total carbohydrates per serving>,
  "fat": <grams total fat per serving>,
  "fiber": <grams dietary fiber per serving>,
  "servingSize": "<serving description e.g. '1 cup (240g)'>",
  "servingGrams": <numeric grams of one serving, or null if not found>,
  "per100g": {
    "calories": <kcal per 100g, or null if not on label>,
    "protein": <g per 100g, or null>,
    "carbs": <g per 100g, or null>,
    "fat": <g per 100g, or null>,
    "fiber": <g per 100g, or null>
  }
}
Use 0 for any macro field not found. Return ONLY the JSON, no markdown, no backticks, no explanation.`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.content.map((b) => b.text || '').join('').trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

export async function estimateNutrition(description, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are a nutrition expert. Estimate the nutritional content for the following food description. Use your knowledge of standard nutrition databases (USDA, etc) to give the best possible estimate.

Food description: "${description}"

Return ONLY a valid JSON object with no markdown, no backticks, no explanation:
{
  "name": "<short clean food name, max 4 words>",
  "calories": <estimated kcal as integer>,
  "protein": <estimated grams as decimal>,
  "carbs": <estimated total carbs grams as decimal>,
  "fat": <estimated total fat grams as decimal>,
  "fiber": <estimated fiber grams as decimal>,
  "confidence": "<high|medium|low>",
  "note": "<one short sentence explaining your estimate or any assumptions, max 12 words>"
}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.content.map((b) => b.text || '').join('').trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
