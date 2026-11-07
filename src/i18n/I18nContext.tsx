import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { t, type MessageKey } from './messages'
import { LANG_STORAGE, type Lang } from './types'

type I18nValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  tr: (key: MessageKey) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function loadLang(): Lang {
  try {
    const raw = localStorage.getItem(LANG_STORAGE)
    if (raw === 'zh' || raw === 'en') return raw
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en'
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang())

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en'
  }, [lang])

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next)
        localStorage.setItem(LANG_STORAGE, next)
      },
      tr: (key) => t(lang, key),
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function LangSwitch() {
  const { lang, setLang, tr } = useI18n()
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === 'en' ? 'chip on' : 'chip'}
        onClick={() => setLang('en')}
      >
        {tr('langEn')}
      </button>
      <button
        type="button"
        className={lang === 'zh' ? 'chip on' : 'chip'}
        onClick={() => setLang('zh')}
      >
        {tr('langZh')}
      </button>
    </div>
  )
}
