import { unstable_cache } from 'next/cache'
import { db } from './db'

export type Product = {
  id: string
  tag: string
  title: string
  price: string
  bg: string
  colors?: string[]
  priceUSD?: number
  priceReseller?: number
  description: string
  material: string | string[]
  sizechart?: string
  sizes: string[]
  image?: string
  images?: string[]
  updatedAt?: string
  sortOrder?: number
}

export type ServiceItem = {
  id: string
  icon: string
  title: string
  desc: string
  tag: string | null
  longDesc?: string
  features?: string[]
}

export type GalleryItem = {
  id: string
  image: string
  label: string
  sublabel: string
}

export type ShowcaseItem = {
  id: string
  image: string
  title: string
  desc: string
  buttonText: string
  buttonHref: string
}

export type ContentLang = {
  hero?: { badge?: string; title?: string; sub?: string }
  stats?: {
    heading?: string
    desc?: string
    items?: Array<{ num: string; unit: string; desc: string }>
  }
  featuredProducts?: { badge?: string; title?: string }
  servicesSection?: { badge?: string; title?: string; sub?: string }
  productPage?: { badge?: string; title?: string; sub?: string }
  servicePage?: {
    badge?: string; title?: string; sub?: string; processTitle?: string
    steps?: Array<{ num: string; title: string; desc: string }>
  }
  contact?: { badge?: string; title?: string; sub?: string }
}

export type ContentData = { id: ContentLang; en: ContentLang }

// ── Products ──────────────────────────────────────────────────

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    tag: row.tag as string,
    title: row.title as string,
    price: row.price as string,
    bg: (row.bg as string) ?? '#f0ede8',
    colors: (row.colors as string[]) ?? undefined,
    priceUSD: (row.price_usd as number) ?? undefined,
    priceReseller: (row.price_reseller as number) ?? undefined,
    description: row.description as string,
    material: (row.material as string[]) ?? [],
    sizechart: (row.sizechart as string) ?? undefined,
    sizes: (row.sizes as string[]) ?? [],
    image: (row.image as string) ?? undefined,
    images: (row.images as string[]) ?? undefined,
    updatedAt: (row.updated_at as string) ?? undefined,
    sortOrder: (row.sort_order as number) ?? 0,
  }
}

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { data, error } = await db.from('products').select('*').order('sort_order', { ascending: true })
    if (error) {
      const { data: fallback } = await db.from('products').select('*').order('created_at', { ascending: true })
      return (fallback ?? []).map(toProduct)
    }
    return (data ?? []).map(toProduct)
  },
  ['products'],
  { tags: ['products'], revalidate: 300 }
)

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data } = await db.from('products').select('*').eq('id', id).maybeSingle()
  return data ? toProduct(data) : undefined
}

export async function saveProducts(products: Product[]): Promise<void> {
  for (const p of products) {
    const { error } = await db.from('products').upsert({
      id: p.id, tag: p.tag, title: p.title, price: p.price, bg: p.bg,
      colors: p.colors ?? null, description: p.description,
      material: Array.isArray(p.material) ? p.material : [p.material],
      sizes: p.sizes, sizechart: p.sizechart ?? null,
      image: p.image ?? null, images: p.images ?? null,
      price_reseller: p.priceReseller ?? null,
      updated_at: new Date().toISOString(),
      sort_order: p.sortOrder ?? 0,
    })
    if (error) throw new Error(error.message)
  }
}

export async function deleteProduct(id: string): Promise<void> {
  await db.from('products').delete().eq('id', id)
}

// ── Services ──────────────────────────────────────────────────

function toService(row: Record<string, unknown>): ServiceItem {
  return {
    id: row.id as string,
    icon: row.icon as string,
    title: row.title as string,
    desc: row.description as string,
    tag: (row.tag as string) ?? null,
    longDesc: (row.long_desc as string) ?? undefined,
    features: (row.features as string[]) ?? undefined,
  }
}

export const getServices = unstable_cache(
  async (): Promise<ServiceItem[]> => {
    const { data } = await db.from('services').select('*').order('created_at', { ascending: true })
    return (data ?? []).map(toService)
  },
  ['services'],
  { tags: ['services'], revalidate: 300 }
)

export async function getServiceById(id: string): Promise<ServiceItem | undefined> {
  const { data } = await db.from('services').select('*').eq('id', id).maybeSingle()
  return data ? toService(data) : undefined
}

export async function saveServices(services: ServiceItem[]): Promise<void> {
  for (const s of services) {
    await db.from('services').upsert({
      id: s.id, icon: s.icon, title: s.title, description: s.desc,
      tag: s.tag ?? null, long_desc: s.longDesc ?? null, features: s.features ?? null,
    })
  }
}

export async function deleteService(id: string): Promise<void> {
  await db.from('services').delete().eq('id', id)
}

// ── Gallery ──────────────────────────────────────────────────

export async function getGallery(): Promise<GalleryItem[]> {
  const { data } = await db.from('gallery').select('*').order('sort_order', { ascending: true })
  return (data ?? []).map(row => ({ id: row.id, image: row.image, label: row.label, sublabel: row.sublabel }))
}

export async function saveGallery(items: GalleryItem[]): Promise<void> {
  await db.from('gallery').delete().neq('id', '')
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    await db.from('gallery').upsert({ id: item.id, image: item.image, label: item.label, sublabel: item.sublabel, sort_order: i })
  }
}

// ── Showcase ─────────────────────────────────────────────────

export async function getShowcase(): Promise<ShowcaseItem[]> {
  const { data } = await db.from('showcase').select('*').order('sort_order', { ascending: true })
  return (data ?? []).map(row => ({
    id: row.id, image: row.image, title: row.title,
    desc: row.description, buttonText: row.button_text, buttonHref: row.button_href,
  }))
}

export async function saveShowcase(items: ShowcaseItem[]): Promise<void> {
  await db.from('showcase').delete().neq('id', '')
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    await db.from('showcase').upsert({
      id: item.id, image: item.image, title: item.title,
      description: item.desc, button_text: item.buttonText, button_href: item.buttonHref, sort_order: i,
    })
  }
}

// ── Custom Products ───────────────────────────────────────────

export type CustomProduct = {
  id: string
  name: string
  sub: string
  descShort: string
  href: string
  bg: string
  image?: string
  iconSvg: string
  sortOrder: number
  active: boolean
}

function toCustomProduct(row: Record<string, unknown>): CustomProduct {
  return {
    id: row.id as string,
    name: row.name as string,
    sub: (row.sub as string) ?? '',
    descShort: (row.desc_short as string) ?? '',
    href: row.href as string,
    bg: (row.bg as string) ?? '#1a1209',
    image: (row.image as string) ?? undefined,
    iconSvg: (row.icon_svg as string) ?? '',
    sortOrder: (row.sort_order as number) ?? 0,
    active: (row.active as boolean) ?? true,
  }
}

export async function getCustomProducts(): Promise<CustomProduct[]> {
  const { data } = await db.from('custom_products').select('*').order('sort_order', { ascending: true })
  return (data ?? []).map(toCustomProduct)
}

export async function getCustomProductById(id: string): Promise<CustomProduct | undefined> {
  const { data } = await db.from('custom_products').select('*').eq('id', id).maybeSingle()
  return data ? toCustomProduct(data) : undefined
}

export async function upsertCustomProduct(product: CustomProduct): Promise<void> {
  const { error } = await db.from('custom_products').upsert({
    id: product.id,
    name: product.name,
    sub: product.sub,
    desc_short: product.descShort,
    href: product.href,
    bg: product.bg,
    image: product.image ?? null,
    icon_svg: product.iconSvg,
    sort_order: product.sortOrder,
    active: product.active,
  })
  if (error) throw new Error(error.message)
}

export async function deleteCustomProduct(id: string): Promise<void> {
  await db.from('custom_products').delete().eq('id', id)
}

export const getCustomProductImages = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const { data } = await db.from('content').select('value').eq('key', 'custom_product_images').maybeSingle()
    return (data?.value ?? {}) as Record<string, string>
  },
  ['custom-product-images'],
  { tags: ['custom-product-images'], revalidate: 300 }
)

// ── Custom Product Options ────────────────────────────────────

export type CustomProductOption = {
  id: string
  product_type: string
  category: string
  label: string
  value: string
  price: number
  sort_order: number
}

export type ProductOptionMap = {
  colors:  { id: string; label: string; value: string }[]
  bahans:  { id: string; label: string; price: number }[]
  sizes:   { id: string; label: string; price: number }[]
}

export async function getCustomProductOptions(productType: string): Promise<ProductOptionMap> {
  const { data } = await db
    .from('custom_product_options')
    .select('*')
    .eq('product_type', productType)
    .order('sort_order')
  const rows = (data ?? []) as CustomProductOption[]
  return {
    colors: rows.filter(r => r.category === 'color').map(r => ({ id: r.id, label: r.label, value: r.value })),
    bahans: rows.filter(r => r.category === 'bahan').map(r => ({ id: r.id, label: r.label, price: r.price })),
    sizes:  rows.filter(r => r.category === 'size').map(r => ({ id: r.id, label: r.label, price: r.price })),
  }
}

export async function getAllCustomProductOptions(): Promise<Record<string, ProductOptionMap>> {
  const { data } = await db
    .from('custom_product_options')
    .select('*')
    .order('sort_order')
  const rows = (data ?? []) as CustomProductOption[]
  const result: Record<string, ProductOptionMap> = {}
  for (const row of rows) {
    if (!result[row.product_type]) result[row.product_type] = { colors: [], bahans: [], sizes: [] }
    const m = result[row.product_type]
    if (row.category === 'color') m.colors.push({ id: row.id, label: row.label, value: row.value })
    else if (row.category === 'bahan') m.bahans.push({ id: row.id, label: row.label, price: row.price })
    else if (row.category === 'size')  m.sizes.push({ id: row.id, label: row.label, price: row.price })
  }
  return result
}

// ── Content ──────────────────────────────────────────────────

export const getContent = unstable_cache(
  async (): Promise<ContentData> => {
    const { data } = await db.from('content').select('*')
    const map: Record<string, unknown> = {}
    for (const row of data ?? []) map[row.key] = row.value
    return { id: (map.id ?? {}) as ContentLang, en: (map.en ?? {}) as ContentLang }
  },
  ['content'],
  { tags: ['content'], revalidate: 3600 }
)

export async function saveContent(data: ContentData): Promise<void> {
  await db.from('content').upsert({ key: 'id', value: data.id })
  await db.from('content').upsert({ key: 'en', value: data.en })
}
