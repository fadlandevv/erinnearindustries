import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Artikel — Erinnear Industries',
}

export default function BeritaArtikelPage() {
  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/berita" className="svc-detail-back">← Semua Berita</Link>
        </div>
      </div>

      <section style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ color: '#aaa', fontSize: '0.82rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            Artikel
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Segera hadir
          </h1>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 32px' }}>
            Artikel ini sedang dalam pengembangan. Kembali lagi nanti.
          </p>
          <Link href="/berita" style={{
            display: 'inline-block', padding: '10px 24px',
            background: '#0d0d0d', color: '#fff', borderRadius: 8,
            fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
          }}>
            Kembali ke Berita
          </Link>
        </div>
      </section>
    </>
  )
}
