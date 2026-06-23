'use client'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { ServiceItem } from '@/lib/data'

export default function ServicePageClient({ services }: { services: ServiceItem[] }) {
  const { t } = useLanguage()
  const sp = t.servicePage

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">
            {sp.title.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
          <p className="page-hero-sub">{sp.sub}</p>
        </div>
      </div>

      <div className="service-page-section">
        <div className="service-page-inner">
          <div className="service-page-grid">
            {services.map((s) => (
              <Link key={s.id} href={`/service/${s.id}`} className="service-card service-card-link">
                <div className="service-card-icon">{s.icon}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <span className="service-card-arrow">→</span>
              </Link>
            ))}
          </div>

          <div className="process-section">
            <div className="process-inner">
              <div className="process-header">
                <h2>{sp.processTitle}</h2>
              </div>
              <div className="process-steps">
                {sp.steps.map((step) => (
                  <div key={step.num} className="process-step">
                    <span className="process-step-num">{step.num}</span>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
