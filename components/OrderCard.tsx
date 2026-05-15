'use client'
import { useState } from 'react'
import type { Order } from '@/lib/orders'
import type { OrderMessage } from '@/lib/order-messages'
import DeleteOrderButton from './DeleteOrderButton'
import RepayButton from './RepayButton'
import OrderTracker from './OrderTracker'
import OrderChat from './OrderChat'

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Menunggu Pembayaran', cls: 'oh-badge-pending'    },
  paid:       { label: 'Dibayar',             cls: 'oh-badge-paid'       },
  processing: { label: 'Diproses',            cls: 'oh-badge-processing' },
  shipped:    { label: 'Dikirim',             cls: 'oh-badge-shipped'    },
  delivered:  { label: 'Selesai',             cls: 'oh-badge-delivered'  },
  failed:     { label: 'Gagal',               cls: 'oh-badge-failed'     },
  expired:    { label: 'Kedaluwarsa',         cls: 'oh-badge-expired'    },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

type Props = { order: Order; messages: OrderMessage[] }

export default function OrderCard({ order, messages }: Props) {
  const [open, setOpen] = useState(false)
  const st = statusConfig[order.status] ?? { label: order.status, cls: '' }

  return (
    <div className="oh-card">
      {/* Header — always visible */}
      <div className="oh-card-head">
        <div className="oh-card-head-left">
          <code className="oh-order-id">{order.id.slice(-6).toUpperCase()}</code>
          <span className="oh-order-date">{formatDate(order.createdAt)}</span>
        </div>
        <div className="oh-card-head-right">
          <span className={`oh-badge ${st.cls}`}>{st.label}</span>
          {order.status === 'pending' && <RepayButton orderId={order.id} />}
          <button
            type="button"
            className="oh-detail-toggle"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
          >
            {open ? 'Tutup ▲' : 'Lihat Detail ▼'}
          </button>
          <DeleteOrderButton orderId={order.id} />
        </div>
      </div>

      {/* Body — toggled */}
      {open && (
        <>
          {/* Items */}
          <div className="oh-items">
            {order.items.map((item, i) => (
              <div key={i} className="oh-item">
                <div className="oh-item-visual" style={{ background: item.bg }} />
                <div className="oh-item-info">
                  <span className="oh-item-name">{item.title}</span>
                  <span className="oh-item-meta">
                    Ukuran <strong>{item.size}</strong> · {item.quantity} pcs
                  </span>
                </div>
                <span className="oh-item-price">
                  Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>

          {/* Tracking */}
          <OrderTracker status={order.status} />

          {/* Footer */}
          <div className="oh-card-foot">
            <div className="oh-ship-info">
              <span className="oh-ship-label">Alamat Pengiriman</span>
              <span className="oh-ship-addr">
                {order.customer.address}, {order.customer.city} {order.customer.postalCode}
              </span>
            </div>
            <div className="oh-total-wrap">
              <span className="oh-total-label">Total</span>
              <strong className="oh-total-num">
                Rp {order.totalPrice.toLocaleString('id-ID')}
              </strong>
            </div>
          </div>

          {/* Discussion */}
          <OrderChat orderId={order.id} initialMessages={messages} />
        </>
      )}
    </div>
  )
}
