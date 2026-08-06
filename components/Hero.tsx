'use client'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

// Ganti path ini untuk mengubah gambar banner homepage.
const BANNER_IMAGE = '/gallery/slot-4.webp'

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
      <div className="hero-media">
        <Image
          src={BANNER_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-scrim" />
      </div>

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

      <a href="#showcase" className="hero-scroll-cue" aria-label="Scroll ke bawah">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
        </svg>
      </a>
    </section>
  )
}
