import Link from 'next/link'
import { getProducts } from '@/lib/data'
import { deleteProduct, duplicateProduct } from '@/lib/actions'
import RelativeTime from '@/components/RelativeTime'

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} produk terdaftar</p>
        </div>
        <Link href="/admin/products/new" className="btn-admin-primary">
          + Tambah Product
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Warna</th>
              <th>Nama Produk</th>
              <th>Tag</th>
              <th>Diperbarui</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">Belum ada produk. Tambahkan produk pertama.</td>
              </tr>
            )}
            {products.map((p) => {
              const deleteAction = deleteProduct.bind(null, p.id)
              const duplicateAction = duplicateProduct.bind(null, p.id)
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {(p.colors ?? [p.bg]).slice(0, 3).map((c) => (
                        <span key={c} className="admin-color-swatch" style={{ background: c }} />
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.title}</td>
                  <td><span className="admin-badge">{p.tag}</span></td>
                  <td>
                    {p.updatedAt
                      ? <RelativeTime iso={p.updatedAt} />
                      : <span style={{ color: '#ccc', fontSize: '0.78rem' }}>—</span>}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link href={`/admin/products/${p.id}/edit`} className="btn-admin-edit">
                        Edit
                      </Link>
                      <form action={duplicateAction}>
                        <button type="submit" className="btn-admin-secondary">Duplikat</button>
                      </form>
                      <form action={deleteAction}>
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
