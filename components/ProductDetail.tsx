'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/data'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import ProductCard from './ProductCard'

export default function ProductDetail({
  product,
  related,
}: {
  product: Product
  related: Product[]
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0] ?? null
  )
  const [materialOpen, setMaterialOpen] = useState(false)
  const [showUSD, setShowUSD] = useState(false)
  const [activeImg, setActiveImg] = useState<string | null>(null)
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const pd = t.productDetail

  const displayImg = product.image ?? null
  const shownImg = activeImg ?? displayImg

  // Normalize to exactly 4 slots
  const detailSlots: (string | null)[] = Array.from({ length: 4 }, (_, i) => {
    const v = product.images?.[i]
    return v && v.trim() !== '' ? v : null
  })
  const hasAnyDetail = detailSlots.some(Boolean)

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2000)
      return
    }
    addToCart(product, selectedSize)
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href="/product">Products</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{product.title}</span>
      </nav>

      {/* Detail grid — photo+thumbs left, info right */}
      <div className="product-detail-grid">

        {/* ── Left: main photo + detail strip ── */}
        <div className="product-gallery">
          <div
            className="product-gallery-main"
            style={{ background: product.bg }}
          >
            {shownImg ? (
              <img
                src={shownImg}
                alt={product.title}
                className="product-gallery-img"
              />
            ) : (
              <>
                <div className="product-detail-visual-deco" />
                <div className="product-detail-visual-label">
                  <span>{product.tag}</span>
                  <strong>{product.title}</strong>
                </div>
              </>
            )}
          </div>

          {/* Detail photo strip — always 4 slots */}
          {(hasAnyDetail || displayImg) && (
            <div className="product-gallery-details">
              {detailSlots.map((img, i) =>
                img ? (
                  <button
                    key={i}
                    className={`product-gallery-detail-thumb${activeImg === img ? ' product-gallery-detail-thumb--active' : ''}`}
                    onClick={() => setActiveImg(activeImg === img ? null : img)}
                    aria-label={`Detail photo ${i + 1}`}
                  >
                    <img src={img} alt={`${product.title} detail ${i + 1}`} />
                  </button>
                ) : (
                  <div key={i} className="product-gallery-detail-empty" />
                )
              )}
            </div>
          )}
        </div>

        {/* ── Right: info ── */}
        <div className="product-detail-info">
          <span className="product-tag">{product.tag}</span>
          <h1 className="product-detail-name">{product.title}</h1>
          <div className="product-detail-price-row">
            <p className="product-detail-price">
              {showUSD && product.priceUSD != null
                ? `$${product.priceUSD.toFixed(2)}`
                : product.price}
            </p>
            {product.priceUSD != null && (
              <select
                className="detail-currency-select"
                value={showUSD ? 'USD' : 'IDR'}
                onChange={(e) => setShowUSD(e.target.value === 'USD')}
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
            )}
          </div>

          <div className="product-detail-divider" />

          <p className="product-detail-desc">{product.description}</p>

          {(() => {
            const points = Array.isArray(product.material)
              ? product.material
              : [product.material]
            return (
              <>
                <button
                  className={`product-detail-meta${materialOpen ? ' product-detail-meta--open' : ''}`}
                  onClick={() => setMaterialOpen((o) => !o)}
                >
                  <span>{pd.material}</span>
                  <span className="product-detail-meta-right">
                    {!materialOpen && (
                      <span className="product-detail-meta-value">{points[0]}{points.length > 1 ? ` +${points.length - 1}` : ''}</span>
                    )}
                    <svg className="product-detail-meta-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                {materialOpen && (
                  <div className="product-detail-meta-body">
                    <ul className="product-material-list">
                      {points.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )
          })()}

          <div className="product-detail-divider" />

          {/* Color selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="color-section">
              <div className="color-section-header">
                <span>{pd.pickColor}</span>
                {selectedColor && (
                  <span className="color-selected-label" style={{ background: selectedColor }} />
                )}
              </div>
              <div className="color-grid">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    className={`color-btn${selectedColor === c ? ' color-btn-active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setSelectedColor(c)}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="product-detail-divider" />

          {/* Size selector */}
          <div className="size-section">
            <div className="size-section-header">
              <span>{pd.pickSize}</span>
              {selectedSize && (
                <span className="size-selected-label">{pd.selected}: {selectedSize}</span>
              )}
            </div>
            <div className={`size-grid${sizeError ? ' size-grid-error' : ''}`}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setSizeError(false) }}
                  className={`size-btn${selectedSize === size ? ' size-btn-active' : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="size-error-msg">{pd.sizeError}</p>
            )}
          </div>

          <div className="product-detail-divider" />

          {/* CTAs */}
          <div className="product-detail-ctas">
            <button
              className="btn-dark product-detail-order-btn"
              onClick={handleAddToCart}
            >
              {pd.addToCart}
            </button>
            <Link href="/contact" className="btn-outline product-detail-contact-btn">
              {pd.contact}
            </Link>
          </div>

        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">{pd.otherProducts}</h2>
          <div className="products-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
