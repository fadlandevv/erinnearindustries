'use client'
import { useState, useMemo, useEffect, useActionState, useTransition } from 'react'
import { addManualEntryAction, deleteManualEntryAction } from '@/lib/actions'
import type { PeriodRow, ManualEntry } from '@/lib/rekap'

type Tab = 'mingguan' | 'bulanan' | 'tahunan'

type Props = {
  mingguan: PeriodRow[]
  bulanan: PeriodRow[]
  tahunan: PeriodRow[]
  entries: ManualEntry[]
  initialTab: Tab
  adminName: string
}

function rp(n: number) {
  if (n === 0) return '—'
  return 'Rp ' + n.toLocaleString('id-ID')
}

function rpCompact(n: number) {
  if (n === 0) return '—'
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} jt`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} rb`
  return 'Rp ' + n.toLocaleString('id-ID')
}

function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="admin-stat-card" style={{ borderTop: `3px solid ${accent ?? '#e5e1d8'}` }}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value" style={{ color: accent ?? undefined }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  )
}

function BarCell({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 120 }}>
      <div style={{ flex: 1, height: 5, background: '#f0ede7', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#f47c2f', borderRadius: 99, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

function weekKeyToMonday(key: string): Date {
  const [yearStr, weekStr] = key.split('-W')
  const y = parseInt(yearStr), w = parseInt(weekStr)
  const jan4 = new Date(Date.UTC(y, 0, 4))
  const day = jan4.getUTCDay() || 7
  return new Date(Date.UTC(y, 0, 4 - day + 1 + (w - 1) * 7))
}

function weekKeyToMonthKey(key: string): string {
  const d = weekKeyToMonday(key)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

// ── Entries modal ─────────────────────────────────────────────────────────────
function EntriesModal({ entries, onClose }: { entries: ManualEntry[]; onClose: () => void }) {
  const [deletingId, startDelete] = useTransition()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 780,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #f0ede8',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Detail Input Manual</h3>
            <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '0.15rem 0 0' }}>
              {entries.length} entri · Marketplace & Offline
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              width: 32, height: 32,
              borderRadius: '50%',
              border: 'none',
              background: '#f5f3ef',
              color: '#888',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#ebe8e2')}
            onMouseOut={e => (e.currentTarget.style.background = '#f5f3ef')}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {entries.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#bbb', padding: '3rem', fontSize: '0.875rem' }}>
              Belum ada entri manual.
            </p>
          ) : (
            <table className="admin-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Sumber</th>
                  <th>Platform</th>
                  <th>Jumlah</th>
                  <th>Catatan</th>
                  <th>Diisi oleh</th>
                  <th style={{ width: 70 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(e.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span
                        className="admin-badge"
                        style={{
                          background: e.source === 'marketplace' ? 'rgba(139,92,246,0.1)' : 'rgba(16,185,129,0.1)',
                          color: e.source === 'marketplace' ? '#7c3aed' : '#059669',
                        }}
                      >
                        {e.source === 'marketplace' ? 'Marketplace' : 'Offline'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{e.platform}</td>
                    <td style={{ fontWeight: 600, color: '#f47c2f' }}>{rp(e.amount)}</td>
                    <td style={{ color: '#888', fontSize: '0.82rem' }}>{e.note ?? '—'}</td>
                    <td>
                      {e.filledBy ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{
                            width: 20, height: 20, borderRadius: '50%', background: '#f47c2f',
                            color: '#fff', fontSize: '0.6rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {e.filledBy.charAt(0).toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{e.filledBy}</span>
                        </div>
                      ) : <span style={{ color: '#ccc' }}>—</span>}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-admin-danger"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                        disabled={deletingId}
                        onClick={() => {
                          if (!confirm('Hapus entri ini?')) return
                          startDelete(() => { deleteManualEntryAction(e.id) })
                        }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RekapClient({ mingguan, bulanan, tahunan, entries, initialTab, adminName }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [state, formAction, pending] = useActionState(addManualEntryAction, {})
  const [showModal, setShowModal] = useState(false)

  const currentYear = String(new Date().getFullYear())
  const currentMonthKey = (() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
  })()

  const [weekMonthFilter, setWeekMonthFilter] = useState(currentMonthKey)
  const [bulananYearFilter, setBulananYearFilter] = useState(currentYear)

  // Unique months from the 12-week window (for mingguan filter)
  const monthOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const row of mingguan) {
      const mk = weekKeyToMonthKey(row.key)
      if (!seen.has(mk)) {
        const d = weekKeyToMonday(row.key)
        seen.set(mk, `${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCFullYear()}`)
      }
    }
    return [...seen.entries()].map(([key, label]) => ({ key, label }))
  }, [mingguan])

  // Unique years from bulanan data (for bulanan filter)
  const yearOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const row of bulanan) seen.add(row.key.slice(0, 4))
    return [...seen].sort().map(y => ({ key: y, label: y }))
  }, [bulanan])

  const filteredMingguan = useMemo(
    () => mingguan.filter(r => weekKeyToMonthKey(r.key) === weekMonthFilter),
    [mingguan, weekMonthFilter]
  )

  const filteredBulanan = useMemo(
    () => bulanan.filter(r => r.key.startsWith(bulananYearFilter)),
    [bulanan, bulananYearFilter]
  )

  const rows = tab === 'mingguan' ? filteredMingguan : tab === 'bulanan' ? filteredBulanan : tahunan.slice(-3)

  const totalWeb = rows.reduce((s, r) => s + r.web, 0)
  const totalMarket = rows.reduce((s, r) => s + r.marketplace, 0)
  const totalOffline = rows.reduce((s, r) => s + r.offline, 0)
  const grandTotal = totalWeb + totalMarket + totalOffline
  const maxTotal = Math.max(...rows.map(r => r.total), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Tab switcher ── */}
      <div style={{ display: 'flex', gap: '0.4rem', background: '#f5f3ef', padding: '0.3rem', borderRadius: 12, width: 'fit-content' }}>
        {(['mingguan', 'bulanan', 'tahunan'] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
              transition: 'all 0.15s',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#0d0d0d' : '#999',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Summary cards ── */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <SummaryCard label="Total Pemasukan" value={rpCompact(grandTotal)} accent="#f47c2f" />
        <SummaryCard label="Web" value={rpCompact(totalWeb)} sub={`${rows.reduce((s,r)=>s+r.webOrders,0)} order`} accent="#3b82f6" />
        <SummaryCard label="Marketplace" value={rpCompact(totalMarket)} accent="#8b5cf6" />
        <SummaryCard label="Offline" value={rpCompact(totalOffline)} accent="#10b981" />
      </div>

      {/* ── Input Manual — only on Mingguan tab ── */}
      {tab === 'mingguan' && <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Input Manual</h2>
            <span style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px', display: 'block' }}>Pemasukan dari marketplace & offline</span>
          </div>
          {entries.length > 0 && (
            <button
              type="button"
              className="btn-admin-secondary"
              style={{ marginLeft: 'auto', fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}
              onClick={() => setShowModal(true)}
            >
              Detail ({entries.length})
            </button>
          )}
        </div>

        <div className="admin-form-card" style={{ borderColor: '#f0ede7' }}>
          <form action={formAction}>
            {state.error && <div className="admin-error" style={{ marginBottom: '0.75rem' }}>{state.error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="admin-form-group" style={{ flex: '1 1 130px', margin: 0 }}>
                <label>Tanggal</label>
                <input className="admin-form-input" name="date" type="date" required
                  defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="admin-form-group" style={{ flex: '1 1 130px', margin: 0 }}>
                <label>Sumber</label>
                <select className="admin-form-select" name="source" required>
                  <option value="marketplace">Marketplace</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ flex: '1 1 150px', margin: 0 }}>
                <label>Platform / Tempat</label>
                <select className="admin-form-select" name="platform" required>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ flex: '1 1 150px', margin: 0 }}>
                <label>Jumlah (Rp)</label>
                <input className="admin-form-input" name="amount" type="number" min="1" placeholder="cth. 500000" required />
              </div>
              <div className="admin-form-group" style={{ flex: '1 1 180px', margin: 0 }}>
                <label>Catatan <span style={{ color: '#bbb' }}>(opsional)</span></label>
                <input className="admin-form-input" name="note" placeholder="cth. Flash sale weekend" />
              </div>
              <div className="admin-form-group" style={{ flex: '0 0 auto', margin: 0 }}>
                <label>Diisi oleh</label>
                <div className="admin-form-input" style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: '#f8f6f2', color: '#888', cursor: 'default', userSelect: 'none',
                  borderColor: '#ece9e3', width: 'auto',
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#f47c2f',
                    color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {adminName.charAt(0).toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 500, color: '#555', whiteSpace: 'nowrap' }}>{adminName}</span>
                </div>
              </div>
              <div style={{ flexShrink: 0, paddingBottom: '0.05rem' }}>
                <button type="submit" className="btn-admin-primary" disabled={pending}
                  style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {pending ? 'Menyimpan...' : '+ Simpan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>}

      {/* ── Period data table ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.2, textTransform: 'capitalize' }}>
              Rekap {tab}
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px', display: 'block' }}>Semua sumber digabung per periode</span>
          </div>
          {tab === 'mingguan' && (
            <select className="admin-select-inline" value={weekMonthFilter}
              onChange={e => setWeekMonthFilter(e.target.value)} style={{ marginLeft: 'auto' }}>
              {monthOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          )}
          {tab === 'bulanan' && yearOptions.length > 1 && (
            <select className="admin-select-inline" value={bulananYearFilter}
              onChange={e => setBulananYearFilter(e.target.value)} style={{ marginLeft: 'auto' }}>
              {yearOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Periode</th>
                <th style={{ color: '#3b82f6' }}>Web</th>
                <th style={{ color: '#8b5cf6' }}>Marketplace</th>
                <th style={{ color: '#10b981' }}>Offline</th>
                <th>Total</th>
                <th style={{ width: 140 }}>Proporsi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.label}</div>
                    {row.subLabel && <div style={{ fontSize: '0.72rem', color: '#aaa' }}>{row.subLabel}</div>}
                  </td>
                  <td style={{ color: row.web > 0 ? '#2563eb' : '#ccc', fontWeight: row.web > 0 ? 500 : 400 }}>
                    {rp(row.web)}
                    {row.webOrders > 0 && <div style={{ fontSize: '0.7rem', color: '#93c5fd' }}>{row.webOrders} order</div>}
                  </td>
                  <td style={{ color: row.marketplace > 0 ? '#7c3aed' : '#ccc', fontWeight: row.marketplace > 0 ? 500 : 400 }}>
                    {rp(row.marketplace)}
                  </td>
                  <td style={{ color: row.offline > 0 ? '#059669' : '#ccc', fontWeight: row.offline > 0 ? 500 : 400 }}>
                    {rp(row.offline)}
                  </td>
                  <td style={{ fontWeight: 700, color: row.total > 0 ? '#f47c2f' : '#ccc' }}>
                    {rp(row.total)}
                  </td>
                  <td><BarCell value={row.total} max={maxTotal} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Entries modal ── */}
      {showModal && <EntriesModal entries={entries} onClose={() => setShowModal(false)} />}
    </div>
  )
}
