import Link from 'next/link'

export const metadata = { title: 'Tidak Ditemukan' }

/**
 * 404 untuk seluruh halaman dashboard admin. Berada di dalam grup (dashboard)
 * supaya tetap terbungkus layout-nya — sidebar dan navigasi ikut tampil, jadi
 * admin bisa langsung pindah halaman tanpa menekan tombol kembali.
 */
export default function AdminNotFound() {
  return (
    <div className="admin-errstate">
      <div className="admin-errstate-badge">404</div>
      <h1 className="admin-errstate-title">Data tidak ditemukan</h1>
      <p className="admin-errstate-desc">
        Item yang kamu buka sudah dihapus, atau alamatnya keliru. Coba kembali ke
        daftar dan pilih ulang dari sana.
      </p>
      <div className="admin-errstate-actions">
        <Link href="/admin" className="btn-admin-primary">Ke Dashboard</Link>
        <Link href="/admin/invoices" className="btn-admin-secondary">Daftar Invoice</Link>
      </div>
    </div>
  )
}
