'use client'
import { useLanguage } from '@/context/LanguageContext'
import type { Product } from '@/lib/data'
import ProductCard from '@/components/ProductCard'

export default function ProductsClient({ products }: { products: Product[] }) {
  const { t } = useLanguage()
  const pp = t.productPage

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">
            {pp.title.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
          <p className="page-hero-sub">{pp.sub}</p>
        </div>
      </div>

      <div className="products-page-section">
        <div className="products-page-inner">
          <div className="category-tabs">
            {pp.categories.map((c, i) => (
              <button key={c} className={`category-tab${i === 0 ? ' active' : ''}`}>
                {c}
              </button>
            ))}
          </div>

          <div className="products-page-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="products-page-cta">
            <button className="btn-outline">{pp.loadMore}</button>
          </div>
        </div>
      </div>
    </>
  )
}
