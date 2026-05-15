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
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data } = await db.from('products').select('*').order('created_at', { ascending: true })
  return (data ?? []).map(toProduct)
}

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

export async function getServices(): Promise<ServiceItem[]> {
  const { data } = await db.from('services').select('*').order('created_at', { ascending: true })
  return (data ?? []).map(toService)
}

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

// ── Content ──────────────────────────────────────────────────

export async function getContent(): Promise<ContentData> {
  const { data } = await db.from('content').select('*')
  const map: Record<string, unknown> = {}
  for (const row of data ?? []) map[row.key] = row.value
  return { id: (map.id ?? {}) as ContentLang, en: (map.en ?? {}) as ContentLang }
}

export async function saveContent(data: ContentData): Promise<void> {
  await db.from('content').upsert({ key: 'id', value: data.id })
  await db.from('content').upsert({ key: 'en', value: data.en })
}
