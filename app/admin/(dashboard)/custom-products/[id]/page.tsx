import { notFound } from 'next/navigation'
import { getCustomProductOptions, getCustomProductImages } from '@/lib/data'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'
import { getPricingItems } from '@/lib/pricing'
import { getProductConfig, PRODUCT_CONFIG_DEFAULTS } from '@/lib/product-config'
import CustomProductEditClient from './CustomProductEditClient'

// Merge DB items with defaults — missing defaults show as virtual rows (id = '__new__:label')
function mergeWithDefaults(
  dbItems: { id: string; label: string; price: number }[],
  defaults: { label: string; price: number }[]
) {
  const dbLabels = new Set(dbItems.map(i => i.label))
  const missing = defaults
    .filter(d => !dbLabels.has(d.label))
    .map(d => ({ id: `__new__:${d.label}`, label: d.label, price: d.price }))
  return [...dbItems, ...missing]
}

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

  const [opts, images, pricingItems, productConfig] = await Promise.all([
    getCustomProductOptions(id),
    getCustomProductImages(),
    getPricingItems(),
    getProductConfig(id),
  ])

  // Merge DB data with code defaults — defaults always visible even if DB is empty
  const mergedBahans = product.hasBahan ? mergeWithDefaults(opts.bahans, DEFAULT_BAHANS[id] ?? []) : []
  const mergedSizes  = product.hasSizes  ? mergeWithDefaults(opts.sizes,  DEFAULT_SIZES[id]  ?? []) : []

  const allSablon = pricingItems.filter(i => i.type === 'sablon')
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
      options={{ colors: opts.colors, bahans: mergedBahans, sizes: mergedSizes }}
      sablonItems={sablonItems}
      productConfig={productConfig}
      configDefaults={PRODUCT_CONFIG_DEFAULTS[id] ?? {}}
      defaults={{ colors: DEFAULT_COLORS }}
    />
  )
}
