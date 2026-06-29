import Link from 'next/link'
import { getProducts } from '@/lib/data'
import { deleteProduct, duplicateProduct } from '@/lib/actions'
import { getPriceMap } from '@/lib/warehouse'
import RelativeTime from '@/components/RelativeTime'

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default async function AdminProductsPage() {
  const [products, priceMap] = await Promise.all([getProducts(), getPriceMap()])

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
              <th>Harga</th>
              <th>Diperbarui</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">Belum ada produk. Tambahkan produk pertama.</td>
              </tr>
            )}
            {products.map((p) => {
              const deleteAction = deleteProduct.bind(null, p.id)
              const duplicateAction = duplicateProduct.bind(null, p.id)
              const sizes = p.sizes?.length ? p.sizes : ['-']
              const prices = sizes.map(s => priceMap[`${p.id}:${s}`]?.harga).filter((h): h is number => h != null)
              const minP = prices.length ? Math.min(...prices) : null
              const maxP = prices.length ? Math.max(...prices) : null
              const priceLabel = minP == null ? '—' : minP === maxP ? formatRp(minP) : `${formatRp(minP)} – ${formatRp(maxP!)}`
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
                  <td style={{ fontSize: '0.85rem', color: '#555' }}>{priceLabel}</td>
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
