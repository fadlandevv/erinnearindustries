import { getProducts, getContent, buildPageMetadata } from '@/lib/data'
import ProductsClient from './ProductsClient'
import GalleryMarquee from '@/components/GalleryMarquee'

export async function generateMetadata() {
  return buildPageMetadata('products', {
    title: 'Products — Erinnear Industries',
    description: 'Explore our premium clothing collections.',
    path: '/product',
  })
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
