'use client'
import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Batas error untuk seluruh halaman publik. `reset()` merender ulang segmen
 * yang gagal tanpa memuat ulang halaman — cukup untuk kegagalan sesaat.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="errpage">
      <div className="errpage-inner">
        <p className="errpage-code">Ups</p>
        <h1 className="errpage-title">Ada yang bermasalah</h1>
        <p className="errpage-desc">
          Halaman ini gagal dimuat. Coba muat ulang; kalau masih sama, kembali dulu
          ke beranda dan buka lagi beberapa saat kemudian.
        </p>
        <div className="errpage-actions">
          <button type="button" onClick={reset} className="btn-dark">Coba Lagi</button>
          <Link href="/" className="btn-outline">Kembali ke Beranda</Link>
        </div>
        {/* Kode rujukan untuk menelusuri error ini di log server. */}
        {error.digest && <p className="errpage-digest">Kode error: {error.digest}</p>}
      </div>
    </main>
  )
}
