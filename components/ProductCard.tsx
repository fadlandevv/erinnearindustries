'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/data'

export default function ProductCard({ product: p }: { product: Product }) {
  const [showUSD, setShowUSD] = useState(false)

  return (
    <Link href={`/product/${p.id}`} className="product-card">
      <div className="product-card-img" style={{ background: p.image ? '#f0ede8' : p.bg }}>
        {p.image && (
          <img src={p.image} alt={p.title} className="product-card-photo" />
        )}
      </div>
      <div className="product-card-body">
        <span className="product-tag">{p.tag}</span>
        <div className="product-card-title-row">
          <h4>{p.title}</h4>
          {p.priceUSD != null && (
            <button
              className="card-currency-toggle"
              onClick={(e) => { e.preventDefault(); setShowUSD((v) => !v) }}
              type="button"
            >
              <span className={showUSD ? '' : 'card-currency-toggle--active'}>IDR</span>
              <span className="card-currency-toggle-sep" />
              <span className={showUSD ? 'card-currency-toggle--active' : ''}>USD</span>
            </button>
          )}
        </div>
        <p>{showUSD && p.priceUSD != null ? `$${p.priceUSD.toFixed(2)}` : p.price}</p>
        {p.colors && p.colors.length > 0 && (
          <div className="product-color-swatches">
            {p.colors.map((c) => (
              <span key={c} className="product-color-dot" style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
