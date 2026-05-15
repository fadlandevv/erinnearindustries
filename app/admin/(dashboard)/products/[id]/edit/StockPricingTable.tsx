'use client'
import { Fragment, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertSizeEntryAction } from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'
import type { SizeEntry } from '@/lib/warehouse'

type Props = {
  productId: string
  productTitle: string
  entries: SizeEntry[]
}

function formatRp(n: number | null): string {
  if (n === null || n === 0) return '—'
  return 'Rp ' + n.toLocaleString('id-ID')
}

function parseRp(s: string): number | null {
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? null : n
}

export default function StockPricingTable({ productId, productTitle, entries }: Props) {
  const router = useRouter()
  const { toast } = useAdminToast()
  const [activeSize, setActiveSize] = useState<string | null>(null)
  const [qty, setQty] = useState('')
  const [harga, setHarga] = useState('')
  const [hpp, setHpp] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function openEdit(entry: SizeEntry) {
    if (activeSize === entry.size) { setActiveSize(null); return }
    setActiveSize(entry.size)
    setQty(String(entry.quantity))
    setHarga(entry.harga ? String(entry.harga) : '')
    setHpp(entry.hpp ? String(entry.hpp) : '')
    setError('')
  }

  function handleSave(size: string) {
    const quantity = parseInt(qty, 10)
    if (isNaN(quantity) || quantity < 0) { setError('Stok tidak valid.'); return }
    setError('')
    startTransition(async () => {
      try {
        const res = await upsertSizeEntryAction({
          productId, productTitle, size, quantity,
          harga: parseRp(harga),
          hpp: parseRp(hpp),
        })
        if (res?.error) { setError(res.error); toast(res.error, 'error'); return }
        setActiveSize(null)
        toast('Stok & harga berhasil disimpan')
        router.refresh()
      } catch {
        const msg = 'Terjadi kesalahan. Pastikan tabel sudah dibuat di Supabase.'
        setError(msg)
        toast(msg, 'error')
      }
    })
  }

  const totalStock = entries.reduce((a, e) => a + e.quantity, 0)

  return (
    <div className="admin-form-card" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <p className="admin-form-section-title" style={{ margin: 0 }}>Stok &amp; Harga</p>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>
          Total stok: <strong>{totalStock} pcs</strong>
        </span>
      </div>

      <div className="admin-table-wrap" style={{ marginBottom: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Ukuran</th>
              <th style={{ width: 110 }}>Stok</th>
              <th style={{ width: 140 }}>Harga Jual</th>
              <th style={{ width: 140 }}>HPP</th>
              <th style={{ width: 90 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <Fragment key={entry.size}>
                <tr>
                  <td>
                    {entry.size !== '-'
                      ? <span className="wh-size-chip">{entry.size}</span>
                      : <span style={{ color: '#aaa' }}>—</span>}
                  </td>
                  <td>
                    {entry.quantity === 0
                      ? <span className="wh-badge wh-badge-empty">Habis</span>
                      : entry.quantity <= 10
                        ? <span className="wh-badge wh-badge-low">{entry.quantity} pcs</span>
                        : <span className="wh-badge wh-badge-ok">{entry.quantity} pcs</span>}
                  </td>
                  <td style={{ fontWeight: entry.harga ? 600 : 400, color: entry.harga ? 'inherit' : '#bbb' }}>
                    {formatRp(entry.harga)}
                  </td>
                  <td style={{ color: entry.hpp ? 'inherit' : '#bbb' }}>
                    {formatRp(entry.hpp)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`wh-edit-btn${activeSize === entry.size ? ' active' : ''}`}
                      onClick={() => openEdit(entry)}
                    >
                      {activeSize === entry.size ? '↑ Tutup' : 'Edit'}
                    </button>
                  </td>
                </tr>

                {activeSize === entry.size && (
                  <tr className="wh-form-row">
                    <td colSpan={5}>
                      <div className="wh-inline-form">
                        <div className="wh-form-row-inner">
                          <div className="wh-form-group">
                            <label>Stok (pcs)</label>
                            <input
                              type="number" min={0}
                              className="admin-form-input wh-num-input"
                              value={qty}
                              onChange={e => setQty(e.target.value)}
                            />
                          </div>
                          <div className="wh-form-group">
                            <label>Harga Jual (Rp)</label>
                            <input
                              type="text"
                              className="admin-form-input wh-price-input"
                              placeholder="cth. 150000"
                              value={harga}
                              onChange={e => setHarga(e.target.value)}
                            />
                          </div>
                          <div className="wh-form-group">
                            <label>HPP (Rp)</label>
                            <input
                              type="text"
                              className="admin-form-input wh-price-input"
                              placeholder="cth. 80000"
                              value={hpp}
                              onChange={e => setHpp(e.target.value)}
                            />
                          </div>
                          <div className="wh-form-group wh-form-group-btn">
                            <label>&nbsp;</label>
                            <button
                              type="button"
                              className="btn-admin-primary"
                              style={{ whiteSpace: 'nowrap' }}
                              disabled={isPending}
                              onClick={() => handleSave(entry.size)}
                            >
                              {isPending ? 'Menyimpan…' : 'Simpan'}
                            </button>
                          </div>
                        </div>
                        {error && <div className="admin-error" style={{ marginTop: '0.5rem' }}>{error}</div>}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
