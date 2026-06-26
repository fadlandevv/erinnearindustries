import { notFound } from 'next/navigation'
import { getCustomProductOptions, getCustomProductImages } from '@/lib/data'
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

  const [opts, images] = await Promise.all([getCustomProductOptions(id), getCustomProductImages()])

  return (
    <CustomProductEditClient
      productId={id}
      productName={product.name}
      productSub={product.sub}
      hasColors={product.hasColors}
      hasBahan={product.hasBahan}
      hasSizes={product.hasSizes}
      savedImage={images[id]}
      options={opts}
      defaults={{
        colors: DEFAULT_COLORS,
        bahans: DEFAULT_BAHANS[id] ?? [],
        sizes:  (DEFAULT_SIZES[id] ?? []).map(s => ({ label: s })),
      }}
    />
  )
}
