'use client'
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { Product } from '@/lib/data'
import ProductCard from '@/components/ProductCard'

export default function ProductsClient({ products, idCategories }: { products: Product[]; idCategories: string[] }) {
  const { t } = useLanguage()
  const pp = t.productPage
  const [activeIdx, setActiveIdx] = useState(0)

  const filtered = activeIdx === 0
    ? products
    : products.filter((p) => p.categories?.includes(idCategories[activeIdx]))

  // Labels follow the active language, but filtering always matches the ID category values.
  // Categories with no products are dropped so no tab ever leads to an empty grid.
  const tabs = pp.categories
    .map((label: string, i: number) => ({ label, i }))
    .filter(({ i }: { i: number }) =>
      i === 0 || products.some((p) => p.categories?.includes(idCategories[i]))
    )

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
            {tabs.map(({ label, i }: { label: string; i: number }) => (
              <button
                key={label}
                className={`category-tab${i === activeIdx ? ' active' : ''}`}
                onClick={() => setActiveIdx(i)}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '3rem 0' }}>
              Belum ada produk di kategori ini.
            </p>
          ) : (
            <div className="products-page-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
