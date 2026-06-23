'use client'
import { useLanguage } from '@/context/LanguageContext'

export default function Stats() {
  const { t } = useLanguage()
  const { items, heading, desc, about } = t.stats
  return (
    <section className="stats-section">
      <div className="stats-inner">
        <div className="stats-about">
          <div className="stats-about-content">
            <h3>{heading.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h3>
            <p>{desc}</p>
          </div>
          <div>
            <div className="stats-about-avatar" />
          </div>
        </div>
        <div className="stats-grid">
          {items.map((s) => (
            <div key={s.num} className="stat-card">
              <div className="stat-num">
                {s.num} <span className="stat-unit">{s.unit}</span>
              </div>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
