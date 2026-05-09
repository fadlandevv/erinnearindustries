import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById, getProducts } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'

export async function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = getProductById(id)
  if (!product) return {}
  return {
    title: `${product.title} — Erinnear Industries`,
    description: product.description,
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProductById(id)
  if (!product) notFound()

  const related = getProducts()
    .filter((p) => p.id !== id)
    .slice(0, 3)

  return (
    <div className="product-detail-section">
      <div className="product-detail-inner">
        <ProductDetail product={product} related={related} />
      </div>
    </div>
  )
}
