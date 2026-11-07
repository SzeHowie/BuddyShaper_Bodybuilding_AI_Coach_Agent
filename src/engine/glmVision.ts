import { env, glmChatCompletionsUrl, glmHeaders } from '../config/env'
import type { Lang } from '../i18n/types'
import type { Food } from '../types'

type GlmGuess = {
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  portion: string
  confidence: number
}

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'food'
  )
}

function toFood(g: GlmGuess, index: number): Food {
  return {
    id: `glm-${slug(g.name)}-${index}`,
    name: g.name,
    aliases: [],
    kcal: Math.round(g.kcal),
    protein: Math.round(g.protein),
    carbs: Math.round(g.carbs),
    fat: Math.round(g.fat),
    portion: g.portion || '1 serving',
    grams: 200,
    hue: [0, 360],
    sat: [0, 1],
    light: [0, 1],
  }
}

async function fileOrUrlToDataUrl(source: File | string): Promise<string> {
  if (typeof source !== 'string') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Could not read image file'))
      reader.readAsDataURL(source)
    })
  }
  const res = await fetch(source)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image url'))
    reader.readAsDataURL(blob)
  })
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1))
    }
    throw new Error('GLM response was not valid JSON')
  }
}

/**
 * Call Zhipu GLM vision to identify a plate photo.
 * Requires VITE_AI_PROVIDER=glm and VITE_GLM_API_KEY.
 */
export async function identifyFoodWithGlm(
  image: File | string,
  lang: Lang = 'en',
): Promise<{ food: Food; score: number }[]> {
  if (!env.glm.apiKey) {
    throw new Error('Missing VITE_GLM_API_KEY')
  }

  const dataUrl = await fileOrUrlToDataUrl(image)

  const nameRule =
    lang === 'zh'
      ? 'Use Traditional Chinese food names in "name" and "portion" (e.g. "漢堡", "一份").'
      : 'Use English food names (e.g. "Hamburger", "1 burger").'

  const prompt = `You are a nutrition coach looking at a meal photo.
Identify the most likely foods on the plate.
Return ONLY valid JSON (no markdown) in this shape:
{
  "guesses": [
    {
      "name": "food name",
      "kcal": 500,
      "protein": 25,
      "carbs": 40,
      "fat": 20,
      "portion": "1 serving",
      "confidence": 0.9
    }
  ]
}
Give 1 to 3 guesses, best first. Be specific (not just "meat").
${nameRule}
kcal/protein/carbs/fat are estimates for the portion shown.`

  const res = await fetch(glmChatCompletionsUrl(), {
    method: 'POST',
    headers: glmHeaders(),
    body: JSON.stringify({
      model: env.glm.model,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`GLM vision failed (${res.status}): ${detail.slice(0, 240)}`)
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error('GLM returned an empty vision response')

  const parsed = extractJson(content) as { guesses?: GlmGuess[] }
  const guesses = Array.isArray(parsed.guesses) ? parsed.guesses : []
  if (!guesses.length) throw new Error('GLM returned no food guesses')

  return guesses.slice(0, 3).map((g, i) => ({
    food: toFood(
      {
        name: String(g.name || 'Unknown food'),
        kcal: Number(g.kcal) || 0,
        protein: Number(g.protein) || 0,
        carbs: Number(g.carbs) || 0,
        fat: Number(g.fat) || 0,
        portion: String(g.portion || '1 serving'),
        confidence: Number(g.confidence) || 0.5,
      },
      i,
    ),
    score: Math.round(Math.min(1, Math.max(0, Number(g.confidence) || 0.5)) * 100),
  }))
}
