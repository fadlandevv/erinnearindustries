import type { Metadata } from 'next'
import Link from 'next/link'
import { getCustomProducts } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Custom Design — Erinnear Industries',
  description: 'Buat produk custom sesuai keinginanmu — kaos, totebag, hoodie, jersey, dan lainnya.',
}

export default async function CustomPage() {
  const products = (await getCustomProducts()).filter(p => p.active)

  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/" className="svc-detail-back">← Beranda</Link>
        </div>
      </div>

      <section className="custom-hero">
        <div className="custom-hero-inner">
          <h1 className="custom-hero-title">Pilih Produk Custom</h1>
          <p className="custom-hero-sub">
            Pilih jenis produk yang ingin kamu desain. Minimum 24 pcs.
          </p>
        </div>
      </section>

      <section className="custom-pick-section">
        <div className="custom-pick-inner">
          <div className="custom-pick-grid">
            {products.map(p => (
              <Link
                key={p.id}
                href={p.href}
                className="custom-pick-card"
                style={p.image
                  ? { backgroundImage: `url(${p.image})` }
                  : { background: p.bg }
                }
              >
                <div className="custom-pick-card-top">
                  {p.iconSvg && (
                    <div className="custom-pick-circle">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        dangerouslySetInnerHTML={{ __html: p.iconSvg }}
                      />
                    </div>
                  )}
                </div>
                <div className="custom-pick-card-bot">
                  <p className="custom-pick-name">{p.name}</p>
                  <div className="custom-pick-desc-row">
                    <p className="custom-pick-desc">{p.descShort}</p>
                    <span className="custom-pick-arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
