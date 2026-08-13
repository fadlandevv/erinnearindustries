'use client'
import { useEffect } from 'react'
import Link from 'next/link'

/** Batas error untuk halaman dashboard admin — sidebar tetap tampil. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  // Kegagalan izin sengaja dibedakan: penyebabnya bukan gangguan teknis, jadi
  // "Coba Lagi" tidak akan menolong dan hanya membingungkan.
  const isAuth = /login|akses|permission|unauthorized/i.test(error.message)

  return (
    <div className="admin-errstate">
      <div className="admin-errstate-badge admin-errstate-badge--err">!</div>
      <h1 className="admin-errstate-title">
        {isAuth ? 'Akses ditolak' : 'Halaman gagal dimuat'}
      </h1>
      <p className="admin-errstate-desc">
        {isAuth
          ? 'Sesi kamu mungkin sudah berakhir, atau role-mu tidak punya akses ke halaman ini.'
          : 'Terjadi kesalahan saat mengambil data. Coba muat ulang bagian ini.'}
      </p>
      <div className="admin-errstate-actions">
        {isAuth ? (
          <Link href="/admin/login" className="btn-admin-primary">Login Ulang</Link>
        ) : (
          <button type="button" onClick={reset} className="btn-admin-primary">Coba Lagi</button>
        )}
        <Link href="/admin" className="btn-admin-secondary">Ke Dashboard</Link>
      </div>
      {error.digest && <p className="admin-errstate-digest">Kode error: {error.digest}</p>}
    </div>
  )
}
