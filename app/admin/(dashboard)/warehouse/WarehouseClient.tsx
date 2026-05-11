'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adjustStockAction } from '@/lib/actions'
import type { Product } from '@/lib/data'
import type { StockLogEntry } from '@/lib/warehouse'

type Props = {
  products: Product[]
  stockMap: Record<string, number>
  logs: StockLogEntry[]
}

const TYPE_LABELS = { restock: 'Masuk', keluar: 'Keluar', koreksi: 'Koreksi' }
const TYPE_COLORS: Record<string, string> = { restock: 'wh-badge-ok', keluar: 'wh-badge-empty', koreksi: 'wh-badge-low' }

function fmt(date: string) {
  return new Date(date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function WarehouseClient({ products, stockMap, logs }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'stock' | 'log'>('stock')
  const [search, setSearch] = useState('')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [formType, setFormType] = useState<'restock' | 'keluar' | 'koreksi'>('restock')
  const [formAmount, setFormAmount] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()

  const totalItems = Object.values(stockMap).reduce((a, b) => a + b, 0)
  const outOfStock = products.reduce((acc, p) => {
    const sizes = p.sizes?.length ? p.sizes : ['-']
    return acc + sizes.filter(s => (stockMap[`${p.id}:${s}`] ?? 0) === 0).length
  }, 0)

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.tag ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function openEdit(key: string) {
    if (activeKey === key) { setActiveKey(null); return }
    setActiveKey(key)
    setFormType('restock')
    setFormAmount('')
    setFormNote('')
    setFormError('')
  }

  function handleSave(productId: string, productTitle: string, size: string) {
    const qty = parseInt(formAmount)
    if (!qty || qty <= 0) { setFormError('Masukkan jumlah yang valid.'); return }
    setFormError('')
    startTransition(async () => {
      const res = await adjustStockAction({ productId, productTitle, size, type: formType, amount: qty, note: formNote })
      if (res?.error) { setFormError(res.error); return }
      setActiveKey(null)
      router.refresh()
    })
  }

  function StockBadge({ qty }: { qty: number }) {
    if (qty === 0) return <span className="wh-badge wh-badge-empty">Habis</span>
    if (qty <= 10) return <span className="wh-badge wh-badge-low">{qty} pcs</span>
    return <span className="wh-badge wh-badge-ok">{qty} pcs</span>
  }

  const rows = filtered.flatMap(product => {
    const sizes = product.sizes?.length ? product.sizes : ['-']
    return sizes.flatMap((size, sizeIdx) => {
      const key = `${product.id}:${size}`
      const qty = stockMap[key] ?? 0
      const result = [
        <tr key={key} className={`wh-row${sizeIdx === 0 ? ' wh-row-group-start' : ''}`}>
          <td className="wh-product-cell">{sizeIdx === 0 ? product.title : ''}</td>
          <td>{size !== '-' ? <span className="wh-size-chip">{size}</span> : <span style={{ color: '#aaa', fontSize: '0.8rem' }}>—</span>}</td>
          <td><StockBadge qty={qty} /></td>
          <td>
            <button className="wh-edit-btn" onClick={() => openEdit(key)}>
              {activeKey === key ? '↑ Tutup' : 'Edit Stok'}
            </button>
          </td>
        </tr>,
      ]
      if (activeKey === key) {
        result.push(
          <tr key={`${key}-form`} className="wh-form-row">
            <td colSpan={4}>
              <div className="wh-inline-form">
                <div className="wh-form-row-inner">
                  <div className="wh-form-group">
                    <label>Tipe</label>
                    <select
                      className="admin-form-input wh-select"
                      value={formType}
                      onChange={e => setFormType(e.target.value as typeof formType)}
                    >
                      <option value="restock">Masuk (tambah stok)</option>
                      <option value="keluar">Keluar (kurangi stok)</option>
                      <option value="koreksi">Koreksi (set ke angka ini)</option>
                    </select>
                  </div>
                  <div className="wh-form-group">
                    <label>Jumlah (pcs)</label>
                    <input
                      type="number" min={1}
                      className="admin-form-input wh-num-input"
                      placeholder="0"
                      value={formAmount}
                      onChange={e => setFormAmount(e.target.value)}
                    />
                  </div>
                  <div className="wh-form-group wh-form-group-grow">
                    <label>Keterangan (opsional)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="cth: restock batch Maret"
                      value={formNote}
                      onChange={e => setFormNote(e.target.value)}
                    />
                  </div>
                  <div className="wh-form-group wh-form-group-btn">
                    <label>&nbsp;</label>
                    <button
                      className="btn-admin-primary"
                      style={{ whiteSpace: 'nowrap' }}
                      disabled={isPending}
                      onClick={() => handleSave(product.id, product.title, size)}
                    >
                      {isPending ? 'Menyimpan…' : 'Simpan'}
                    </button>
                  </div>
                </div>
                {formError && <div className="admin-error" style={{ marginTop: '0.5rem' }}>{formError}</div>}
              </div>
            </td>
          </tr>,
        )
      }
      return result
    })
  })

  return (
    <div className="wh-wrap">
      {/* Stats */}
      <div className="wh-stats">
        <div className="wh-stat-card">
          <div className="wh-stat-val">{products.length}</div>
          <div className="wh-stat-lbl">Produk</div>
        </div>
        <div className="wh-stat-card">
          <div className="wh-stat-val">{totalItems.toLocaleString('id-ID')}</div>
          <div className="wh-stat-lbl">Total Stok (pcs)</div>
        </div>
        <div className="wh-stat-card">
          <div className={`wh-stat-val${outOfStock > 0 ? ' wh-stat-danger' : ''}`}>{outOfStock}</div>
          <div className="wh-stat-lbl">Varian Habis</div>
        </div>
        <div className="wh-stat-card">
          <div className="wh-stat-val">{logs.length}</div>
          <div className="wh-stat-lbl">Total Transaksi</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="wh-tabs">
        <button className={`wh-tab${tab === 'stock' ? ' active' : ''}`} onClick={() => setTab('stock')}>
          Stok Saat Ini
        </button>
        <button className={`wh-tab${tab === 'log' ? ' active' : ''}`} onClick={() => setTab('log')}>
          Riwayat Perubahan{logs.length > 0 ? ` (${logs.length})` : ''}
        </button>
      </div>

      {tab === 'stock' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Cari nama produk atau tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="admin-empty">Tidak ada produk ditemukan.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table wh-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th style={{ width: 80 }}>Ukuran</th>
                    <th style={{ width: 120 }}>Stok</th>
                    <th style={{ width: 110 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'log' && (
        <div className="admin-table-wrap">
          {logs.length === 0 ? (
            <div className="admin-empty">Belum ada riwayat perubahan stok.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Produk</th>
                  <th style={{ width: 70 }}>Ukuran</th>
                  <th style={{ width: 90 }}>Tipe</th>
                  <th style={{ width: 100 }}>Perubahan</th>
                  <th style={{ width: 100 }}>Stok Akhir</th>
                  <th>Keterangan</th>
                  <th style={{ width: 110 }}>Admin</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap' }}>{fmt(log.createdAt)}</td>
                    <td>{log.productTitle}</td>
                    <td>{log.size !== '-' ? <span className="wh-size-chip">{log.size}</span> : '—'}</td>
                    <td>
                      <span className={`wh-badge ${TYPE_COLORS[log.type]}`}>
                        {TYPE_LABELS[log.type]}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: log.quantityChange >= 0 ? '#16a34a' : '#dc2626' }}>
                      {log.quantityChange >= 0 ? '+' : ''}{log.quantityChange}
                    </td>
                    <td>{log.quantityAfter}</td>
                    <td style={{ color: '#888', fontSize: '0.85rem' }}>{log.note || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{log.adminUsername}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
