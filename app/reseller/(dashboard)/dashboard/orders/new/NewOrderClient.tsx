'use client'
import { useState, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createResellerOrderAction } from '@/lib/actions'
import { useResellerToast } from '@/context/ResellerToastContext'
import type { Product } from '@/lib/data'

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

type CartItem = {
  productId: string
  title: string
  size: string
  qty: number
  unitPrice: number
  subtotal: number
}

type Props = { products: Product[] }

export default function NewOrderClient({ products }: Props) {
  const { toast } = useResellerToast()
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 — Customer info
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  // Step 2 — Items
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])

  const [state, formAction, isPending] = useActionState(createResellerOrderAction, {})

  useEffect(() => {
    if (!state) return
    if (state.ok) {
      toast('Pesanan berhasil dibuat!')
      router.push('/reseller/dashboard/orders')
    } else if (state.error) {
      toast(state.error, 'error')
    }
  }, [state])

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const availableSizes = selectedProduct?.sizes ?? []
  const unitPrice = selectedProduct?.priceReseller ?? 0

  function addToCart() {
    if (!selectedProduct || !selectedSize || qty < 1) {
      toast('Pilih produk, ukuran, dan qty terlebih dahulu.', 'error')
      return
    }
    if (unitPrice === 0) {
      toast('Produk ini belum memiliki harga reseller.', 'error')
      return
    }
    const existing = cart.findIndex(
      c => c.productId === selectedProductId && c.size === selectedSize
    )
    if (existing >= 0) {
      setCart(prev =>
        prev.map((c, i) =>
          i === existing
            ? { ...c, qty: c.qty + qty, subtotal: (c.qty + qty) * c.unitPrice }
            : c
        )
      )
    } else {
      setCart(prev => [
        ...prev,
        {
          productId: selectedProduct.id,
          title: selectedProduct.title,
          size: selectedSize,
          qty,
          unitPrice,
          subtotal: qty * unitPrice,
        },
      ])
    }
    setQty(1)
    toast(`${selectedProduct.title} (${selectedSize}) ditambahkan`)
  }

  function removeFromCart(idx: number) {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }

  const totalPrice = cart.reduce((s, c) => s + c.subtotal, 0)

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName.trim()) { toast('Nama customer wajib diisi.', 'error'); return }
    setStep(2)
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Buat Pesanan Baru</h1>
          <p className="admin-page-subtitle">Masukkan data customer dan pilih produk</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="rs-steps">
        <button type="button" className={`rs-step-btn${step >= 1 ? ' active' : ''}`}>
          1. Info Customer
        </button>
        <button type="button" className={`rs-step-btn${step >= 2 ? ' active' : ' done'}`}>
          2. Pilih Produk
        </button>
      </div>

      {step === 1 && (
        <div className="admin-form-card">
          <p className="admin-form-section-title">Informasi Customer</p>
          <form onSubmit={handleStep1}>
            <div className="admin-form-group">
              <label htmlFor="customerName">Nama Customer *</label>
              <input
                id="customerName"
                type="text"
                className="admin-form-input"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="customerPhone">No. HP</label>
              <input
                id="customerPhone"
                type="text"
                className="admin-form-input"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="customerAddress">Alamat Pengiriman</label>
              <textarea
                id="customerAddress"
                className="admin-form-textarea"
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                placeholder="Alamat lengkap + kota + kode pos"
                rows={3}
              />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="btn-admin-primary" style={{ background: '#16a34a' }}>
                Lanjut: Pilih Produk →
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="admin-form-card" style={{ marginBottom: '1.25rem' }}>
            <p className="admin-form-section-title">Tambah Item ke Keranjang</p>

            <div className="admin-form-group">
              <label>Produk</label>
              <select
                className="admin-form-select"
                value={selectedProductId}
                onChange={e => { setSelectedProductId(e.target.value); setSelectedSize('') }}
              >
                <option value="">-- Pilih produk --</option>
                {products.filter(p => p.priceReseller != null).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {IDR(p.priceReseller!)}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-grid" style={{ marginBottom: '1rem' }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label>Ukuran</label>
                <select
                  className="admin-form-select"
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                  disabled={!selectedProductId}
                >
                  <option value="">-- Pilih ukuran --</option>
                  {availableSizes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label>Qty</label>
                <input
                  type="number"
                  className="admin-form-input"
                  min={1}
                  value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn-admin-primary"
              style={{ background: '#16a34a' }}
              onClick={addToCart}
            >
              + Tambah ke Keranjang
            </button>
          </div>

          {/* Cart */}
          <div className="admin-form-card">
            <p className="admin-form-section-title">Keranjang Pesanan</p>

            {cart.length === 0 ? (
              <div className="admin-empty" style={{ padding: '1.5rem' }}>
                Belum ada item. Tambahkan produk dari form di atas.
              </div>
            ) : (
              <>
                {cart.map((item, idx) => (
                  <div key={idx} className="rs-cart-item">
                    <div className="rs-cart-item-info">
                      <div className="rs-cart-item-title">{item.title}</div>
                      <div className="rs-cart-item-meta">
                        Ukuran {item.size} × {item.qty} — {IDR(item.unitPrice)}/pcs
                      </div>
                    </div>
                    <div className="rs-cart-item-price">{IDR(item.subtotal)}</div>
                    <button
                      type="button"
                      className="rs-cart-remove"
                      onClick={() => removeFromCart(idx)}
                      aria-label="Hapus item"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div className="rs-cart-total">
                  <span className="rs-cart-total-label">Total Pesanan:</span>
                  <span className="rs-cart-total-value">{IDR(totalPrice)}</span>
                </div>
              </>
            )}

            <form action={formAction} style={{ marginTop: '1.5rem' }}>
              <input type="hidden" name="customerName" value={customerName} />
              <input type="hidden" name="customerPhone" value={customerPhone} />
              <input type="hidden" name="customerAddress" value={customerAddress} />
              <input type="hidden" name="itemsJson" value={JSON.stringify(cart)} />

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setStep(1)}
                >
                  ← Kembali
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  style={{ background: '#16a34a' }}
                  disabled={isPending || cart.length === 0}
                >
                  {isPending ? 'Menyimpan...' : 'Kirim Pesanan →'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  )
}
