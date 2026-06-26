import { getCustomProductImages, getAllCustomProductOptions } from '@/lib/data'
import AdminToastTrigger from '@/components/AdminToastTrigger'
import CustomProductCard from '@/components/CustomProductCard'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'

const PRODUCTS = [
  { id: 'tshirt',           name: 'Kaos',         sub: 'T-Shirt',   hasColors: true,  hasBahan: true,  hasSizes: true  },
  { id: 'totebag',          name: 'Totebag',       sub: 'Kanvas',    hasColors: false, hasBahan: true,  hasSizes: false },
  { id: 'amplop-packaging', name: 'Amplop',        sub: 'Packaging', hasColors: false, hasBahan: false, hasSizes: false },
  { id: 'coach-jacket',     name: 'Coach Jacket',  sub: 'Jacket',    hasColors: true,  hasBahan: true,  hasSizes: true  },
  { id: 'hoodie',           name: 'Hoodie',        sub: 'Fleece',    hasColors: true,  hasBahan: true,  hasSizes: true  },
  { id: 'jersey',           name: 'Jersey',        sub: 'Sublimasi', hasColors: true,  hasBahan: true,  hasSizes: true  },
]

type SP = Promise<{ toast?: string; toastType?: string }>

export default async function CustomProductsAdminPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const [images, allOptions] = await Promise.all([getCustomProductImages(), getAllCustomProductOptions()])

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
          <p className="admin-page-subtitle">Foto background, warna, bahan, dan ukuran per produk</p>
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
            hasColors={p.hasColors}
            hasBahan={p.hasBahan}
            hasSizes={p.hasSizes}
            options={allOptions[p.id] ?? { colors: [], bahans: [], sizes: [] }}
            defaults={{
              colors: DEFAULT_COLORS,
              bahans: DEFAULT_BAHANS[p.id] ?? [],
              sizes:  (DEFAULT_SIZES[p.id] ?? []).map(s => ({ label: s })),
            }}
          />
        ))}
      </div>
    </>
  )
}
