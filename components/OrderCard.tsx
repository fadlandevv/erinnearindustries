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
  const [chatOpen, setChatOpen] = useState(false)
  const st = statusConfig[order.status] ?? { label: order.status, cls: '' }

  function toggleChat() {
    if (!chatOpen) setOpen(true)
    setChatOpen(o => !o)
  }

  const adminCount = messages.filter(m => m.sender === 'admin').length

  return (
    <div className="oh-card">
      {/* Header */}
      <div className="oh-card-head">
        <div className="oh-card-head-left">
          {/* Chat button */}
          <button
            type="button"
            className={`oh-chat-btn${chatOpen ? ' oh-chat-btn--active' : ''}`}
            onClick={toggleChat}
            aria-label="Diskusi"
          >
            {adminCount > 0 && !chatOpen && (
              <span className="oh-chat-btn-dot" />
            )}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M2 2.5C2 1.67 2.67 1 3.5 1h8C12.33 1 13 1.67 13 2.5v7c0 .83-.67 1.5-1.5 1.5H5.5L2 13V2.5z"
                stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
              />
            </svg>
          </button>

          <code className="oh-order-id">{order.id.slice(-6).toUpperCase()}</code>
          <span className="oh-order-date">{formatDate(order.createdAt)}</span>
        </div>

        <div className="oh-card-head-right">
          <span className={`oh-badge ${st.cls}`}>{st.label}</span>
          {order.status === 'pending' && <RepayButton orderId={order.id} />}
          <DeleteOrderButton orderId={order.id} />
          <button
            type="button"
            className="oh-detail-toggle"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-label={open ? 'Tutup detail' : 'Lihat detail'}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
            >
              <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className={`oh-card-body${chatOpen ? ' oh-card-body--split' : ''}`}>
          {/* Main details */}
          <div className="oh-card-body-main">
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

            <OrderTracker status={order.status} />

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
          </div>

          {/* Chat panel — right half */}
          {chatOpen && (
            <div className="oh-card-body-chat">
              <p className="oh-card-chat-label">Diskusi</p>
              <OrderChat orderId={order.id} initialMessages={messages} bare />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
