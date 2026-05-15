'use client'
import { useState, useActionState, useEffect, useRef } from 'react'
import type { ResellerOrder } from '@/lib/resellers'
import type { OrderMessage } from '@/lib/order-messages'
import {
  resellerSendOrderMessageAction,
  resellerGetOrderMessagesAction,
  resellerMarkOrderMessagesReadAction,
} from '@/lib/actions'

const statusCls: Record<string, string> = {
  pending:    'oh-badge-pending',
  confirmed:  'oh-badge-paid',
  processing: 'oh-badge-processing',
  shipped:    'oh-badge-shipped',
  delivered:  'oh-badge-delivered',
  cancelled:  'oh-badge-failed',
}
const statusLabel: Record<string, string> = {
  pending:    'Menunggu',
  confirmed:  'Terkonfirmasi',
  processing: 'Diproses',
  shipped:    'Dikirim',
  delivered:  'Selesai',
  cancelled:  'Dibatalkan',
}

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtChatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
  ' · ' + new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

type Props = { orders: ResellerOrder[]; initialMessages: OrderMessage[] }

function ResellerChatPanel({ orderId, initialMessages, onClose }: {
  orderId: string
  initialMessages: OrderMessage[]
  onClose: () => void
}) {
  const [messages, setMessages] = useState<OrderMessage[]>(initialMessages)
  const [state, action, isPending] = useActionState(resellerSendOrderMessageAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    resellerMarkOrderMessagesReadAction(orderId)
  }, [orderId])

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset()
      resellerGetOrderMessagesAction(orderId).then(setMessages)
    }
  }, [state])

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length])

  return (
    <>
      <div className="oh-chat-layer-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>#{orderId.slice(-6).toUpperCase()}</span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', lineHeight: 1, padding: 0 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="od-chat-bare">
        <div className="od-chat-body">
          {messages.length === 0 ? (
            <p className="od-chat-empty">Belum ada pesan. Tanyakan sesuatu!</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`od-chat-msg od-chat-msg--${msg.sender}`}>
                <div className="od-chat-bubble">{msg.message}</div>
                <div className="od-chat-msg-foot">
                  <span className="od-chat-meta">{msg.senderName} · {fmtChatTime(msg.createdAt)}</span>
                  {msg.sender === 'customer' && (
                    <span className={`od-msg-status${msg.isRead ? ' od-msg-status--read' : ''}`}>
                      {msg.isRead ? '✓✓ Dibaca' : '✓ Terkirim'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {state?.error && <p className="od-chat-error">{state.error}</p>}

        <form ref={formRef} action={action} className="od-chat-form">
          <input type="hidden" name="orderId" value={orderId} />
          <input name="message" type="text" className="od-chat-input" placeholder="Tulis pesan..." maxLength={500} required />
          <button type="submit" className="od-chat-send" disabled={isPending}>
            {isPending ? '...' : 'Kirim'}
          </button>
        </form>
      </div>
    </>
  )
}

export default function ResellerOrdersClient({ orders, initialMessages }: Props) {
  const [chatOrderId, setChatOrderId] = useState<string | null>(null)
  const [openOrders, setOpenOrders]   = useState<Set<string>>(new Set())

  const messagesMap = Object.fromEntries(
    orders.map(o => [o.id, initialMessages.filter(m => m.orderId === o.id)])
  ) as Record<string, OrderMessage[]>

  const [unreadMap, setUnreadMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const msg of initialMessages) {
      if (msg.sender === 'admin' && !msg.isRead) {
        map[msg.orderId] = (map[msg.orderId] ?? 0) + 1
      }
    }
    return map
  })

  function toggleOrder(orderId: string) {
    setOpenOrders(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
        if (chatOrderId === orderId) setChatOrderId(null)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  function toggleChat(orderId: string) {
    setChatOrderId(id => {
      if (id === orderId) return null
      setUnreadMap(m => ({ ...m, [orderId]: 0 }))
      return orderId
    })
  }

  if (orders.length === 0) {
    return (
      <div className="oh-empty">
        <div className="oh-empty-icon">📦</div>
        <p>Belum ada pesanan</p>
        <span>Buat pesanan pertama untuk memulai</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {orders.map(order => {
        const isOpen   = openOrders.has(order.id)
        const chatOpen = chatOrderId === order.id
        const unread   = unreadMap[order.id] ?? 0
        const msgs     = messagesMap[order.id] ?? []

        return (
          <div className="oh-card-wrapper" key={order.id}>

            {/* Chat icon column */}
            <div className="oh-chat-icon-col">
              <button
                type="button"
                className={`oh-chat-btn${chatOpen ? ' oh-chat-btn--active' : ''}${!isOpen ? ' oh-chat-btn--muted' : ''}${unread > 0 && !chatOpen ? ' oh-chat-btn--unread' : ''}`}
                onClick={() => toggleChat(order.id)}
                disabled={!isOpen}
                aria-label="Diskusi"
              >
                {unread > 0 && !chatOpen && <span className="oh-chat-btn-badge">{unread}</span>}
                {chatOpen ? (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M9 3L4 7.5 9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2 2.5C2 1.67 2.67 1 3.5 1h8C12.33 1 13 1.67 13 2.5v7c0 .83-.67 1.5-1.5 1.5H5.5L2 13V2.5z"
                      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Chat panel */}
            {isOpen && chatOpen && (
              <div className="oh-chat-layer">
                <ResellerChatPanel
                  orderId={order.id}
                  initialMessages={msgs}
                  onClose={() => setChatOrderId(null)}
                />
              </div>
            )}

            {/* Main card */}
            <div className="oh-card">

              {/* Header — always visible */}
              <div className="oh-card-head">
                <div className="oh-card-head-left">
                  <div className="oh-card-head-info">
                    <code className="oh-order-id">{order.id.slice(-6).toUpperCase()}</code>
                    <span className="oh-order-date">{fmtDate(order.createdAt)}</span>
                  </div>
                </div>
                <div className="oh-card-head-right">
                  <span className={`oh-badge ${statusCls[order.status] ?? ''}`}>
                    {statusLabel[order.status] ?? order.status}
                  </span>
                  <button
                    type="button"
                    className="oh-detail-toggle"
                    onClick={() => toggleOrder(order.id)}
                    aria-expanded={isOpen}
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                    >
                      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Detail — collapsible */}
              {isOpen && (
                <div className="oh-card-body-fill">

                  {/* Customer info */}
                  <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid #f4f4f4', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Penerima</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.customerName}</span>
                    {order.customerPhone && <span style={{ fontSize: '0.78rem', color: '#888', wordBreak: 'break-word' }}>{order.customerPhone}</span>}
                    {order.customerAddress && <span style={{ fontSize: '0.78rem', color: '#888', wordBreak: 'break-word' }}>{order.customerAddress}</span>}
                    {order.note && (
                      <span style={{ fontSize: '0.78rem', color: '#aaa', fontStyle: 'italic', marginTop: '0.15rem', wordBreak: 'break-word' }}>
                        Catatan: {order.note}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="oh-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="oh-item">
                        <div className="oh-item-visual" style={{ background: '#f0ede8' }} />
                        <div className="oh-item-info">
                          <span className="oh-item-name">{item.title}</span>
                          <span className="oh-item-meta">Ukuran <strong>{item.size}</strong> · {item.qty} pcs</span>
                        </div>
                        <span className="oh-item-price">{IDR(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="oh-card-foot">
                    <div className="oh-card-foot-right">
                      {order.commission > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginRight: 'auto' }}>
                          <span className="oh-ship-label">Komisi</span>
                          <strong style={{ fontSize: '0.9rem', color: '#16a34a' }}>{IDR(order.commission)}</strong>
                        </div>
                      )}
                      <div className="oh-total-wrap">
                        <span className="oh-total-label">Total</span>
                        <strong className="oh-total-num">{IDR(order.totalPrice)}</strong>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )
      })}
    </div>
  )
}
