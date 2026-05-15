import Image from 'next/image'
import { getProducts } from '@/lib/data'

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default async function ResellerProductsPage() {
  const products = await getProducts()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Katalog Produk</h1>
          <p className="admin-page-subtitle">Pilih produk untuk dimasukkan ke pesanan reseller.</p>
        </div>
      </div>

      <div className="rs-note-box">
        Harga di bawah adalah harga khusus reseller. Pastikan kamu menjual di atas harga ini untuk mendapatkan komisi.
      </div>

      <div className="admin-table-wrap">
        {products.length === 0 ? (
          <div className="admin-empty">Belum ada produk tersedia.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama Produk</th>
                <th>Tag</th>
                <th>Ukuran Tersedia</th>
                <th>Harga Reseller</th>
                <th>Harga Normal</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.image ? (
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: product.bg, flexShrink: 0 }}>
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={48}
                          height={48}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: product.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        ◈
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{product.title}</td>
                  <td>
                    <span className="admin-badge">{product.tag}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {product.sizes.map(size => (
                        <span key={size} style={{
                          display: 'inline-block', padding: '0.1rem 0.45rem',
                          background: '#f3f4f6', borderRadius: 5,
                          fontSize: '0.75rem', fontWeight: 600, color: '#555',
                        }}>
                          {size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {product.priceReseller != null ? (
                      <span style={{ fontWeight: 700, color: '#16a34a' }}>{IDR(product.priceReseller)}</span>
                    ) : (
                      <span style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.82rem' }}>Belum diset</span>
                    )}
                  </td>
                  <td style={{ color: '#555' }}>{product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
