import { notFound } from 'next/navigation'
import { getCustomProductOptions, getCustomProductImages } from '@/lib/data'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'
import { getPricingItems } from '@/lib/pricing'
import { getProductConfig, PRODUCT_CONFIG_DEFAULTS } from '@/lib/product-config'
import CustomProductEditClient from './CustomProductEditClient'

// Merge DB items with defaults, always in defaults order.
// - DB items get sortOrder from their position in defaults (fixes old timestamp-based sort_order)
// - Missing defaults appear as virtual rows (id = '__new__:label') with their correct sortOrder
// - Custom additions (not in defaults) are appended at the end
function mergeWithDefaults(
  dbItems: { id: string; label: string; price: number }[],
  defaults: { label: string; price: number }[]
): { id: string; label: string; price: number; sortOrder: number }[] {
  const defaultOrder = new Map(defaults.map((d, i) => [d.label, i]))
  const dbMap = new Map(dbItems.map(i => [i.label, i]))

  const result: { id: string; label: string; price: number; sortOrder: number }[] = []

  // Defaults first, in order
  for (const [idx, d] of defaults.entries()) {
    const db = dbMap.get(d.label)
    if (db) {
      result.push({ ...db, sortOrder: idx })
    } else {
      result.push({ id: `__new__:${d.label}`, label: d.label, price: d.price, sortOrder: idx })
    }
  }

  // Custom additions (not in defaults) appended at the end
  for (const item of dbItems) {
    if (!defaultOrder.has(item.label)) {
      result.push({ ...item, sortOrder: 1000 + result.length })
    }
  }

  return result
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
  return { title: p ? `Edit ${p.name} — Admin` : 'Edit Product — Admin' }
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
