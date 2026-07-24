import type { Metadata } from 'next'
import { getProducts, getContent } from '@/lib/data'
import ProductsClient from './ProductsClient'
import GalleryMarquee from '@/components/GalleryMarquee'

export const metadata: Metadata = {
  title: 'Products — Erinnear Industries',
  description: 'Explore our premium clothing collections.',
}

export default async function ProductPage() {
  const [products, content] = await Promise.all([getProducts(), getContent()])
  const idCategories = content.id.productPage?.categories ?? ['Semua', 'Apparel', 'Accessories', 'B2B']
  return (
    <>
      <ProductsClient products={products} idCategories={idCategories} />
      <GalleryMarquee />
    </>
  )
}
