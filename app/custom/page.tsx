import type { Metadata } from 'next'
import Link from 'next/link'
import { getCustomProductImages } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Custom Design — Erinnear Industries',
  description: 'Buat produk custom sesuai keinginanmu — kaos, totebag, hoodie, jersey, dan lainnya.',
}

// desc: max 29 karakter (1 baris pada card, font 12px, lebar ~190px)
const PRODUCTS = [
  {
    id: 'tshirt',
    name: 'Kaos',
    sub: 'T-Shirt',
    desc: 'Sablon bebas depan & belakang',
    href: '/custom/tshirt',
    bg: '#f5ede0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
      </svg>
    ),
  },
  {
    id: 'totebag',
    name: 'Totebag',
    sub: 'Kanvas',
    desc: 'Sablon satu atau dua sisi',
    href: '/custom/totebag',
    bg: '#e4ede6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    id: 'amplop-packaging',
    name: 'Amplop',
    sub: 'Packaging',
    desc: 'Packaging berlogo produkmu',
    href: '/custom/amplop-packaging',
    bg: '#e0eaf5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    id: 'coach-jacket',
    name: 'Coach Jacket',
    sub: 'Jacket',
    desc: 'Jaket tipis sablon & bordir',
    href: '/custom/coach-jacket',
    bg: '#ede8f5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
        <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 2"/>
      </svg>
    ),
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    sub: 'Fleece',
    desc: 'Custom depan belakang lengan',
    href: '/custom/hoodie',
    bg: '#f5e6e9',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2c0 2.21-1.79 4-4 4S8 4.21 8 2L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
        <path d="M9 22v-3a3 3 0 016 0v3" strokeDasharray="2 1.5"/>
      </svg>
    ),
  },
  {
    id: 'jersey',
    name: 'Jersey',
    sub: 'Sublimasi',
    desc: 'Full-print sesuai desainmu',
    href: '/custom/jersey',
    bg: '#e8f0e4',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
        <line x1="6" y1="10" x2="6" y2="20"/>
        <line x1="18" y1="10" x2="18" y2="20"/>
      </svg>
    ),
  },
]

export default async function CustomPage() {
  const images = await getCustomProductImages()

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
            {PRODUCTS.map(p => (
              <Link
                key={p.id}
                href={p.href}
                className="custom-pick-card"
                style={images[p.id]
                  ? { backgroundImage: `url(${images[p.id]})` }
                  : { background: p.bg }
                }
              >
                <div className="custom-pick-card-top">
                  <div className="custom-pick-circle">{p.icon}</div>
                </div>
                <div className="custom-pick-card-bot">
                  <p className="custom-pick-name">{p.name}</p>
                  <div className="custom-pick-desc-row">
                    <p className="custom-pick-desc">{p.desc}</p>
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
