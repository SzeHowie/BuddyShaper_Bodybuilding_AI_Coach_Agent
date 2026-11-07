import { env, glmChatCompletionsUrl, glmHeaders } from '../config/env'
import type { Lang } from '../i18n/types'
import type { Profile } from '../types'
import { targets } from './macros'

/** Plain-text coaching reply from GLM (when provider is glm). */
export async function chatWithGlm(
  profile: Profile,
  userText: string,
  lang: Lang = 'en',
): Promise<string> {
  if (!env.glm.apiKey) {
    throw new Error('Missing VITE_GLM_API_KEY')
  }

  const t = targets(profile)
  const langLine =
    lang === 'zh'
      ? 'Always reply in Traditional Chinese (繁體中文).'
      : 'Always reply in English.'
  const system = `You are Gymergee（俊美雞）, BuddyShaper's friendly fitness coach.
User: ${profile.name}. Goal: ${profile.goal}. Daily target ~${t.kcal} kcal, ${t.protein}g protein.
Food notes: ${profile.diet || 'none'}.
Keep answers short, practical, and encouraging. Not medical advice.
${langLine}`

  const res = await fetch(glmChatCompletionsUrl(), {
    method: 'POST',
    headers: glmHeaders(),
    body: JSON.stringify({
      model: env.glm.model,
      temperature: 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userText },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`GLM chat failed (${res.status}): ${detail.slice(0, 240)}`)
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = payload.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('GLM returned an empty chat response')
  return content
}
