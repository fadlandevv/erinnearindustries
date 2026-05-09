'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { createCheckoutOrder } from '@/lib/actions'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (r: unknown) => void
        onPending?: (r: unknown) => void
        onError?: (r: unknown) => void
        onClose?: () => void
      }) => void
    }
  }
}

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''
const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
const SNAP_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

type Props = {
  userInfo?: { name: string; email: string } | null
}

export default function CheckoutForm({ userInfo }: Props) {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) { setError('Keranjang kosong'); return }
    setLoading(true)
    setError('')

    const formData = new FormData(formRef.current!)
    formData.set('cart', JSON.stringify(items))

    const result = await createCheckoutOrder(formData)
    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      return
    }

    const { orderId, snapToken } = result
    setLoading(false)

    window.snap.pay(snapToken, {
      onSuccess: () => { clearCart(); router.push(`/checkout/success?order_id=${orderId}`) },
      onPending: () => { clearCart(); router.push(`/checkout/pending?order_id=${orderId}`) },
      onError: () => setError('Pembayaran gagal. Silakan coba lagi.'),
      onClose: () => setError('Pembayaran dibatalkan.'),
    })
  }

  if (!items.length) {
    return (
      <div className="checkout-empty">
        <div className="checkout-empty-icon">🛒</div>
        <p>Keranjang belanja kamu masih kosong.</p>
        <Link href="/product" className="btn-dark">Lihat Produk</Link>
      </div>
    )
  }

  return (
    <>
      <Script src={SNAP_URL} data-client-key={CLIENT_KEY} strategy="afterInteractive" />

      <div className="checkout-grid">
        {/* ── Form ── */}
        <form ref={formRef} onSubmit={handleSubmit} className="checkout-form-card">

          <div className="checkout-form-section">
            <div className="checkout-form-section-label">
              <span className="checkout-step-num">1</span>
              <h2 className="checkout-section-title">Informasi Pemesan</h2>
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label htmlFor="co-name">Nama Lengkap *</label>
                <input id="co-name" name="name" type="text" required
                  placeholder="Budi Santoso" className="checkout-input"
                  defaultValue={userInfo?.name ?? ''} />
              </div>
              <div className="checkout-form-group">
                <label htmlFor="co-email">Email *</label>
                <input id="co-email" name="email" type="email" required
                  placeholder="budi@email.com" className="checkout-input"
                  defaultValue={userInfo?.email ?? ''} />
              </div>
            </div>

            <div className="checkout-form-group">
              <label htmlFor="co-phone">No. HP / WhatsApp *</label>
              <input id="co-phone" name="phone" type="tel" required
                placeholder="08xxxxxxxxxx" className="checkout-input" />
            </div>
          </div>

          <div className="checkout-form-divider" />

          <div className="checkout-form-section">
            <div className="checkout-form-section-label">
              <span className="checkout-step-num">2</span>
              <h2 className="checkout-section-title">Alamat Pengiriman</h2>
            </div>

            <div className="checkout-form-group">
              <label htmlFor="co-address">Alamat Lengkap *</label>
              <textarea id="co-address" name="address" required rows={3}
                placeholder="Jl. Sudirman No. 10, RT 01 RW 02..." className="checkout-textarea" />
            </div>

            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label htmlFor="co-city">Kota / Kabupaten *</label>
                <input id="co-city" name="city" type="text" required
                  placeholder="Jakarta Selatan" className="checkout-input" />
              </div>
              <div className="checkout-form-group">
                <label htmlFor="co-postal">Kode Pos *</label>
                <input id="co-postal" name="postalCode" type="text" required
                  placeholder="12190" className="checkout-input" maxLength={10} />
              </div>
            </div>

            <div className="checkout-form-group">
              <label htmlFor="co-notes">Catatan (opsional)</label>
              <textarea id="co-notes" name="notes" rows={2}
                placeholder="Instruksi khusus untuk kurir..." className="checkout-textarea" />
            </div>
          </div>

          <button type="submit" className="checkout-pay-btn" disabled={loading}>
            {loading && <span className="checkout-spinner" />}
            {loading ? 'Memproses...' : 'Lanjut ke Pembayaran →'}
          </button>

          <p className="checkout-secure-note">🔒 Pembayaran aman diproses oleh Midtrans</p>
        </form>

        {/* ── Summary ── */}
        <aside className="checkout-summary">
          <h2 className="checkout-section-title">Ringkasan Pesanan</h2>

          <div className="checkout-summary-items">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="checkout-summary-item">
                <div className="checkout-summary-visual" style={{ background: item.product.bg }}>
                  <span className="checkout-summary-qty">×{item.quantity}</span>
                </div>
                <div className="checkout-summary-info">
                  <span className="checkout-summary-name">{item.product.title}</span>
                  <span className="checkout-summary-meta">Ukuran {item.size}</span>
                </div>
                <span className="checkout-summary-price">
                  {formatRupiah(item.quantity * parseInt(item.product.price.replace(/\D/g,'')))}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatRupiah(totalPrice)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Ongkos Kirim</span>
            <span className="checkout-free-ship">✓ Gratis</span>
          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-summary-total">
            <span>Total Pembayaran</span>
            <strong>{formatRupiah(totalPrice)}</strong>
          </div>

          <div className="checkout-payment-methods">
            <p className="checkout-pm-label">Metode Pembayaran</p>
            <div className="checkout-pm-list">
              {['Transfer Bank','GoPay','OVO','DANA','QRIS','Kartu Kredit','Alfamart','Indomaret'].map(m => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
