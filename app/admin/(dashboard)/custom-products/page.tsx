import { getCustomProductImages } from '@/lib/data'
import CustomProductCard from '@/components/CustomProductCard'

const PRODUCTS = [
  { id: 'tshirt',           name: 'Kaos',        sub: 'T-Shirt'   },
  { id: 'totebag',          name: 'Totebag',      sub: 'Kanvas'    },
  { id: 'amplop-packaging', name: 'Amplop',       sub: 'Packaging' },
  { id: 'coach-jacket',     name: 'Coach Jacket', sub: 'Jacket'    },
  { id: 'hoodie',           name: 'Hoodie',       sub: 'Fleece'    },
  { id: 'jersey',           name: 'Jersey',       sub: 'Sublimasi' },
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
        {PRODUCTS.map((p) => (
          <CustomProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            sub={p.sub}
            savedImage={images[p.id]}
          />
        ))}
      </div>
    </>
  )
}
