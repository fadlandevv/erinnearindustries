'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/data'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import ProductCard from './ProductCard'

type SizeChartRow = { panjang: number; lebar: number }

function SizeChartMockup() {
  return (
    <div className="pd-sizechart-mockup">
      <svg viewBox="0 0 158 178" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        {/* T-shirt silhouette */}
        <path
          d="M22,48 L4,28 L0,60 L22,70 L22,158 L122,158 L122,70 L144,60 L140,28 L122,48 C106,36 88,58 72,58 C56,58 38,36 22,48Z"
          className="pd-mockup-shirt"
          strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
        />
        {/* Lebar — horizontal arrow */}
        <line x1="22" y1="112" x2="122" y2="112" className="pd-mockup-line" strokeWidth="1" strokeDasharray="3,2"/>
        <path d="M28,108 L22,112 L28,116" className="pd-mockup-arrow" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M116,108 L122,112 L116,116" className="pd-mockup-arrow" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="72" y="107" textAnchor="middle" fontSize="9" className="pd-mockup-label" fontFamily="system-ui,sans-serif">lebar</text>
        {/* Panjang — vertical arrow */}
        <line x1="136" y1="48" x2="136" y2="158" className="pd-mockup-line" strokeWidth="1" strokeDasharray="3,2"/>
        <path d="M132,54 L136,48 L140,54" className="pd-mockup-arrow" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M132,152 L136,158 L140,152" className="pd-mockup-arrow" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="136" y="107" textAnchor="middle" fontSize="9" className="pd-mockup-label" fontFamily="system-ui,sans-serif"
          transform="rotate(-90,136,103)">panjang</text>
      </svg>
    </div>
  )
}

function parseSizechartRows(raw: string | undefined): [string, SizeChartRow][] {
  if (!raw) return []
  try {
    const chart = JSON.parse(raw) as Record<string, SizeChartRow>
    return Object.entries(chart).filter(([, v]) => v?.panjang || v?.lebar)
  } catch {
    return []
  }
}

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
  const [showUSD, setShowUSD] = useState(false)
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const pd = t.productDetail

  // Pool of all images: main first, then detail images
  const allImages = [
    product.image,
    ...(product.images?.filter((s) => s && s.trim() !== '') ?? []),
  ].filter(Boolean) as string[]

  const [mainIdx, setMainIdx] = useState(0)
  const mainImg = allImages[mainIdx] ?? null

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
            {mainImg ? (
              <img
                key={mainImg}
                src={mainImg}
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

          {/* Thumbnail strip — all images, click to swap with main */}
          {allImages.length > 1 && (
            <div className="product-gallery-details">
              {allImages.map((img, i) => (
                <button
                  key={img}
                  className={`product-gallery-detail-thumb${i === mainIdx ? ' product-gallery-detail-thumb--active' : ''}`}
                  onClick={() => setMainIdx(i)}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={img} alt={`${product.title} ${i + 1}`} />
                </button>
              ))}
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
              <button
                className="detail-currency-toggle"
                onClick={() => setShowUSD((v) => !v)}
                type="button"
              >
                <span className={showUSD ? '' : 'detail-currency-toggle--active'}>IDR</span>
                <span className="detail-currency-toggle-sep" />
                <span className={showUSD ? 'detail-currency-toggle--active' : ''}>USD</span>
              </button>
            )}
          </div>

          <div className="product-detail-divider" />

          <p className="product-detail-desc">{product.description}</p>

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

      {/* Detail Produk */}
      {(product.sizechart || (Array.isArray(product.material) ? product.material.length > 0 : !!product.material)) && (
        <div className="pd-detail-block">
          <h2 className="pd-detail-block-title">Detail Produk</h2>

          {(product.sizechart || (Array.isArray(product.material) ? product.material.length > 0 : !!product.material)) && (
            <div className="pd-detail-grid">
              {(Array.isArray(product.material) ? product.material.length > 0 : !!product.material) && (
                <div className="pd-detail-col">
                  <p className="pd-detail-sub">Material</p>
                  <ul className="pd-detail-material-list">
                    {(Array.isArray(product.material) ? product.material : [product.material]).map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {parseSizechartRows(product.sizechart).length > 0 && (
                <div className="pd-detail-col">
                  <p className="pd-detail-sub">Size Chart</p>
                  <div className="pd-sizechart-wrap">
                    <SizeChartMockup />
                    <table className="pd-sizechart-table">
                      <thead>
                        <tr>
                          <th>Size</th>
                          <th>Panjang</th>
                          <th>Lebar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseSizechartRows(product.sizechart).map(([size, v]) => (
                          <tr key={size}>
                            <td>{size}</td>
                            <td>{v.panjang} cm</td>
                            <td>{v.lebar} cm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
