/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_OPENAI_BASE_URL?: string
  readonly VITE_OPENAI_MODEL?: string
  readonly VITE_GEMINI_API_KEY?: string
  readonly VITE_GEMINI_MODEL?: string
  readonly VITE_GLM_API_KEY?: string
  readonly VITE_GLM_BASE_URL?: string
  readonly VITE_GLM_MODEL?: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
