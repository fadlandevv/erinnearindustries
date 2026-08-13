import Link from 'next/link'

export const metadata = { title: 'Halaman Tidak Ditemukan' }

export default function NotFound() {
  return (
    <main className="errpage">
      <div className="errpage-inner">
        <p className="errpage-code">404</p>
        <h1 className="errpage-title">Halaman tidak ditemukan</h1>
        <p className="errpage-desc">
          Alamat yang kamu tuju sudah dipindahkan atau memang tidak pernah ada.
          Coba kembali ke beranda atau lihat koleksi produk kami.
        </p>
        <div className="errpage-actions">
          <Link href="/" className="btn-dark">Kembali ke Beranda</Link>
          <Link href="/product" className="btn-outline">Lihat Produk</Link>
        </div>
      </div>
    </main>
  )
}
