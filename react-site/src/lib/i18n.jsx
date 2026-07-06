import { createContext, useContext, useEffect, useState } from 'react'

import { en } from '@/content/en'
import { fr } from '@/content/fr'

const dictionaries = { en, fr }

const LanguageContext = createContext(null)

function detectLanguage() {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem('lang')
  if (stored === 'en' || stored === 'fr') return stored
  return window.navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLanguage)

  useEffect(() => {
    window.localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const value = { lang, setLang, t: dictionaries[lang] }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
