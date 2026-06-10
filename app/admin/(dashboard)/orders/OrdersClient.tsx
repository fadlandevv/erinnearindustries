'use client'
import React, { useState, useMemo, useActionState, useEffect, useRef } from 'react'
import type { Order } from '@/lib/orders'
import type { OrderMessage } from '@/lib/order-messages'
import { updateOrderStatusFormAction, adminSendOrderMessageAction, getOrderMessagesAction, adminMarkOrderMessagesReadAction } from '@/lib/actions'

const statusLabel: Record<string, string> = {
  pending:    'Menunggu',
  paid:       'Dibayar',
  processing: 'Diproses',
  shipped:    'Dikirim',
  delivered:  'Selesai',
  failed:     'Gagal',
  expired:    'Kedaluwarsa',
}
const statusCls: Record<string, string> = {
  pending:    'oh-badge-pending',
  paid:       'oh-badge-paid',
  processing: 'oh-badge-processing',
  shipped:    'oh-badge-shipped',
  delivered:  'oh-badge-delivered',
  failed:     'oh-badge-failed',
  expired:    'oh-badge-expired',
}
const allStatuses: Order['status'][] = [
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'failed', 'expired',
]
const IDX = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const fmtChatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
  ' · ' + new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

type Props = {
  orders: Order[]
  userMap: Record<string, string>
  allMessages: OrderMessage[]
}

function AdminChatPanel({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [state, action, isPending] = useActionState(adminSendOrderMessageAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    getOrderMessagesAction(orderId).then(msgs => { setMessages(msgs); setLoading(false) })
    adminMarkOrderMessagesReadAction(orderId)
  }, [orderId])

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset()
      getOrderMessagesAction(orderId).then(setMessages)
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
          {loading ? (
            <p className="od-chat-empty">Memuat...</p>
          ) : messages.length === 0 ? (
            <p className="od-chat-empty">Belum ada pesan untuk pesanan ini.</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`od-chat-msg od-chat-msg--${msg.sender}`}>
                <div className="od-chat-bubble">{msg.message}</div>
                <div className="od-chat-msg-foot">
                  <span className="od-chat-meta">{msg.senderName} · {fmtChatTime(msg.createdAt)}</span>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {state?.error && <p className="od-chat-error">{state.error}</p>}

        <form ref={formRef} action={action} className="od-chat-form">
          <input type="hidden" name="orderId" value={orderId} />
          <input name="message" type="text" className="od-chat-input" placeholder="Balas pesan..." maxLength={500} required />
          <button type="submit" className="od-chat-send" disabled={isPending}>
            {isPending ? '...' : 'Kirim'}
          </button>
        </form>
      </div>
    </>
  )
}

export default function OrdersClient({ orders, userMap, allMessages }: Props) {
  const [search, setSearch]   = useState('')
  const [year, setYear]       = useState('all')
  const [month, setMonth]     = useState('all')
  const [sort, setSort]       = useState<'newest' | 'oldest'>('newest')
  const [source, setSource]   = useState<'all' | 'reseller' | 'customer'>('all')
  const [chatOrderId, setChatOrderId] = useState<string | null>(null)
  const [openOrders, setOpenOrders]   = useState<Set<string>>(new Set())

  const [unreadMap, setUnreadMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const msg of allMessages) {
      if (msg.sender === 'customer' && !msg.isRead) {
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

  const isReseller = (o: Order) => o.customer.email.endsWith('@reseller.internal')

  const years = useMemo(() => {
    const ys = new Set(orders.map(o => new Date(o.createdAt).getFullYear()))
    return [...ys].sort((a, b) => b - a)
  }, [orders])

  const months = useMemo(() => {
    const src = year === 'all' ? orders : orders.filter(o => new Date(o.createdAt).getFullYear() === Number(year))
    const ms = new Set(src.map(o => new Date(o.createdAt).getMonth()))
    return [...ms].sort((a, b) => a - b)
  }, [orders, year])

  const filtered = useMemo(() => {
    let res = [...orders]
    if (source === 'reseller') res = res.filter(isReseller)
    if (source === 'customer') res = res.filter(o => !isReseller(o))
    if (year !== 'all') res = res.filter(o => new Date(o.createdAt).getFullYear() === Number(year))
    if (month !== 'all') res = res.filter(o => new Date(o.createdAt).getMonth() === Number(month))
    const q = search.trim().toUpperCase()
    if (q) res = res.filter(o =>
      o.id.slice(-6).toUpperCase().includes(q) ||
      o.id.toUpperCase().includes(q) ||
      o.customer.name.toUpperCase().includes(q)
    )
    res.sort((a, b) => {
      const d = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sort === 'newest' ? -d : d
    })
    return res
  }, [orders, year, month, sort, search, source])

  const isFiltering = search || year !== 'all' || month !== 'all' || source !== 'all'

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari ID pesanan atau nama..."
          className="admin-search-input" style={{ flex: '1 1 200px', minWidth: 0 }}
        />
        <select value={source} onChange={e => setSource(e.target.value as typeof source)} className="admin-select-inline">
          <option value="all">Semua Tipe</option>
          <option value="customer">Customer</option>
          <option value="reseller">Reseller</option>
        </select>
        <select value={year} onChange={e => { setYear(e.target.value); setMonth('all') }} className="admin-select-inline">
          <option value="all">Semua Tahun</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)} className="admin-select-inline">
          <option value="all">Semua Bulan</option>
          {months.map(m => <option key={m} value={m}>{IDX[m]}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as 'newest' | 'oldest')} className="admin-select-inline">
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </select>
      </div>

      {isFiltering && (
        <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.75rem' }}>
          {filtered.length} dari {orders.length} pesanan
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="admin-empty">
          {orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan yang cocok'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(order => {
            const isOpen   = openOrders.has(order.id)
            const chatOpen = chatOrderId === order.id
            const unread   = unreadMap[order.id] ?? 0
            const st       = statusCls[order.status] ?? ''

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
                    <AdminChatPanel orderId={order.id} onClose={() => setChatOrderId(null)} />
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
                      <div style={{ fontSize: '0.82rem', color: '#555', fontWeight: 500, marginTop: '0.15rem' }}>
                        {order.customer.name}
                        {isReseller(order) && (
                          <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
                            ◈ {order.customer.notes?.replace('via reseller: ', '') ?? 'Reseller'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="oh-card-head-right">
                      <span className={`oh-badge ${st}`}>{statusLabel[order.status] ?? order.status}</span>
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
                      <div className="oh-items">
                        {order.items.map((item, i) => (
                          <div key={i} className="oh-item">
                            <div className="oh-item-visual" style={{ background: item.bg }} />
                            <div className="oh-item-info">
                              <span className="oh-item-name">{item.title}</span>
                              <span className="oh-item-meta">Ukuran <strong>{item.size}</strong> · {item.quantity} pcs</span>
                              {(item.customDesignDepan || item.customDesignBelakang) && (
                                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                  {item.customDesignDepan && (
                                    <a href={item.customDesignDepan} target="_blank" rel="noopener noreferrer"
                                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#555', border: '1px solid #e5e5e5', borderRadius: 6, padding: '2px 7px', background: '#fafafa', textDecoration: 'none' }}>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={item.customDesignDepan} alt="desain depan" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
                                      Depan ↗
                                    </a>
                                  )}
                                  {item.customDesignBelakang && (
                                    <a href={item.customDesignBelakang} target="_blank" rel="noopener noreferrer"
                                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#555', border: '1px solid #e5e5e5', borderRadius: 6, padding: '2px 7px', background: '#fafafa', textDecoration: 'none' }}>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={item.customDesignBelakang} alt="desain belakang" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
                                      Belakang ↗
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="oh-item-price">
                              Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="oh-card-foot">
                        <div className="oh-ship-info">
                          <span className="oh-ship-label">Alamat Pengiriman</span>
                          <span className="oh-ship-addr">
                            {order.customer.address}, {order.customer.city} {order.customer.postalCode}
                          </span>
                        </div>
                        <div className="oh-card-foot-right">
                          <strong style={{ fontSize: '0.95rem' }}>
                            Rp {order.totalPrice.toLocaleString('id-ID')}
                          </strong>
                          <form action={updateOrderStatusFormAction} className="admin-order-status-form">
                            <input type="hidden" name="orderId" value={order.id} />
                            <select name="status" defaultValue={order.status} className="admin-order-status-select">
                              {allStatuses.map(s => (
                                <option key={s} value={s}>{statusLabel[s]}</option>
                              ))}
                            </select>
                            <button type="submit" className="admin-order-status-btn">✓</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
