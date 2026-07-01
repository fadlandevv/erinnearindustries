import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServiceById, getServices } from '@/lib/data'

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ id: s.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const service = await getServiceById(id)
  if (!service) return {}
  return {
    title: service.title,
    description: service.desc,
    openGraph: {
      title: service.title,
      description: service.desc,
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = await getServiceById(id)
  if (!service) notFound()

  const allServices = (await getServices()).filter((s) => s.id !== service.id)

  return (
    <>
      {/* Back */}
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/service" className="svc-detail-back">
            ← Semua Layanan
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="svc-detail-hero">
        <div className="svc-detail-hero-inner">
          <div className="svc-detail-icon" dangerouslySetInnerHTML={{ __html: service.icon }} />
          <h1 className="svc-detail-title">{service.title}</h1>
          <p className="svc-detail-sub">{service.desc}</p>
        </div>
      </div>

      {/* Body */}
      <div className="svc-detail-body">
        <div className="svc-detail-body-inner">
          <div className="svc-detail-grid">

            {/* Long description */}
            {service.longDesc && (
              <div className="svc-detail-desc-col">
                <h2 className="svc-detail-section-title">Tentang Layanan Ini</h2>
                <p className="svc-detail-desc">{service.longDesc}</p>
                <Link href="/contact" className="btn-dark svc-detail-cta">
                  Diskusikan Proyek →
                </Link>
              </div>
            )}

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="svc-detail-features-col">
                <h2 className="svc-detail-section-title">Yang Termasuk</h2>
                <ul className="svc-detail-features">
                  {service.features.map((f, i) => (
                    <li key={i} className="svc-detail-feature-item">
                      <span className="svc-detail-feature-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* If neither field exists, show a simple CTA */}
            {!service.longDesc && !service.features?.length && (
              <div className="svc-detail-desc-col" style={{ gridColumn: '1 / -1' }}>
                <p className="svc-detail-desc" style={{ color: '#777' }}>
                  Hubungi kami untuk mendapatkan detail lengkap tentang layanan ini.
                </p>
                <Link href="/contact" className="btn-dark svc-detail-cta">
                  Hubungi Kami →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="cta-banner">
        <div className="cta-banner-inner">
          <h2>Siap memulai proyek {service.title}?</h2>
          <p>Ceritakan kebutuhan brand Anda — kami siapkan proposal dalam 48 jam.</p>
          <Link href="/contact" className="btn-dark" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>
            Hubungi Kami →
          </Link>
        </div>
      </div>

      {/* Other services */}
      {allServices.length > 0 && (
        <div className="svc-detail-others">
          <div className="svc-detail-others-inner">
            <h3 className="svc-detail-others-title">Layanan Lainnya</h3>
            <div className="svc-detail-others-grid">
              {allServices.slice(0, 3).map((s) => (
                <Link key={s.id} href={`/service/${s.id}`} className="svc-detail-other-card">
                  <div className="svc-detail-other-icon" dangerouslySetInnerHTML={{ __html: s.icon }} />
                  <div>
                    <div className="svc-detail-other-title">{s.title}</div>
                    <div className="svc-detail-other-desc">{s.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
