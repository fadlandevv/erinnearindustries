import type { Metadata } from 'next'
import { getProducts } from '@/lib/data'
import ProductsClient from './ProductsClient'

export const metadata: Metadata = {
  title: 'Products — Erinnear Industries',
  description: 'Explore our premium clothing collections.',
}

export default function ProductPage() {
  const products = getProducts()
  return <ProductsClient products={products} />
}
