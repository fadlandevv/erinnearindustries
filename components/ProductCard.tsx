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
            <select
              className="card-currency-select"
              value={showUSD ? 'USD' : 'IDR'}
              onChange={(e) => setShowUSD(e.target.value === 'USD')}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
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
