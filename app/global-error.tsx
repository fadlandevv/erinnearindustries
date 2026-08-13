'use client'
import { useEffect } from 'react'

/**
 * Jaring pengaman terakhir: dipakai kalau root layout sendiri yang gagal.
 *
 * Pada kondisi ini Next mengganti seluruh dokumen, jadi komponen ini wajib
 * merender <html> dan <body> sendiri dan TIDAK bisa mengandalkan globals.css —
 * karena itu semua gayanya ditulis inline di sini.
 */
export default function GlobalError({
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
    <html lang="id">
      <body style={{ margin: 0 }}>
        <style>{`
          .ge-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px;
            background: #f5f4f1;
            color: #0d0d0d;
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
            text-align: center;
          }
          .ge-code { font-size: 13px; font-weight: 700; letter-spacing: 0.18em;
                     text-transform: uppercase; color: #999; margin: 0 0 12px; }
          .ge-title { font-size: 30px; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 12px; }
          .ge-desc { font-size: 15px; color: #666; max-width: 440px; margin: 0 auto 28px; line-height: 1.6; }
          .ge-btn {
            display: inline-flex; align-items: center; gap: 8px;
            background: #0d0d0d; color: #fff; border: none;
            padding: 12px 24px; border-radius: 999px;
            font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
          }
          .ge-btn:hover { background: #2a2a2a; }
          .ge-digest { margin-top: 20px; font-size: 12px; color: #aaa; }
          @media (prefers-color-scheme: dark) {
            .ge-root { background: #0d0d0d; color: #f0ede8; }
            .ge-title { color: #f0ede8; }
            .ge-desc { color: #888; }
            .ge-btn { background: #f47c2f; }
            .ge-btn:hover { background: #e06820; }
            .ge-digest { color: #555; }
          }
        `}</style>
        <div className="ge-root">
          <div>
            <p className="ge-code">Error</p>
            <h1 className="ge-title">Aplikasi gagal dimuat</h1>
            <p className="ge-desc">
              Terjadi kesalahan yang menghentikan seluruh halaman. Coba muat ulang;
              kalau terus berulang, laporkan kode error di bawah.
            </p>
            <button type="button" onClick={reset} className="ge-btn">Muat Ulang</button>
            {error.digest && <p className="ge-digest">Kode error: {error.digest}</p>}
          </div>
        </div>
      </body>
    </html>
  )
}
