'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lang, TranslationShape } from '@/lib/translations'
import { translations } from '@/lib/translations'
import type { ContentData } from '@/lib/data'

type LanguageContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: TranslationShape & { contact: { badge: string; title: string; sub: string } }
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'id',
  setLang: () => {},
  t: translations['id'] as any,
})

function merge(base: TranslationShape, cms: ContentData[Lang]): LanguageContextValue['t'] {
  return {
    ...base,
    hero: { ...base.hero, ...(cms.hero ?? {}) },
    stats: {
      ...base.stats,
      heading: cms.stats?.heading ?? base.stats.heading,
      desc: cms.stats?.desc ?? base.stats.desc,
      items: cms.stats?.items ?? base.stats.items,
    },
    featuredProducts: { ...base.featuredProducts, ...(cms.featuredProducts ?? {}) },
    servicesSection: { ...(base as any).servicesSection, ...(cms.servicesSection ?? {}) },
    productPage: { ...base.productPage, ...(cms.productPage ?? {}) },
    servicePage: {
      ...base.servicePage,
      badge: cms.servicePage?.badge ?? base.servicePage.badge,
      title: cms.servicePage?.title ?? base.servicePage.title,
      sub: cms.servicePage?.sub ?? base.servicePage.sub,
      processTitle: cms.servicePage?.processTitle ?? base.servicePage.processTitle,
      steps: cms.servicePage?.steps ?? base.servicePage.steps,
    },
    contact: {
      badge: cms.contact?.badge ?? (base as any).contact?.badge ?? '',
      title: cms.contact?.title ?? (base as any).contact?.title ?? '',
      sub: cms.contact?.sub ?? (base as any).contact?.sub ?? '',
    },
  } as any
}

export function LanguageProvider({
  children,
  cmsContent,
}: {
  children: ReactNode
  cmsContent?: ContentData
}) {
  const [lang, setLangState] = useState<Lang>('id')

  useEffect(() => {
    const savedLang = localStorage.getItem('ei-lang') as Lang | null
    if (savedLang === 'id' || savedLang === 'en') setLangState(savedLang)
  }, [])

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('ei-lang', l) }

  const t = cmsContent
    ? merge(translations[lang], cmsContent[lang])
    : (translations[lang] as any)

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
