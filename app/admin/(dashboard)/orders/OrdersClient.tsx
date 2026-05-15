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
const statusClass: Record<string, string> = {
  pending:    'order-badge-pending',
  paid:       'order-badge-paid',
  processing: 'order-badge-processing',
  shipped:    'order-badge-shipped',
  delivered:  'order-badge-delivered',
  failed:     'order-badge-failed',
  expired:    'order-badge-expired',
}
const allStatuses: Order['status'][] = [
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'failed', 'expired',
]
const IDX = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

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
        <span>Diskusi #{orderId.slice(-6).toUpperCase()}</span>
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
    </>
  )
}

export default function OrdersClient({ orders, userMap, allMessages }: Props) {
  const [search, setSearch]     = useState('')
  const [year, setYear]         = useState('all')
  const [month, setMonth]       = useState('all')
  const [sort, setSort]         = useState<'newest' | 'oldest'>('newest')
  const [source, setSource]     = useState<'all' | 'reseller' | 'customer'>('all')
  const [chatOrderId, setChatOrderId] = useState<string | null>(null)

  const [unreadMap, setUnreadMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const msg of allMessages) {
      if (msg.sender === 'customer' && !msg.isRead) {
        map[msg.orderId] = (map[msg.orderId] ?? 0) + 1
      }
    }
    return map
  })

  function openChat(orderId: string) {
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

    if (year !== 'all')
      res = res.filter(o => new Date(o.createdAt).getFullYear() === Number(year))

    if (month !== 'all')
      res = res.filter(o => new Date(o.createdAt).getMonth() === Number(month))

    const q = search.trim().toUpperCase()
    if (q)
      res = res.filter(o =>
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

  function handleYearChange(v: string) {
    setYear(v)
    setMonth('all')
  }

  const isFiltering = search || year !== 'all' || month !== 'all' || source !== 'all'

  return (
    <>
      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: '0.6rem', flexWrap: 'wrap',
        marginBottom: '1rem', alignItems: 'center',
      }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari ID pesanan atau nama..."
          className="admin-search-input"
          style={{ flex: '1 1 200px', minWidth: 0 }}
        />
        <select value={source} onChange={e => setSource(e.target.value as typeof source)} className="admin-select-inline">
          <option value="all">Semua Tipe</option>
          <option value="customer">Customer</option>
          <option value="reseller">Reseller</option>
        </select>
        <select value={year} onChange={e => handleYearChange(e.target.value)} className="admin-select-inline">
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

      {/* Result count */}
      {isFiltering && (
        <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.75rem' }}>
          {filtered.length} dari {orders.length} pesanan
        </p>
      )}

      <div className="admin-orders-wrapper">

        {/* Chat side panel — left */}
        {chatOrderId && (
          <div className="admin-orders-side">
            <AdminChatPanel orderId={chatOrderId} onClose={() => setChatOrderId(null)} />
          </div>
        )}

        {/* Table */}
        <div className="admin-table-wrap" style={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0 ? (
            <p className="admin-empty">
              {orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan yang cocok'}
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 34 }} />
                  <th>ID Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Item</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const unread = unreadMap[order.id] ?? 0
                  const isActive = chatOrderId === order.id
                  return (
                    <tr key={order.id}>
                      <td style={{ padding: '0.4rem 0.25rem', verticalAlign: 'middle' }}>
                        <button
                          type="button"
                          className={`oh-chat-btn${isActive ? ' oh-chat-btn--active' : ''}${unread > 0 && !isActive ? ' oh-chat-btn--unread' : ''}`}
                          onClick={() => openChat(order.id)}
                          aria-label="Diskusi"
                        >
                          {unread > 0 && !isActive && (
                            <span className="oh-chat-btn-badge">{unread}</span>
                          )}
                          {isActive ? (
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                              <path d="M9 3L4 7.5 9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                              <path
                                d="M2 2.5C2 1.67 2.67 1 3.5 1h8C12.33 1 13 1.67 13 2.5v7c0 .83-.67 1.5-1.5 1.5H5.5L2 13V2.5z"
                                stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.78rem', color: '#555' }}>
                          {order.id.slice(-6).toUpperCase()}
                        </code>
                      </td>
                      <td style={{ maxWidth: '140px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.customer.name}
                        </div>
                        {order.customer.email.endsWith('@reseller.internal') ? (
                          <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            ◈ {order.customer.notes?.replace('via reseller: ', '') ?? 'Reseller'}
                          </div>
                        ) : userMap[order.customer.email.toLowerCase()] ? (
                          <div style={{ fontSize: '0.72rem', color: '#aaa', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            #{userMap[order.customer.email.toLowerCase()].slice(-8).toUpperCase()}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: '#555' }}>
                          {order.items.map(i => `${i.title} (${i.size}) ×${i.quantity}`).join(', ')}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Rp {order.totalPrice.toLocaleString('id-ID')}
                      </td>
                      <td>
                        <span className={`admin-badge ${statusClass[order.status] ?? ''}`}>
                          {statusLabel[order.status] ?? order.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#777', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <form action={updateOrderStatusFormAction} className="admin-order-status-form">
                          <input type="hidden" name="orderId" value={order.id} />
                          <select name="status" defaultValue={order.status} className="admin-order-status-select">
                            {allStatuses.map(s => (
                              <option key={s} value={s}>{statusLabel[s]}</option>
                            ))}
                          </select>
                          <button type="submit" className="admin-order-status-btn">✓</button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  )
}
