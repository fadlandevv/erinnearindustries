import type { Metadata } from 'next'
import Link from 'next/link'
import CustomDesignClient from '@/components/CustomDesignClient'

export const metadata: Metadata = {
  title: 'Custom Design — Erinnear Industries',
  description: 'Upload desain depan dan belakang bajumu, pilih warna dan ukuran — kami produksi sesuai pesanan.',
}

export default function CustomPage() {
  return (
    <>
      {/* Back */}
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/" className="svc-detail-back">← Beranda</Link>
        </div>
      </div>

      {/* Hero */}
      <div className="custom-hero">
        <div className="custom-hero-inner">
          <span className="pill pill-yellow">✦ Custom Order</span>
          <h1 className="custom-hero-title">Desain Bajumu Sendiri</h1>
          <p className="custom-hero-sub">
            Upload desain depan & belakang, pilih warna dan ukuran — kami produksi sesuai pesananmu.
          </p>
        </div>
      </div>

      {/* Interactive tool */}
      <CustomDesignClient />

      {/* CTA Banner */}
      <div className="cta-banner">
        <div className="cta-banner-inner">
          <span className="pill pill-yellow">✦ Siap Order?</span>
          <h2>Sudah punya desain? Kirim langsung ke kami</h2>
          <p>Tim kami akan konfirmasi spesifikasi dan estimasi harga dalam 1×24 jam.</p>
          <Link href="/contact" className="btn-dark" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>
            Hubungi Kami →
          </Link>
        </div>
      </div>
    </>
  )
}
