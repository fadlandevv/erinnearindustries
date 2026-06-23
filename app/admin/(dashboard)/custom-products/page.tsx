import Link from 'next/link'
import Image from 'next/image'
import { getCustomProducts } from '@/lib/data'
import { deleteCustomProductAction } from '@/lib/actions'

export default async function CustomProductsAdminPage() {
  const products = await getCustomProducts()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Custom Products</h1>
          <p className="admin-page-subtitle">Kartu produk di halaman /custom — {products.length} item</p>
        </div>
        <Link href="/admin/custom-products/new" className="btn-admin-primary">
          + Tambah Produk
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nama</th>
              <th>Subtitle</th>
              <th>Deskripsi</th>
              <th>Link</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty">Belum ada produk custom. Tambahkan produk pertama.</td>
              </tr>
            )}
            {products.map((p) => {
              const deleteAction = deleteCustomProductAction.bind(null, p.id)
              return (
                <tr key={p.id} style={{ opacity: p.active ? 1 : 0.5 }}>
                  <td>
                    {p.image ? (
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', position: 'relative', background: p.bg }}>
                        <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                      </div>
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: p.bg }} />
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: '#888', fontSize: '0.82rem' }}>{p.sub}</td>
                  <td style={{ fontSize: '0.82rem' }}>{p.descShort}</td>
                  <td style={{ fontSize: '0.8rem', color: '#666' }}>{p.href}</td>
                  <td>
                    <span className="admin-badge" style={{ background: p.active ? '#e6f4ea' : '#f5e6e6', color: p.active ? '#2d7a3a' : '#a33' }}>
                      {p.active ? 'Aktif' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link href={`/admin/custom-products/${p.id}`} className="btn-admin-secondary">
                        Edit
                      </Link>
                      <form action={deleteAction} onSubmit={(e) => { if (!confirm(`Hapus "${p.name}"?`)) e.preventDefault() }}>
                        <button type="submit" className="btn-admin-danger">Hapus</button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
