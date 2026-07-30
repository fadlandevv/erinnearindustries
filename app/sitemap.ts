import type { MetadataRoute } from 'next'
import { getProducts, getServices } from '@/lib/data'
import { POSTS } from '@/app/berita/dummyPosts'

const BASE_URL = 'https://erinnear.com'

const CUSTOM_TYPES = ['tshirt', 'totebag', 'hoodie', 'jersey', 'coach-jacket', 'amplop-packaging']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  const services = await getServices()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/product`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/service`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/berita`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/custom`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/reseller`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const customRoutes: MetadataRoute.Sitemap = CUSTOM_TYPES.map((t) => ({
    url: `${BASE_URL}/custom/${t}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE_URL}/service/${s.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const beritaRoutes: MetadataRoute.Sitemap = POSTS.map((p) => {
    const d = p.date ? new Date(p.date) : new Date()
    return {
      url: `${BASE_URL}/berita/${p.slug}`,
      lastModified: isNaN(d.getTime()) ? new Date() : d,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }
  })

  return [...staticRoutes, ...customRoutes, ...productRoutes, ...serviceRoutes, ...beritaRoutes]
}
