'use client'
import { useState, useMemo, useEffect, useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addPembukuanAction, deletePembukuanAction } from '@/lib/actions'
import type { PembukuanEntry } from '@/lib/pembukuan-constants'
import { PEMASUKAN_CATEGORIES, PENGELUARAN_CATEGORIES } from '@/lib/pembukuan-constants'
import AdminSelect from '@/components/AdminSelect'
import AdminDatePicker from '@/components/AdminDatePicker'

type Filter = 'semua' | 'pemasukan' | 'pengeluaran'
type Mode = 'monthly' | 'yearly'

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const START_YEAR = 2023

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

type Props = {
  entries: PembukuanEntry[]
  year: number
  month: number
  mode: Mode
  adminName: string
}

export default function PembukuanClient({ entries, year, month, mode, adminName }: Props) {
  const router = useRouter()
  const now = new Date()
  const currentYear = now.getFullYear()

  const [filter, setFilter] = useState<Filter>('semua')
  const [formType, setFormType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [dateValue, setDateValue] = useState(
    `${year}-${String(month).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  )
  const [categoryValue, setCategoryValue] = useState(PEMASUKAN_CATEGORIES[0])
  const [state, formAction, pending] = useActionState(addPembukuanAction, {})
  const [deletingId, startDelete] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const categories = formType === 'pemasukan' ? PEMASUKAN_CATEGORIES : PENGELUARAN_CATEGORIES

  useEffect(() => {
    setCategoryValue(categories[0])
  }, [formType]) // eslint-disable-line react-hooks/exhaustive-deps
  const years = Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => currentYear - i)

  function navigate(params: { year?: number; month?: number; mode?: Mode }) {
    const y = params.year ?? year
    const m = params.month ?? month
    const md = params.mode ?? mode
    if (md === 'yearly') {
      router.push(`/admin/pembukuan?mode=yearly&year=${y}`)
    } else {
      router.push(`/admin/pembukuan?year=${y}&month=${m}`)
    }
  }

  // ── Summary ──
  const totalPemasukan = useMemo(
    () => entries.filter(e => e.type === 'pemasukan').reduce((s, e) => s + e.amount, 0),
    [entries],
  )
  const totalPengeluaran = useMemo(
    () => entries.filter(e => e.type === 'pengeluaran').reduce((s, e) => s + e.amount, 0),
    [entries],
  )
  const saldo = totalPemasukan - totalPengeluaran

  // ── Yearly breakdown per month ──
  const yearlyRows = useMemo(() => {
    if (mode !== 'yearly') return []
    return MONTHS.map((label, idx) => {
      const m = idx + 1
      const monthEntries = entries.filter(e => new Date(e.date + 'T00:00:00').getMonth() + 1 === m)
      const masuk = monthEntries.filter(e => e.type === 'pemasukan').reduce((s, e) => s + e.amount, 0)
      const keluar = monthEntries.filter(e => e.type === 'pengeluaran').reduce((s, e) => s + e.amount, 0)
      const isFuture = year === currentYear && m > now.getMonth() + 1
      return { m, label, masuk, keluar, saldo: masuk - keluar, count: monthEntries.length, isFuture }
    })
  }, [entries, mode, year, currentYear, now])

  // ── Monthly filtered list ──
  const displayed = useMemo(
    () => filter === 'semua' ? entries : entries.filter(e => e.type === filter),
    [entries, filter],
  )

  // ── Shared tab style ──
  function tabStyle(active: boolean, activeColor = '#0d0d0d') {
    return {
      padding: '0.4rem 1rem',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer' as const,
      fontWeight: 600,
      fontSize: '0.82rem',
      transition: 'all 0.12s',
      background: active ? '#fff' : 'transparent',
      color: active ? activeColor : '#999',
      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Mode toggle (Monthly / Yearly) ── */}
      <div style={{ display: 'flex', gap: '0.4rem', background: '#f5f3ef', padding: '0.3rem', borderRadius: 12, width: 'fit-content' }}>
        {(['monthly', 'yearly'] as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => navigate({ mode: m })}
            style={tabStyle(mode === m)}
          >
            {m === 'monthly' ? 'Monthly' : 'Yearly'}
          </button>
        ))}
      </div>

      {/* ── Period picker card ── */}
      <div style={{
        background: '#fff',
        border: '1px solid #ebebeb',
        borderRadius: 16,
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        {/* Year dropdown */}
        <div style={{ width: 100 }}>
          <AdminSelect
            value={String(year)}
            onChange={v => navigate({ year: parseInt(v) })}
            options={years.map(y => ({ value: String(y), label: String(y) }))}
          />
        </div>

        {/* Month buttons — only in monthly mode */}
        {mode === 'monthly' && (
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {MONTHS.map((label, idx) => {
              const m = idx + 1
              const isActive = m === month
              const isFuture = year === currentYear && m > now.getMonth() + 1
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => !isFuture && navigate({ month: m })}
                  disabled={isFuture}
                  style={{
                    padding: '0.38rem 0.8rem',
                    borderRadius: 7,
                    border: isActive ? 'none' : '1.5px solid #e5e5e5',
                    background: isActive ? '#0d0d0d' : 'transparent',
                    color: isActive ? '#fff' : isFuture ? '#ccc' : '#444',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    transition: 'all 0.12s',
                    minWidth: 40,
                  }}
                  onMouseOver={e => {
                    if (!isActive && !isFuture) {
                      e.currentTarget.style.background = '#f4f4f4'
                      e.currentTarget.style.color = '#0d0d0d'
                    }
                  }}
                  onMouseOut={e => {
                    if (!isActive && !isFuture) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#444'
                    }
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {mode === 'yearly' && (
          <span style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 500 }}>
            Ringkasan per bulan — {year}
          </span>
        )}
      </div>

      {/* ── Summary cards ── */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0 }}>
        <div className="admin-stat-card" style={{ borderTop: '3px solid #10b981' }}>
          <div className="admin-stat-label">Total Pemasukan</div>
          <div style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.35rem' }}>
            {rpCompact(totalPemasukan)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.15rem' }}>
            {entries.filter(e => e.type === 'pemasukan').length} transaksi
          </div>
        </div>
        <div className="admin-stat-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div className="admin-stat-label">Total Pengeluaran</div>
          <div style={{ color: '#ef4444', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.35rem' }}>
            {rpCompact(totalPengeluaran)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.15rem' }}>
            {entries.filter(e => e.type === 'pengeluaran').length} transaksi
          </div>
        </div>
        <div className="admin-stat-card" style={{ borderTop: `3px solid ${saldo >= 0 ? '#f47c2f' : '#ef4444'}` }}>
          <div className="admin-stat-label">Saldo Bersih</div>
          <div style={{ color: saldo >= 0 ? '#f47c2f' : '#ef4444', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.35rem' }}>
            {saldo < 0 ? '−' : ''}{rpCompact(Math.abs(saldo))}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.15rem' }}>
            {entries.length} total transaksi
          </div>
        </div>
      </div>

      {/* ── Monthly: Add entry form ── */}
      {mode === 'monthly' && (
        <div>
          <div style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Tambah Transaksi</h2>
            <span style={{ fontSize: '0.78rem', color: '#aaa', display: 'block', marginTop: '2px' }}>
              Catat pemasukan atau pengeluaran baru
            </span>
          </div>
          <div className="admin-form-card" style={{ borderColor: '#f0ede7' }}>
            <form action={formAction}>
              {state.error && (
                <div className="admin-error" style={{ marginBottom: '0.75rem' }}>{state.error}</div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                <div className="admin-form-group" style={{ flex: '0 0 auto', margin: 0 }}>
                  <label>Tipe</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {(['pemasukan', 'pengeluaran'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormType(t)}
                        style={{
                          padding: '0.7rem 0.9rem',
                          borderRadius: 10,
                          border: '1.5px solid',
                          borderColor: formType === t ? (t === 'pemasukan' ? '#10b981' : '#ef4444') : '#e5e5e5',
                          background: formType === t ? (t === 'pemasukan' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)') : 'transparent',
                          color: formType === t ? (t === 'pemasukan' ? '#059669' : '#dc2626') : '#888',
                          fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.12s',
                        }}
                      >
                        {t === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="type" value={formType} />
                </div>

                <div className="admin-form-group" style={{ flex: '1 1 180px', margin: 0 }}>
                  <label>Tanggal</label>
                  <AdminDatePicker
                    name="date"
                    value={dateValue}
                    onChange={setDateValue}
                  />
                </div>

                <div className="admin-form-group" style={{ flex: '1 1 180px', margin: 0 }}>
                  <label>Kategori</label>
                  <AdminSelect
                    name="category"
                    value={categoryValue}
                    onChange={setCategoryValue}
                    options={categories.map(c => ({ value: c, label: c }))}
                  />
                </div>

                <div className="admin-form-group" style={{ flex: '2 1 200px', margin: 0 }}>
                  <label>Keterangan</label>
                  <input className="admin-form-input" name="description" placeholder="cth. Pembelian kain batik 10 meter" />
                </div>

                <div className="admin-form-group" style={{ flex: '1 1 150px', margin: 0 }}>
                  <label>Jumlah (Rp)</label>
                  <input className="admin-form-input" name="amount" type="number" min="1" placeholder="cth. 500000" required />
                </div>

                <div className="admin-form-group" style={{ flex: '1 1 150px', margin: 0 }}>
                  <label>Catatan <span style={{ color: '#bbb' }}>(opsional)</span></label>
                  <input className="admin-form-input" name="note" placeholder="tambahan info" />
                </div>

                <div className="admin-form-group" style={{ flex: '0 0 auto', margin: 0 }}>
                  <label>Diisi oleh</label>
                  <div className="admin-form-input" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: '#f8f6f2', cursor: 'default', borderColor: '#ece9e3', width: 'auto',
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
                  <button type="submit" className="btn-admin-primary" disabled={pending} style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {pending ? 'Menyimpan...' : '+ Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Yearly: monthly breakdown table ── */}
      {mode === 'yearly' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Ringkasan Bulanan — {year}</h2>
            <span style={{ fontSize: '0.78rem', color: '#aaa', display: 'block', marginTop: '2px' }}>
              Klik bulan untuk lihat detail transaksi
            </span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th style={{ color: '#059669' }}>Pemasukan</th>
                  <th style={{ color: '#dc2626' }}>Pengeluaran</th>
                  <th>Saldo</th>
                  <th>Transaksi</th>
                </tr>
              </thead>
              <tbody>
                {yearlyRows.map(row => (
                  <tr
                    key={row.m}
                    style={{ cursor: row.isFuture ? 'default' : 'pointer', opacity: row.isFuture ? 0.4 : 1 }}
                    onClick={() => !row.isFuture && navigate({ mode: 'monthly', month: row.m })}
                  >
                    <td style={{ fontWeight: 600 }}>{row.label} {year}</td>
                    <td style={{ color: row.masuk > 0 ? '#059669' : '#ccc', fontWeight: row.masuk > 0 ? 600 : 400 }}>
                      {row.masuk > 0 ? `+ ${rp(row.masuk)}` : '—'}
                    </td>
                    <td style={{ color: row.keluar > 0 ? '#dc2626' : '#ccc', fontWeight: row.keluar > 0 ? 600 : 400 }}>
                      {row.keluar > 0 ? `− ${rp(row.keluar)}` : '—'}
                    </td>
                    <td style={{
                      fontWeight: 700,
                      color: row.count === 0 ? '#ccc' : row.saldo >= 0 ? '#f47c2f' : '#dc2626',
                    }}>
                      {row.count === 0 ? '—' : `${row.saldo >= 0 ? '+' : '−'} ${rp(Math.abs(row.saldo))}`}
                    </td>
                    <td style={{ color: '#888', fontSize: '0.82rem' }}>
                      {row.count === 0 ? '—' : `${row.count} entri`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#fafaf9', borderTop: '2px solid #ebebeb' }}>
                  <td style={{ fontWeight: 700, fontSize: '0.875rem' }}>Total {year}</td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>
                    {totalPemasukan > 0 ? `+ ${rp(totalPemasukan)}` : '—'}
                  </td>
                  <td style={{ fontWeight: 700, color: '#dc2626' }}>
                    {totalPengeluaran > 0 ? `− ${rp(totalPengeluaran)}` : '—'}
                  </td>
                  <td style={{ fontWeight: 700, color: saldo >= 0 ? '#f47c2f' : '#dc2626' }}>
                    {`${saldo >= 0 ? '+' : '−'} ${rp(Math.abs(saldo))}`}
                  </td>
                  <td style={{ color: '#888', fontSize: '0.82rem' }}>{entries.length} entri</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Monthly: Entries table ── */}
      {mode === 'monthly' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                Daftar Transaksi — {MONTHS[month - 1]} {year}
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#aaa', display: 'block', marginTop: '2px' }}>
                {entries.length} entri
              </span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem', background: '#f5f3ef', padding: '0.3rem', borderRadius: 10 }}>
              {(['semua', 'pemasukan', 'pengeluaran'] as Filter[]).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.35rem 0.85rem', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.12s',
                    background: filter === f ? '#fff' : 'transparent',
                    color: filter === f ? (f === 'pemasukan' ? '#059669' : f === 'pengeluaran' ? '#dc2626' : '#0d0d0d') : '#999',
                    boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {f === 'semua' ? 'Semua' : f === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tipe</th>
                  <th>Kategori</th>
                  <th>Keterangan</th>
                  <th>Jumlah</th>
                  <th>Catatan</th>
                  <th>Diisi oleh</th>
                  <th style={{ width: 80 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#bbb', padding: '2.5rem', fontSize: '0.875rem' }}>
                      Belum ada transaksi untuk bulan ini.
                    </td>
                  </tr>
                ) : displayed.map(e => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {new Date(e.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className="admin-badge" style={{
                        background: e.type === 'pemasukan' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: e.type === 'pemasukan' ? '#059669' : '#dc2626',
                        fontWeight: 600,
                      }}>
                        {e.type === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{e.category}</td>
                    <td style={{ color: '#555', fontSize: '0.83rem' }}>{e.description ?? '—'}</td>
                    <td style={{ fontWeight: 700, color: e.type === 'pemasukan' ? '#059669' : '#dc2626', whiteSpace: 'nowrap' }}>
                      {e.type === 'pengeluaran' ? '− ' : '+ '}{rp(e.amount)}
                    </td>
                    <td style={{ color: '#888', fontSize: '0.8rem' }}>{e.note ?? '—'}</td>
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
                          if (!confirm('Hapus transaksi ini?')) return
                          setDeleteTarget(e.id)
                          startDelete(() => { deletePembukuanAction(e.id).then(() => setDeleteTarget(null)) })
                        }}
                      >
                        {deleteTarget === e.id && deletingId ? '...' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
