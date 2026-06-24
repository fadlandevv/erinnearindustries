import { getCustomProductImages } from '@/lib/data'
import AdminToastTrigger from '@/components/AdminToastTrigger'
import CustomProductCard from '@/components/CustomProductCard'

const PRODUCTS = [
  { id: 'tshirt',           name: 'Kaos',   sub: 'T-Shirt'    },
  { id: 'totebag',          name: 'Totebag', sub: 'Kanvas'     },
  { id: 'amplop-packaging', name: 'Amplop',  sub: 'Packaging'  },
  { id: 'coach-jacket',     name: 'Coach Jacket', sub: 'Jacket' },
  { id: 'hoodie',           name: 'Hoodie',  sub: 'Fleece'     },
  { id: 'jersey',           name: 'Jersey',  sub: 'Sublimasi'  },
]

type SP = Promise<{ toast?: string; toastType?: string }>

export default async function CustomProductsAdminPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const images = await getCustomProductImages()

  return (
    <>
      {sp.toast && (
        <AdminToastTrigger
          message={decodeURIComponent(sp.toast)}
          type={(sp.toastType ?? 'success') as 'success' | 'error'}
        />
      )}
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
