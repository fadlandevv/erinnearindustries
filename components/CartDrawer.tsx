'use client'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } =
    useCart()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop${isOpen ? ' cart-backdrop-open' : ''}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={`cart-drawer${isOpen ? ' cart-drawer-open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <span className="cart-title">Keranjang</span>
            {totalItems > 0 && (
              <span className="cart-count-badge">{totalItems}</span>
            )}
          </div>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Tutup keranjang">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍</div>
              <p>Keranjang masih kosong</p>
              <span>Tambahkan produk untuk mulai berbelanja</span>
            </div>
          ) : (
            <ul className="cart-list">
              {items.map((item) => (
                <li key={`${item.product.id}-${item.size}`} className="cart-item">
                  <div
                    className="cart-item-visual"
                    style={{ background: item.product.bg }}
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.product.title}</span>
                    <div className="cart-item-meta">
                      <span className="cart-item-size">{item.size}</span>
                      <span className="cart-item-price">{item.product.price}</span>
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-qty">
                        <button
                          className="cart-qty-btn"
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="cart-qty-num">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        aria-label="Hapus item"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total</span>
              <strong>{formatRupiah(totalPrice)}</strong>
            </div>
            <Link
              href="/checkout"
              className="cart-checkout-btn"
              onClick={closeCart}
            >
              Checkout →
            </Link>
            <button className="cart-clear-btn" onClick={clearCart}>
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </>
  )
}
