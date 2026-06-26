import { notFound } from 'next/navigation'
import { getCustomProductOptions, getCustomProductImages } from '@/lib/data'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'
import { getPricingItems } from '@/lib/pricing'
import CustomProductEditClient from './CustomProductEditClient'

const PRODUCTS: Record<string, {
  name: string; sub: string
  hasColors: boolean; hasBahan: boolean; hasSizes: boolean; hasSablon: boolean
}> = {
  tshirt:            { name: 'Kaos',        sub: 'T-Shirt',   hasColors: true,  hasBahan: true,  hasSizes: true,  hasSablon: true  },
  totebag:           { name: 'Totebag',     sub: 'Kanvas',    hasColors: false, hasBahan: true,  hasSizes: false, hasSablon: true  },
  'amplop-packaging':{ name: 'Amplop',      sub: 'Packaging', hasColors: false, hasBahan: false, hasSizes: false, hasSablon: false },
  'coach-jacket':    { name: 'Coach Jacket',sub: 'Jacket',    hasColors: true,  hasBahan: true,  hasSizes: true,  hasSablon: true  },
  hoodie:            { name: 'Hoodie',       sub: 'Fleece',   hasColors: true,  hasBahan: true,  hasSizes: true,  hasSablon: true  },
  jersey:            { name: 'Jersey',       sub: 'Sublimasi',hasColors: true,  hasBahan: true,  hasSizes: true,  hasSablon: true  },
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

  const [opts, images, pricingItems] = await Promise.all([
    getCustomProductOptions(id),
    getCustomProductImages(),
    getPricingItems(),
  ])

  const allSablon = pricingItems.filter(i => i.type === 'sablon')
  // Filter sablon sesuai yang dipakai di halaman website per produk
  const sablonItems = id === 'coach-jacket'
    ? allSablon.filter(i => i.label === 'Logo')
    : allSablon

  return (
    <CustomProductEditClient
      productId={id}
      productName={product.name}
      productSub={product.sub}
      hasColors={product.hasColors}
      hasBahan={product.hasBahan}
      hasSizes={product.hasSizes}
      hasSablon={product.hasSablon}
      savedImage={images[id]}
      options={opts}
      sablonItems={sablonItems}
      defaults={{
        colors: DEFAULT_COLORS,
        bahans: DEFAULT_BAHANS[id] ?? [],
        sizes:  (DEFAULT_SIZES[id] ?? []).map(s => ({ label: s })),
      }}
    />
  )
}
