'use client'
import { useState } from 'react'
import { lookupOrders } from '@/lib/actions'
import type { Order } from '@/lib/orders'

const statusLabel: Record<string, string> = {
  pending:  'Menunggu Pembayaran',
  paid:     'Dibayar',
  failed:   'Gagal',
  expired:  'Kedaluwarsa',
}
const statusClass: Record<string, string> = {
  pending:  'oh-badge-pending',
  paid:     'oh-badge-paid',
  failed:   'oh-badge-failed',
  expired:  'oh-badge-expired',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [searched, setSearched] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    fd.set('email', email)
    const result = await lookupOrders(fd)
    setOrders(result)
    setSearched(email)
    setLoading(false)
  }

  return (
    <>
      {/* Search form */}
      <form onSubmit={handleSubmit} className="oh-search-card">
        <div className="oh-search-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            className="oh-search-input"
          />
          <button type="submit" className="oh-search-btn" disabled={loading}>
            {loading ? <span className="checkout-spinner" /> : 'Cari Pesanan'}
          </button>
        </div>
      </form>

      {/* Results */}
      {orders !== null && (
        <div className="oh-results">
          {orders.length === 0 ? (
            <div className="oh-empty">
              <p>Tidak ada pesanan untuk <strong>{searched}</strong></p>
              <span>Pastikan email yang kamu masukkan sudah benar</span>
            </div>
          ) : (
            <>
              <p className="oh-result-count">
                {orders.length} pesanan ditemukan untuk <strong>{searched}</strong>
              </p>
              <div className="oh-list">
                {orders.map((order) => (
                  <div key={order.id} className="oh-card">
                    {/* Card header */}
                    <div className="oh-card-head">
                      <div className="oh-card-head-left">
                        <span className="oh-order-id">{order.id.slice(-6).toUpperCase()}</span>
                        <span className="oh-order-date">{formatDate(order.createdAt)}</span>
                      </div>
                      <span className={`oh-badge ${statusClass[order.status]}`}>
                        {statusLabel[order.status] ?? order.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="oh-items">
                      {order.items.map((item, i) => (
                        <div key={i} className="oh-item">
                          <div className="oh-item-visual" style={{ background: item.bg }} />
                          <div className="oh-item-info">
                            <span className="oh-item-name">{item.title}</span>
                            <span className="oh-item-meta">
                              Ukuran {item.size} · ×{item.quantity}
                            </span>
                          </div>
                          <span className="oh-item-price">
                            Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Card footer */}
                    <div className="oh-card-foot">
                      <div className="oh-ship-info">
                        <span className="oh-ship-label">Dikirim ke</span>
                        <span className="oh-ship-addr">
                          {order.customer.address}, {order.customer.city} {order.customer.postalCode}
                        </span>
                      </div>
                      <div className="oh-total">
                        <span>Total</span>
                        <strong>Rp {order.totalPrice.toLocaleString('id-ID')}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
