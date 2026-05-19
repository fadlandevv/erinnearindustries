'use client'
import { useState } from 'react'
import type { ResellerOrder, ResellerLevel } from '@/lib/resellers'

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_LABEL: Record<string, string> = {
  pending:    'Menunggu',
  confirmed:  'Terkonfirmasi',
  processing: 'Diproses',
  shipped:    'Dikirim',
  delivered:  'Selesai',
  cancelled:  'Dibatalkan',
}

export type MonthStat = {
  key: string
  label: string
  orders: number
  omset: number
  commission: number
  pending: number
}

type Props = {
  orders: ResellerOrder[]
  level: ResellerLevel
  totalCommission: number
  pendingCommission: number
  totalOmset: number
  totalDelivered: number
  avgCommission: number
  monthly: MonthStat[]
}

export default function GrafikClient({
  orders, totalCommission, pendingCommission, totalOmset,
  totalDelivered, avgCommission, monthly,
}: Props) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [yearFilter, setYearFilter]     = useState('all')

  const maxBar = Math.max(...monthly.map(m => m.commission), 1)
  const years  = [...new Set(orders.map(o => new Date(o.createdAt).getFullYear()))].sort((a, b) => b - a)

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (yearFilter !== 'all' && new Date(o.createdAt).getFullYear() !== Number(yearFilter)) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Stats ── */}
      <div className="admin-stats-grid admin-stats-4col">
        <div className="admin-stat-card">
          <div className="admin-stat-num earn-num--green">{IDR(totalCommission)}</div>
          <div className="admin-stat-label">Total Komisi Diterima</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num earn-num--amber">{pendingCommission > 0 ? IDR(pendingCommission) : '—'}</div>
          <div className="admin-stat-label">Komisi Pending</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num earn-num--blue">{IDR(totalOmset)}</div>
          <div className="admin-stat-label">Total Omset Terkonfirmasi</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{totalDelivered > 0 ? IDR(avgCommission) : '—'}</div>
          <div className="admin-stat-label">Rata-rata Komisi / Order</div>
        </div>
      </div>

      {/* ── Chart + Breakdown ── */}
      <div className="earn-grid-2">
        <div className="earn-card">
          <p className="earn-card-title">Komisi 12 Bulan Terakhir</p>
          <div className="earn-bar-chart">
            {monthly.map(m => (
              <div key={m.key} className="earn-bar-col">
                <span className="earn-bar-val">{m.commission > 0 ? IDR(m.commission).replace('Rp ', '').replace(/\.000$/, 'rb') : ''}</span>
                <div className="earn-bar-track">
                  <div className="earn-bar-fill" style={{ height: `${Math.round((m.commission / maxBar) * 100)}%` }} />
                  {m.pending > 0 && (
                    <div className="earn-bar-fill earn-bar-fill--pending" style={{ height: `${Math.round((m.pending / maxBar) * 100)}%` }} />
                  )}
                </div>
                <span className="earn-bar-label">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="earn-bar-legend">
            <span className="earn-legend-dot earn-legend-dot--green" /> Komisi diterima
            <span className="earn-legend-dot earn-legend-dot--amber" style={{ marginLeft: '1rem' }} /> Pending
          </div>
        </div>

        <div className="earn-card">
          <p className="earn-card-title">Breakdown Bulanan</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="earn-table">
              <thead>
                <tr><th>Bulan</th><th>Order</th><th>Omset</th><th>Komisi</th></tr>
              </thead>
              <tbody>
                {[...monthly].reverse().filter(m => m.orders > 0).map(m => (
                  <tr key={m.key}>
                    <td style={{ fontWeight: 600 }}>{m.label}</td>
                    <td style={{ color: '#888' }}>{m.orders}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{IDR(m.omset)}</td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 700, color: '#16a34a' }}>
                      {m.commission > 0 ? IDR(m.commission) : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                  </tr>
                ))}
                {monthly.every(m => m.orders === 0) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#bbb', padding: '1.5rem' }}>Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Detail Orders ── */}
      <div className="earn-card">
        <div className="earn-card-header">
          <p className="earn-card-title">Riwayat Detail</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select className="admin-select-inline" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Semua Status</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="admin-select-inline" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="all">Semua Tahun</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#bbb', fontSize: '0.85rem', padding: '1rem 0' }}>Tidak ada data.</p>
          ) : (
            <table className="earn-table">
              <thead>
                <tr>
                  <th>Tanggal</th><th>ID</th><th>Customer</th>
                  <th>Items</th><th>Omset</th><th>Komisi</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}>
                    <td style={{ whiteSpace: 'nowrap', color: '#888', fontSize: '0.8rem' }}>{fmtDate(order.createdAt)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#aaa' }}>{order.id.slice(-6).toUpperCase()}</td>
                    <td style={{ fontWeight: 500 }}>{order.customerName}</td>
                    <td>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', color: '#777' }}>
                          {item.title} · {item.size} ×{item.qty}
                        </div>
                      ))}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{IDR(order.totalPrice)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {order.commission > 0
                        ? <strong style={{ color: '#16a34a' }}>{IDR(order.commission)}</strong>
                        : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td>
                      <span className={`admin-badge rs-order-status-${order.status}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ fontWeight: 700, fontSize: '0.82rem', paddingTop: '0.75rem' }}>{filtered.length} pesanan</td>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{IDR(filtered.reduce((s, o) => s + o.totalPrice, 0))}</td>
                  <td style={{ fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>{IDR(filtered.reduce((s, o) => s + o.commission, 0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
