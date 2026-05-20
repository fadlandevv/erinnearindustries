'use client'
import { useState, useMemo, useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addPembukuanAction, deletePembukuanAction } from '@/lib/actions'
import type { PembukuanEntry } from '@/lib/pembukuan-constants'
import { PEMASUKAN_CATEGORIES, PENGELUARAN_CATEGORIES } from '@/lib/pembukuan-constants'

type Filter = 'semua' | 'pemasukan' | 'pengeluaran'

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

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
  adminName: string
}

export default function PembukuanClient({ entries, year, month, adminName }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('semua')
  const [formType, setFormType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [state, formAction, pending] = useActionState(addPembukuanAction, {})
  const [deletingId, startDelete] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const now = new Date()
  const currentYear = now.getFullYear()

  function navigate(y: number, m: number) {
    router.push(`/admin/pembukuan?year=${y}&month=${m}`)
  }

  function prevYear() { navigate(year - 1, month) }
  function nextYear() {
    if (year < currentYear) navigate(year + 1, month)
  }

  const totalPemasukan = useMemo(
    () => entries.filter(e => e.type === 'pemasukan').reduce((s, e) => s + e.amount, 0),
    [entries],
  )
  const totalPengeluaran = useMemo(
    () => entries.filter(e => e.type === 'pengeluaran').reduce((s, e) => s + e.amount, 0),
    [entries],
  )
  const saldo = totalPemasukan - totalPengeluaran

  const displayed = useMemo(
    () => filter === 'semua' ? entries : entries.filter(e => e.type === filter),
    [entries, filter],
  )

  const categories = formType === 'pemasukan' ? PEMASUKAN_CATEGORIES : PENGELUARAN_CATEGORIES

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Month selector (Excel-style) ── */}
      <div style={{
        background: '#fff',
        border: '1px solid #ebebeb',
        borderRadius: 16,
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        {/* Year nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={prevYear}
            style={{
              width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e5e5e5',
              background: 'transparent', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.8rem',
            }}
          >‹</button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 36, textAlign: 'center' }}>{year}</span>
          <button
            type="button"
            onClick={nextYear}
            disabled={year >= currentYear}
            style={{
              width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e5e5e5',
              background: 'transparent', cursor: year < currentYear ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: year < currentYear ? '#555' : '#ccc', fontSize: '0.8rem',
            }}
          >›</button>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#aaa', fontWeight: 500 }}>
            {MONTHS[month - 1]} {year}
          </span>
        </div>

        {/* Month buttons — Excel-style row */}
        <div style={{
          display: 'flex',
          gap: '0.3rem',
          flexWrap: 'wrap',
        }}>
          {MONTHS.map((label, idx) => {
            const m = idx + 1
            const isActive = m === month
            const isFuture = year === currentYear && m > now.getMonth() + 1
            return (
              <button
                key={m}
                type="button"
                onClick={() => !isFuture && navigate(year, m)}
                disabled={isFuture}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 8,
                  border: isActive ? 'none' : '1.5px solid #e5e5e5',
                  background: isActive ? '#0d0d0d' : 'transparent',
                  color: isActive ? '#fff' : isFuture ? '#ccc' : '#444',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: isFuture ? 'not-allowed' : 'pointer',
                  transition: 'all 0.12s',
                  minWidth: 42,
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
      </div>

      {/* ── Summary cards ── */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0 }}>
        <div className="admin-stat-card" style={{ borderTop: '3px solid #10b981' }}>
          <div className="admin-stat-label">Total Pemasukan</div>
          <div className="admin-stat-value" style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.35rem' }}>
            {rpCompact(totalPemasukan)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.15rem' }}>
            {entries.filter(e => e.type === 'pemasukan').length} transaksi
          </div>
        </div>
        <div className="admin-stat-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div className="admin-stat-label">Total Pengeluaran</div>
          <div className="admin-stat-value" style={{ color: '#ef4444', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.35rem' }}>
            {rpCompact(totalPengeluaran)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.15rem' }}>
            {entries.filter(e => e.type === 'pengeluaran').length} transaksi
          </div>
        </div>
        <div className="admin-stat-card" style={{ borderTop: `3px solid ${saldo >= 0 ? '#f47c2f' : '#ef4444'}` }}>
          <div className="admin-stat-label">Saldo Bersih</div>
          <div className="admin-stat-value" style={{ color: saldo >= 0 ? '#f47c2f' : '#ef4444', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.35rem' }}>
            {saldo < 0 ? '-' : ''}{rpCompact(Math.abs(saldo))}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.15rem' }}>
            {entries.length} total transaksi
          </div>
        </div>
      </div>

      {/* ── Add entry form ── */}
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

              {/* Tipe */}
              <div className="admin-form-group" style={{ flex: '0 0 auto', margin: 0 }}>
                <label>Tipe</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {(['pemasukan', 'pengeluaran'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: 8,
                        border: '1.5px solid',
                        borderColor: formType === t
                          ? (t === 'pemasukan' ? '#10b981' : '#ef4444')
                          : '#e5e5e5',
                        background: formType === t
                          ? (t === 'pemasukan' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)')
                          : 'transparent',
                        color: formType === t
                          ? (t === 'pemasukan' ? '#059669' : '#dc2626')
                          : '#888',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                        textTransform: 'capitalize',
                      }}
                    >
                      {t === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="type" value={formType} />
              </div>

              {/* Tanggal */}
              <div className="admin-form-group" style={{ flex: '1 1 130px', margin: 0 }}>
                <label>Tanggal</label>
                <input
                  className="admin-form-input"
                  name="date"
                  type="date"
                  required
                  defaultValue={`${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                />
              </div>

              {/* Kategori */}
              <div className="admin-form-group" style={{ flex: '1 1 160px', margin: 0 }}>
                <label>Kategori</label>
                <select className="admin-form-select" name="category" required>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Keterangan */}
              <div className="admin-form-group" style={{ flex: '2 1 200px', margin: 0 }}>
                <label>Keterangan</label>
                <input
                  className="admin-form-input"
                  name="description"
                  placeholder="cth. Pembelian kain batik 10 meter"
                />
              </div>

              {/* Jumlah */}
              <div className="admin-form-group" style={{ flex: '1 1 150px', margin: 0 }}>
                <label>Jumlah (Rp)</label>
                <input
                  className="admin-form-input"
                  name="amount"
                  type="number"
                  min="1"
                  placeholder="cth. 500000"
                  required
                />
              </div>

              {/* Catatan */}
              <div className="admin-form-group" style={{ flex: '1 1 150px', margin: 0 }}>
                <label>Catatan <span style={{ color: '#bbb' }}>(opsional)</span></label>
                <input className="admin-form-input" name="note" placeholder="tambahan info" />
              </div>

              {/* Diisi oleh */}
              <div className="admin-form-group" style={{ flex: '0 0 auto', margin: 0 }}>
                <label>Diisi oleh</label>
                <div className="admin-form-input" style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: '#f8f6f2', color: '#888', cursor: 'default',
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

              {/* Submit */}
              <div style={{ flexShrink: 0, paddingBottom: '0.05rem' }}>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={pending}
                  style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                >
                  {pending ? 'Menyimpan...' : '+ Simpan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Entries table ── */}
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

          {/* Filter tabs */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex', gap: '0.3rem',
            background: '#f5f3ef', padding: '0.3rem', borderRadius: 10,
          }}>
            {(['semua', 'pemasukan', 'pengeluaran'] as Filter[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  transition: 'all 0.12s',
                  background: filter === f ? '#fff' : 'transparent',
                  color: filter === f
                    ? (f === 'pemasukan' ? '#059669' : f === 'pengeluaran' ? '#dc2626' : '#0d0d0d')
                    : '#999',
                  boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  textTransform: 'capitalize',
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
                    {new Date(e.date + 'T00:00:00').toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <span
                      className="admin-badge"
                      style={{
                        background: e.type === 'pemasukan'
                          ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: e.type === 'pemasukan' ? '#059669' : '#dc2626',
                        fontWeight: 600,
                      }}
                    >
                      {e.type === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{e.category}</td>
                  <td style={{ color: '#555', fontSize: '0.83rem' }}>{e.description ?? '—'}</td>
                  <td style={{
                    fontWeight: 700,
                    color: e.type === 'pemasukan' ? '#059669' : '#dc2626',
                    whiteSpace: 'nowrap',
                  }}>
                    {e.type === 'pengeluaran' ? '- ' : '+ '}{rp(e.amount)}
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
                        startDelete(() => {
                          deletePembukuanAction(e.id).then(() => setDeleteTarget(null))
                        })
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

    </div>
  )
}
