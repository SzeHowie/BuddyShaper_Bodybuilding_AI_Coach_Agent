/**
 * Env read template for BuddyShaper.
 *
 * Setup:
 * 1. Copy `.env.example` → `.env.local`
 * 2. Fill keys in `.env.local` (never commit it)
 * 3. Restart `npm run dev` after changing env files
 *
 * Note: `VITE_*` values are embedded in the browser bundle.
 * For a public release, call your own backend instead of shipping keys.
 */

export type AiProvider = 'openai' | 'gemini' | 'glm' | 'none'

function read(name: keyof ImportMetaEnv, fallback = ''): string {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : fallback
}

const providerRaw = read('VITE_AI_PROVIDER', 'none').toLowerCase()

export const env = {
  aiProvider: (
    providerRaw === 'openai' || providerRaw === 'gemini' || providerRaw === 'glm'
      ? providerRaw
      : 'none'
  ) as AiProvider,

  openai: {
    apiKey: read('VITE_OPENAI_API_KEY'),
    baseUrl: read('VITE_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    model: read('VITE_OPENAI_MODEL', 'gpt-4o-mini'),
  },

  gemini: {
    apiKey: read('VITE_GEMINI_API_KEY'),
    model: read('VITE_GEMINI_MODEL', 'gemini-2.0-flash'),
  },

  glm: {
    apiKey: read('VITE_GLM_API_KEY'),
    baseUrl: read('VITE_GLM_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4'),
    model: read('VITE_GLM_MODEL', 'glm-4.1v-thinking-flash'),
  },

  /** Optional proxy / your server — preferred for real keys */
  apiBaseUrl: read('VITE_API_BASE_URL'),
} as const

/** True when a client-side provider key is present (demo only). */
export function hasClientAiKey(): boolean {
  if (env.aiProvider === 'openai') return Boolean(env.openai.apiKey)
  if (env.aiProvider === 'gemini') return Boolean(env.gemini.apiKey)
  if (env.aiProvider === 'glm') return Boolean(env.glm.apiKey)
  return Boolean(env.apiBaseUrl)
}

/**
 * Example: build OpenAI chat headers.
 * Do not call this from shared UI until you intentionally wire the API.
 */
export function openaiHeaders(): HeadersInit {
  if (!env.openai.apiKey) {
    throw new Error('Missing VITE_OPENAI_API_KEY in .env.local')
  }
  return {
    Authorization: `Bearer ${env.openai.apiKey}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Example: Gemini generateContent URL.
 */
export function geminiGenerateUrl(): string {
  if (!env.gemini.apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env.local')
  }
  const model = encodeURIComponent(env.gemini.model)
  const key = encodeURIComponent(env.gemini.apiKey)
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
}

/**
 * Example: GLM (Zhipu) chat/completions URL + headers.
 * Website for keys: https://bigmodel.cn/apikey/platform
 * API base for code: https://open.bigmodel.cn/api/paas/v4
 *
 * In Vite dev we call a same-origin proxy (`/api/glm`) to avoid browser CORS
 * ("Load failed" in Safari when fetching open.bigmodel.cn directly).
 */
export function glmChatCompletionsUrl(): string {
  if (import.meta.env.DEV) {
    return '/api/glm/chat/completions'
  }
  const base = env.glm.baseUrl.replace(/\/$/, '')
  return `${base}/chat/completions`
}

export function glmHeaders(): HeadersInit {
  if (!env.glm.apiKey) {
    throw new Error('Missing VITE_GLM_API_KEY in .env.local')
  }
  return {
    Authorization: `Bearer ${env.glm.apiKey}`,
    'Content-Type': 'application/json',
  }
}
