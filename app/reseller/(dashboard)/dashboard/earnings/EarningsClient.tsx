'use client'
import { useState } from 'react'
import type { ResellerOrder, ResellerLevel } from '@/lib/resellers'

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const parseIDR = (s: string) => {
  const cleaned = s.replace(/[^0-9]/g, '')
  return cleaned === '' ? 0 : Math.min(Number(cleaned), 999_999_999_999)
}

const fmtInput = (n: number) =>
  n === 0 ? '' : n.toLocaleString('id-ID')

const STATUS_LABEL: Record<string, string> = {
  pending:    'Menunggu',
  confirmed:  'Terkonfirmasi',
  processing: 'Diproses',
  shipped:    'Dikirim',
  delivered:  'Selesai',
  cancelled:  'Dibatalkan',
}

const LEVEL_CONFIG: Record<ResellerLevel, { label: string; color: string; bg: string; next: ResellerLevel | null; threshold: number; nextThreshold: number; defaultRate: number }> = {
  bronze: { label: 'Bronze', color: '#b45309', bg: '#fef3c7', next: 'silver', threshold: 0,          nextThreshold: 10_000_000, defaultRate: 2.5 },
  silver: { label: 'Silver', color: '#475569', bg: '#f1f5f9', next: 'gold',   threshold: 10_000_000, nextThreshold: 50_000_000, defaultRate: 5 },
  gold:   { label: 'Gold',   color: '#b45309', bg: '#fefce8', next: null,     threshold: 50_000_000, nextThreshold: 50_000_000, defaultRate: 7 },
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

export default function EarningsClient({
  orders, level,
  totalCommission, pendingCommission, totalOmset,
  totalDelivered, avgCommission, monthly,
}: Props) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [yearFilter, setYearFilter]     = useState('all')

  // Simulator state — input: target omset → output: estimated commission
  const [simOmsetRaw, setSimOmsetRaw] = useState('5.000.000')

  const simOmset = parseIDR(simOmsetRaw)
  const simComm  = Math.round(simOmset * (LEVEL_CONFIG[level].defaultRate / 100))

  const lvlNext = LEVEL_CONFIG[level].next

  const lvl     = LEVEL_CONFIG[level]
  const omsetForLevel = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalPrice, 0)
  const progressPct = lvl.next
    ? Math.min(100, Math.round(((omsetForLevel - lvl.threshold) / (lvl.nextThreshold - lvl.threshold)) * 100))
    : 100

  const maxBar = Math.max(...monthly.map(m => m.commission), 1)

  const years = [...new Set(orders.map(o => new Date(o.createdAt).getFullYear()))].sort((a, b) => b - a)

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

      {/* ── Level ── */}
      <div className="earn-level-card">
        <div className="earn-level-left">
          <span className="earn-level-badge" style={{ background: lvl.bg, color: lvl.color }}>
            {level === 'bronze' ? '🥉' : level === 'silver' ? '🥈' : '🥇'} {lvl.label}
          </span>
          <div>
            <p className="earn-level-title">Level Reseller Kamu</p>
            {lvl.next ? (
              <p className="earn-level-sub">
                Butuh {IDR(lvl.nextThreshold - omsetForLevel)} omset lagi untuk naik ke <strong>{LEVEL_CONFIG[lvl.next].label}</strong>
              </p>
            ) : (
              <p className="earn-level-sub">Kamu sudah di level tertinggi! 🎉</p>
            )}
          </div>
        </div>
        <div className="earn-level-right">
          <div className="earn-level-bar-wrap">
            <div className="earn-level-bar-track">
              <div className="earn-level-bar-fill" style={{ width: `${progressPct}%`, background: lvl.color }} />
            </div>
            <div className="earn-level-bar-labels">
              <span>{IDR(lvl.threshold)}</span>
              {lvl.next && <span>{IDR(lvl.nextThreshold)}</span>}
            </div>
          </div>
          <p className="earn-level-pct">{progressPct}%{lvl.next ? ` menuju ${LEVEL_CONFIG[lvl.next].label}` : ' (Maksimal)'}</p>
        </div>
      </div>

      {/* ── Chart + Breakdown side by side ── */}
      <div className="earn-grid-2">

        {/* Bar Chart */}
        <div className="earn-card">
          <p className="earn-card-title">Komisi 12 Bulan Terakhir</p>
          <div className="earn-bar-chart">
            {monthly.map(m => (
              <div key={m.key} className="earn-bar-col">
                <span className="earn-bar-val">{m.commission > 0 ? IDR(m.commission).replace('Rp ', '').replace(/\.000$/, 'rb') : ''}</span>
                <div className="earn-bar-track">
                  <div
                    className="earn-bar-fill"
                    style={{ height: `${Math.round((m.commission / maxBar) * 100)}%` }}
                  />
                  {m.pending > 0 && (
                    <div
                      className="earn-bar-fill earn-bar-fill--pending"
                      style={{ height: `${Math.round((m.pending / maxBar) * 100)}%` }}
                    />
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

        {/* Monthly table */}
        <div className="earn-card">
          <p className="earn-card-title">Breakdown Bulanan</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="earn-table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Order</th>
                  <th>Omset</th>
                  <th>Komisi</th>
                </tr>
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

      {/* ── Simulator ── */}
      <div className="earn-card earn-sim-card">
        <div className="earn-sim-header">
          <div>
            <p className="earn-card-title" style={{ margin: 0 }}>Simulasi Penghasilan</p>
            <p className="earn-sim-sub">Hitung estimasi komisi berdasarkan target penjualan</p>
          </div>
        </div>

        <div className="earn-sim-body">
          <div className="earn-sim-row">
            {/* Level pill */}
            <div className="earn-sim-level-pill" style={{ background: lvl.bg, borderColor: lvl.color + '55' }}>
              <span className="earn-sim-level-icon">
                {level === 'bronze' ? '🥉' : level === 'silver' ? '🥈' : '🥇'}
              </span>
              <div className="earn-sim-level-info">
                <span className="earn-sim-level-name" style={{ color: lvl.color }}>{lvl.label}</span>
                <span className="earn-sim-level-desc">Level kamu saat ini</span>
              </div>
            </div>

            {/* Input card */}
            <div className="earn-sim-field">
              <div className="earn-sim-input-row">
                <span className="earn-sim-rp">Rp</span>
                <input
                  className="earn-sim-input"
                  type="text"
                  inputMode="numeric"
                  value={simOmsetRaw}
                  onChange={e => setSimOmsetRaw(fmtInput(parseIDR(e.target.value)) || '')}
                  placeholder="5.000.000"
                />
              </div>
              <div className="admin-stat-label">Omset Reseller</div>
            </div>

            {/* Result: estimasi komisi */}
            <div className="admin-stat-card">
              <div className="admin-stat-num earn-num--green">{simComm > 0 ? IDR(simComm) : '—'}</div>
              <div className="admin-stat-label">Estimasi Komisi</div>
            </div>

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
                  <th>Tanggal</th>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Omset</th>
                  <th>Komisi</th>
                  <th>Status</th>
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
                  <td colSpan={4} style={{ fontWeight: 700, fontSize: '0.82rem', paddingTop: '0.75rem' }}>
                    {filtered.length} pesanan
                  </td>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {IDR(filtered.reduce((s, o) => s + o.totalPrice, 0))}
                  </td>
                  <td style={{ fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
                    {IDR(filtered.reduce((s, o) => s + o.commission, 0))}
                  </td>
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
