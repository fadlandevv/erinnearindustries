import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCustomProductOptions } from '@/lib/data'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'
import CustomProductEditClient from './CustomProductEditClient'

const PRODUCTS: Record<string, {
  name: string; sub: string
  hasColors: boolean; hasBahan: boolean; hasSizes: boolean
}> = {
  tshirt:           { name: 'Kaos',        sub: 'T-Shirt',   hasColors: true,  hasBahan: true,  hasSizes: true  },
  totebag:          { name: 'Totebag',      sub: 'Kanvas',    hasColors: false, hasBahan: true,  hasSizes: false },
  'amplop-packaging':{ name: 'Amplop',     sub: 'Packaging', hasColors: false, hasBahan: false, hasSizes: false },
  'coach-jacket':   { name: 'Coach Jacket', sub: 'Jacket',   hasColors: true,  hasBahan: true,  hasSizes: true  },
  hoodie:           { name: 'Hoodie',       sub: 'Fleece',   hasColors: true,  hasBahan: true,  hasSizes: true  },
  jersey:           { name: 'Jersey',       sub: 'Sublimasi',hasColors: true,  hasBahan: true,  hasSizes: true  },
}

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params
  const p = PRODUCTS[id]
  return { title: p ? `Edit ${p.name} — Admin` : 'Edit Produk — Admin' }
}

export default async function CustomProductEditPage({ params }: { params: Params }) {
  const { id } = await params
  const product = PRODUCTS[id]
  if (!product) notFound()

  const opts = await getCustomProductOptions(id)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/custom-products" style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            ← Custom Products
          </Link>
          <h1 className="admin-page-title">{product.name} <span style={{ color: '#aaa', fontWeight: 400 }}>· {product.sub}</span></h1>
          <p className="admin-page-subtitle">Kelola warna, bahan, dan ukuran untuk produk ini</p>
        </div>
      </div>

      <CustomProductEditClient
        productId={id}
        productName={product.name}
        hasColors={product.hasColors}
        hasBahan={product.hasBahan}
        hasSizes={product.hasSizes}
        options={opts}
        defaults={{
          colors: DEFAULT_COLORS,
          bahans: DEFAULT_BAHANS[id] ?? [],
          sizes:  (DEFAULT_SIZES[id] ?? []).map(s => ({ label: s })),
        }}
      />
    </>
  )
}
