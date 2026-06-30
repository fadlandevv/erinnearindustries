'use client'
import Link from 'next/link'

import { useLanguage } from '@/context/LanguageContext'
import type { ServiceItem } from '@/lib/data'

export default function Service({ services }: { services: ServiceItem[] }) {
  const { t } = useLanguage()

  return (
    <section className="service-section" id="service">
      <div className="service-inner">
        <div className="service-top">
          <div className="service-header">
            <h2>
              {(t as any).servicesSection.title.split('\n').map((line: string, i: number) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p>{(t as any).servicesSection.sub}</p>
          </div>
          <Link href="/service" className="btn-outline service-view-all-btn">View All Services →</Link>
        </div>
        <div className="service-grid">
          {services.map((s) => (
            <Link key={s.id} href={`/service/${s.id}`} className="service-card service-card-link">
              <div className="service-card-icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
              <span className="service-card-arrow">Lihat Detail →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
