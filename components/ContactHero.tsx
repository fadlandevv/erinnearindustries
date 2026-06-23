'use client'
import { useLanguage } from '@/context/LanguageContext'

export default function ContactHero() {
  const { t } = useLanguage()
  const c = (t as any).contact
  return (
    <div className="page-hero">
      <div className="page-hero-inner">
        <h1 className="page-hero-title">
          {c.title.split('\n').map((line: string, i: number) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h1>
        <p className="page-hero-sub">{c.sub}</p>
      </div>
    </div>
  )
}
