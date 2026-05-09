import fs from 'fs'
import path from 'path'

export type Product = {
  id: string
  tag: string
  title: string
  price: string
  bg: string
  colors?: string[]  // available shirt/clothing color options
  priceUSD?: number  // USD price
  description: string
  material: string | string[]
  sizes: string[]
  image?: string     // main product photo
  images?: string[]  // up to 4 detail photos (index = slot, '' = empty)
  updatedAt?: string // ISO timestamp of last update
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

const DATA_DIR = path.join(process.cwd(), 'data')

function readJSON<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
}

function writeJSON(file: string, data: unknown) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2))
}

export function getProducts(): Product[] {
  return readJSON<Product[]>('products.json')
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

export function saveProducts(products: Product[]) {
  writeJSON('products.json', products)
}

export function getServices(): ServiceItem[] {
  return readJSON<ServiceItem[]>('services.json')
}

export function getServiceById(id: string): ServiceItem | undefined {
  return getServices().find((s) => s.id === id)
}

export function saveServices(services: ServiceItem[]) {
  writeJSON('services.json', services)
}

export type GalleryItem = {
  id: string
  image: string
  label: string
  sublabel: string
}

export function getGallery(): GalleryItem[] {
  return readJSON<GalleryItem[]>('gallery.json')
}

export function saveGallery(items: GalleryItem[]) {
  writeJSON('gallery.json', items)
}

export type ShowcaseItem = {
  id: string
  image: string
  title: string
  desc: string
  buttonText: string
  buttonHref: string
}

export function getShowcase(): ShowcaseItem[] {
  return readJSON<ShowcaseItem[]>('showcase.json')
}

export function saveShowcase(items: ShowcaseItem[]) {
  writeJSON('showcase.json', items)
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
    badge?: string
    title?: string
    sub?: string
    processTitle?: string
    steps?: Array<{ num: string; title: string; desc: string }>
  }
  contact?: { badge?: string; title?: string; sub?: string }
}

export type ContentData = { id: ContentLang; en: ContentLang }

export function getContent(): ContentData {
  return readJSON<ContentData>('content.json')
}

export function saveContent(data: ContentData) {
  writeJSON('content.json', data)
}
