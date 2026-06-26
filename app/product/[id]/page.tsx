import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById, getProducts } from '@/lib/data'
import ProductDetail from '@/components/ProductDetail'

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return {}
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.image ? [{ url: product.image, alt: product.title }] : [],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const related = (await getProducts())
    .filter((p) => p.id !== id)
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image ?? undefined,
    brand: { '@type': 'Brand', name: 'Erinnear Industries' },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.priceUSD != null ? 'USD' : 'IDR',
      price: product.priceUSD != null ? product.priceUSD : product.price,
      availability: 'https://schema.org/InStock',
      url: `https://erinnear.com/product/${product.id}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="product-detail-section">
        <div className="product-detail-inner">
          <ProductDetail product={product} related={related} />
        </div>
      </div>
    </>
  )
}
