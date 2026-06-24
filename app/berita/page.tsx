import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Berita & Artikel — Erinnear Industries',
  description: 'Kabar terbaru, tips, dan artikel seputar produk custom dari Erinnear Industries.',
}

export default function BeritaPage() {
  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/" className="svc-detail-back">← Beranda</Link>
        </div>
      </div>

      <section className="custom-hero">
        <div className="custom-hero-inner">
          <h1 className="custom-hero-title">Berita & Artikel</h1>
          <p className="custom-hero-sub">
            Kabar terbaru, tips, dan update dari Erinnear Industries.
          </p>
        </div>
      </section>

      <section style={{ padding: '60px 24px 120px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#f5f0ea', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0905a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
              <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Segera hadir
          </h2>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            Halaman berita sedang dalam pengembangan. Pantau terus untuk update terbaru dari kami.
          </p>
        </div>
      </section>
    </>
  )
}
