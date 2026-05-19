'use client'
import { useState } from 'react'
import type { ResellerOrder, ResellerLevel } from '@/lib/resellers'

type InvoiceRow = {
  id: number
  tanggal: string
  invoice: string
  project: string
  pic: string
  qty: string
  totalRaw: string
}

let nextId = 1
const emptyRow = (): InvoiceRow => ({ id: nextId++, tanggal: '', invoice: '', project: '', pic: '', qty: '', totalRaw: '' })

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const parseIDR = (s: string) => {
  const cleaned = s.replace(/[^0-9]/g, '')
  return cleaned === '' ? 0 : Math.min(Number(cleaned), 999_999_999_999)
}

const fmtInput = (n: number) => n === 0 ? '' : n.toLocaleString('id-ID')

const LEVEL_CONFIG: Record<ResellerLevel, { label: string; color: string; bg: string; next: ResellerLevel | null; threshold: number; nextThreshold: number; defaultRate: number }> = {
  bronze: { label: 'Bronze', color: '#b45309', bg: '#fef3c7', next: 'silver', threshold: 0,          nextThreshold: 45_000_000, defaultRate: 2.5 },
  silver: { label: 'Silver', color: '#475569', bg: '#f1f5f9', next: 'gold',   threshold: 45_000_000, nextThreshold: 50_000_000, defaultRate: 5   },
  gold:   { label: 'Gold',   color: '#b45309', bg: '#fefce8', next: null,     threshold: 50_000_000, nextThreshold: 50_000_000, defaultRate: 7   },
}

type Props = {
  orders: ResellerOrder[]
  level: ResellerLevel
}

export default function InsentifClient({ orders, level }: Props) {
  const [simOmsetRaw, setSimOmsetRaw] = useState('5.000.000')
  const [rows, setRows] = useState<InvoiceRow[]>([emptyRow()])

  function updateRow(id: number, field: keyof InvoiceRow, value: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  function updateTotal(id: number, raw: string) {
    const cleaned = raw.replace(/[^0-9]/g, '')
    const formatted = cleaned === '' ? '' : Number(cleaned).toLocaleString('id-ID')
    setRows(prev => prev.map(r => r.id === id ? { ...r, totalRaw: formatted } : r))
  }

  function addRow() { setRows(prev => [...prev, emptyRow()]) }
  function removeRow(id: number) { setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev) }

  const totalQty   = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0)
  const totalPrice = rows.reduce((s, r) => s + parseIDR(r.totalRaw), 0)

  const lvl           = LEVEL_CONFIG[level]
  const omsetForLevel = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalPrice, 0)
  const progressPct   = lvl.next
    ? Math.min(100, Math.round(((omsetForLevel - lvl.threshold) / (lvl.nextThreshold - lvl.threshold)) * 100))
    : 100

  const simOmset = parseIDR(simOmsetRaw)
  const simComm  = Math.round(simOmset * (lvl.defaultRate / 100))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Print area wraps both cards ── */}
      <div className="insentif-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Invoice Table */}
      <div className="earn-card">
        <div className="earn-card-header">
          <p className="earn-card-title">Tabel Invoice</p>
          <button className="insentif-add-btn no-print" onClick={addRow}>+ Tambah Baris</button>
        </div>
        <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
          <table className="earn-table insentif-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tanggal</th>
                <th>No. Invoice</th>
                <th>Nama Project</th>
                <th>Nama PIC</th>
                <th>Jumlah Item</th>
                <th>Total Harga</th>
                <th className="no-print" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ color: '#bbb', fontSize: '0.75rem', width: '2rem' }}>{i + 1}</td>
                  <td><input className="insentif-cell" type="date" value={row.tanggal} onChange={e => updateRow(row.id, 'tanggal', e.target.value)} /></td>
                  <td><input className="insentif-cell" placeholder="INV-001" value={row.invoice} onChange={e => updateRow(row.id, 'invoice', e.target.value)} /></td>
                  <td><input className="insentif-cell" placeholder="Nama project" value={row.project} onChange={e => updateRow(row.id, 'project', e.target.value)} /></td>
                  <td><input className="insentif-cell" placeholder="Nama PIC" value={row.pic} onChange={e => updateRow(row.id, 'pic', e.target.value)} /></td>
                  <td>
                    <input
                      className="insentif-cell insentif-cell--num"
                      placeholder="0"
                      value={row.qty}
                      onChange={e => updateRow(row.id, 'qty', e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </td>
                  <td>
                    <div className="insentif-price-wrap">
                      <span className="insentif-rp">Rp</span>
                      <input
                        className="insentif-cell insentif-cell--num"
                        placeholder="0"
                        inputMode="numeric"
                        value={row.totalRaw}
                        onChange={e => updateTotal(row.id, e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="no-print">
                    <button className="insentif-del-btn" onClick={() => removeRow(row.id)} title="Hapus">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ fontWeight: 700, fontSize: '0.82rem', paddingTop: '0.75rem' }}>Total</td>
                <td style={{ fontWeight: 700 }}>{totalQty > 0 ? totalQty : '—'}</td>
                <td style={{ fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
                  {totalPrice > 0 ? IDR(totalPrice) : '—'}
                </td>
                <td className="no-print" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Omset Reseller (simulator) ── */}
      <div className="earn-card earn-sim-card">
        <div className="earn-sim-header">
          <div>
            <p className="earn-card-title" style={{ margin: 0 }}>Omset Reseller</p>
          </div>
        </div>

        <div className="earn-sim-body">
          <div className="earn-sim-row">
            <div className="earn-sim-level-pill" style={{ background: lvl.bg, borderColor: lvl.color + '55' }}>
              <span className="earn-sim-level-icon">
                {level === 'bronze' ? '🥉' : level === 'silver' ? '🥈' : '🥇'}
              </span>
              <div className="earn-sim-level-info">
                <span className="earn-sim-level-name" style={{ color: lvl.color }}>{lvl.label}</span>
                <span className="earn-sim-level-desc">Level kamu saat ini</span>
              </div>
            </div>

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

            <div className="admin-stat-card">
              <div className="admin-stat-num earn-num--green">{simComm > 0 ? IDR(simComm) : '—'}</div>
              <div className="admin-stat-label">Estimasi Komisi</div>
            </div>
          </div>
        </div>
      </div>

      </div>{/* end insentif-print-area */}

    </div>
  )
}
