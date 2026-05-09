'use client'
import { useState, useMemo } from 'react'
import type { Order } from '@/lib/orders'
import { updateOrderStatusFormAction } from '@/lib/actions'

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

type Props = {
  orders: Order[]
  userMap: Record<string, string>
}

export default function OrdersClient({ orders, userMap }: Props) {
  const [search, setSearch]     = useState('')
  const [year, setYear]         = useState('all')
  const [month, setMonth]       = useState('all')
  const [sort, setSort]         = useState<'newest' | 'oldest'>('newest')

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
  }, [orders, year, month, sort, search])

  function handleYearChange(v: string) {
    setYear(v)
    setMonth('all')
  }

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
      {(search || year !== 'all' || month !== 'all') && (
        <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.75rem' }}>
          {filtered.length} dari {orders.length} pesanan
        </p>
      )}

      <div className="admin-table-wrap">
        {filtered.length === 0 ? (
          <p className="admin-empty">
            {orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan yang cocok'}
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
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
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <code style={{ fontSize: '0.78rem', color: '#555' }}>
                      {order.id.slice(-6).toUpperCase()}
                    </code>
                  </td>
                  <td style={{ maxWidth: '140px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.customer.name}
                    </div>
                    {userMap[order.customer.email.toLowerCase()] && (
                      <div style={{ fontSize: '0.72rem', color: '#aaa', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        #{userMap[order.customer.email.toLowerCase()].slice(-8).toUpperCase()}
                      </div>
                    )}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
