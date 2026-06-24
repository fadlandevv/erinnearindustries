import Image from 'next/image'
import { getCustomProductImages } from '@/lib/data'
import { updateCustomProductImageAction } from '@/lib/actions'

const PRODUCTS = [
  { id: 'tshirt',           name: 'Kaos',   sub: 'T-Shirt'    },
  { id: 'totebag',          name: 'Totebag', sub: 'Kanvas'     },
  { id: 'amplop-packaging', name: 'Amplop',  sub: 'Packaging'  },
  { id: 'coach-jacket',     name: 'Coach',   sub: 'Jacket'     },
  { id: 'hoodie',           name: 'Hoodie',  sub: 'Fleece'     },
  { id: 'jersey',           name: 'Jersey',  sub: 'Sublimasi'  },
]

export default async function CustomProductsAdminPage() {
  const images = await getCustomProductImages()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Custom Products</h1>
          <p className="admin-page-subtitle">Foto background untuk setiap kartu produk di halaman /custom</p>
        </div>
      </div>

      <div className="admin-showcase-grid">
        {PRODUCTS.map((p) => {
          const action = updateCustomProductImageAction.bind(null, p.id)
          const image = images[p.id]
          return (
            <div key={p.id} className="admin-form-card">
              <div className="admin-showcase-preview">
                {image ? (
                  <Image
                    src={image}
                    alt={p.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="500px"
                  />
                ) : (
                  <div className="admin-gallery-empty">
                    <span>{p.name} ({p.sub}) — belum ada foto</span>
                  </div>
                )}
              </div>

              <form action={action} encType="multipart/form-data">
                <div style={{ padding: '0 0 4px', fontWeight: 600, fontSize: '0.9rem' }}>
                  {p.name} <span style={{ fontWeight: 400, color: '#888' }}>· {p.sub}</span>
                </div>
                <div className="admin-form-group" style={{ marginTop: 10 }}>
                  <label>Upload Foto Background</label>
                  <input type="file" name="image" accept="image/*" className="admin-gallery-file-input" required />
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="btn-admin-primary">Simpan</button>
                </div>
              </form>
            </div>
          )
        })}
      </div>
    </>
  )
}
