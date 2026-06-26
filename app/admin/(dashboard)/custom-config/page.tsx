import { getAllCustomProductOptions } from '@/lib/data'
import CustomConfigClient from './CustomConfigClient'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'

const PRODUCTS = [
  { id: 'tshirt',           name: 'Kaos',         hasColors: true,  hasBahan: true,  hasSizes: true  },
  { id: 'coach-jacket',     name: 'Coach Jacket',  hasColors: true,  hasBahan: true,  hasSizes: true  },
  { id: 'hoodie',           name: 'Hoodie',        hasColors: true,  hasBahan: true,  hasSizes: true  },
  { id: 'jersey',           name: 'Jersey',        hasColors: true,  hasBahan: true,  hasSizes: true  },
  { id: 'totebag',          name: 'Totebag',       hasColors: false, hasBahan: true,  hasSizes: false },
  { id: 'amplop-packaging', name: 'Amplop',        hasColors: false, hasBahan: false, hasSizes: false },
]

export default async function CustomConfigPage() {
  const allOptions = await getAllCustomProductOptions()

  const productsWithDefaults = PRODUCTS.map(p => ({
    ...p,
    options: {
      colors: allOptions[p.id]?.colors ?? [],
      bahans: allOptions[p.id]?.bahans ?? [],
      sizes:  allOptions[p.id]?.sizes  ?? [],
    },
    defaults: {
      colors: DEFAULT_COLORS,
      bahans: DEFAULT_BAHANS[p.id] ?? [],
      sizes:  (DEFAULT_SIZES[p.id] ?? []).map(s => ({ label: s })),
    },
  }))

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Custom Product Config</h1>
          <p className="admin-page-subtitle">Kelola warna, bahan, dan ukuran per produk. Jika kosong, sistem pakai default bawaan.</p>
        </div>
      </div>
      <CustomConfigClient products={productsWithDefaults} />
    </>
  )
}
