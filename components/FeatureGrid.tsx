'use client'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { Product } from '@/lib/data'
import ProductCard from './ProductCard'

export default function FeatureGrid({ products }: { products: Product[] }) {
  const { t } = useLanguage()

  return (
    <section className="products-section" id="product">
      <div className="products-inner">
        <div className="products-header">
          <h2>
            {t.featuredProducts.title.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
          <p>{(t.featuredProducts as any).sub}</p>
        </div>
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="products-view-all">
          <Link href="/product" className="btn-outline">View All Products →</Link>
        </div>
      </div>
    </section>
  )
}
