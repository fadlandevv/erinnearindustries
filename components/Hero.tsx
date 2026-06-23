'use client'
import { useLanguage } from '@/context/LanguageContext'

function renderTitle(title: string) {
  return title.split('\n').map((line, li) => {
    const parts = line.split(/(\*[^*]+\*)/g).map((part, pi) =>
      part.startsWith('*') && part.endsWith('*')
        ? <em key={pi}>{part.slice(1, -1)}</em>
        : part
    )
    return <span key={li}>{parts}{li === 0 && <br />}</span>
  })
}

export default function Hero() {
  const { t } = useLanguage()
  return (
    <section className="hero" id="home">
      <div className="hero-inner">
        <div className="hero-text">
          <h1 className="hero-title">
            {renderTitle(t.hero.title)}
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-ctas">
            <button className="btn-dark">
              <span>↗</span> {t.hero.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
