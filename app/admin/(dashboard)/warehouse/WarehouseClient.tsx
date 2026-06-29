'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adjustStockAction, updateProductPriceAction, upsertSizeEntryAction } from '@/lib/actions'
import type { Product } from '@/lib/data'
import type { StockLogEntry } from '@/lib/warehouse'

type Props = {
  products: Product[]
  stockMap: Record<string, number>
  priceMap: Record<string, { harga: number | null; hpp: number | null }>
  logs: StockLogEntry[]
}

const TYPE_LABELS = { restock: 'Masuk', keluar: 'Keluar', koreksi: 'Koreksi' }
const TYPE_COLORS: Record<string, string> = { restock: 'wh-badge-ok', keluar: 'wh-badge-empty', koreksi: 'wh-badge-low' }

function fmt(date: string) {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatRp(n: number | null) {
  if (!n) return <span style={{ color: '#bbb' }}>—</span>
  return <span>{'Rp ' + n.toLocaleString('id-ID')}</span>
}

export default function WarehouseClient({ products, stockMap, priceMap, logs }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'stock' | 'log'>('stock')
  const [search, setSearch] = useState('')

  // stock edit state
  const [activeStockKey, setActiveStockKey] = useState<string | null>(null)
  const [formType, setFormType] = useState<'restock' | 'keluar' | 'koreksi'>('restock')
  const [formAmount, setFormAmount] = useState('')
  const [formNote, setFormNote] = useState('')
  const [stockError, setStockError] = useState('')
  const [stockPending, startStockTransition] = useTransition()

  // price edit state (per size)
  const [activePriceKey, setActivePriceKey] = useState<string | null>(null)
  const [hargaInput, setHargaInput] = useState('')
  const [hppInput, setHppInput] = useState('')
  const [priceError, setPriceError] = useState('')
  const [pricePending, startPriceTransition] = useTransition()

  // product display price edit
  const [activeDisplayPriceId, setActiveDisplayPriceId] = useState<string | null>(null)
  const [displayPriceInput, setDisplayPriceInput] = useState('')
  const [displayPriceError, setDisplayPriceError] = useState('')
  const [displayPricePending, startDisplayPriceTransition] = useTransition()

  const totalItems = Object.values(stockMap).reduce((a, b) => a + b, 0)
  const outOfStock = products.reduce((acc, p) => {
    const sizes = p.sizes?.length ? p.sizes : ['-']
    return acc + sizes.filter(s => (stockMap[`${p.id}:${s}`] ?? 0) === 0).length
  }, 0)

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.tag ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function openStockEdit(key: string) {
    if (activeStockKey === key) { setActiveStockKey(null); return }
    setActiveStockKey(key)
    setActivePriceKey(null)
    setActiveDisplayPriceId(null)
    setFormType('restock')
    setFormAmount('')
    setFormNote('')
    setStockError('')
  }

  function openPriceEdit(key: string, productId: string, size: string) {
    if (activePriceKey === key) { setActivePriceKey(null); return }
    setActivePriceKey(key)
    setActiveStockKey(null)
    setActiveDisplayPriceId(null)
    const entry = priceMap[key]
    setHargaInput(entry?.harga ? String(entry.harga) : '')
    setHppInput(entry?.hpp ? String(entry.hpp) : '')
    setPriceError('')
  }

  function openDisplayPriceEdit(productId: string, currentPrice: string) {
    if (activeDisplayPriceId === productId) { setActiveDisplayPriceId(null); return }
    setActiveDisplayPriceId(productId)
    setActivePriceKey(null)
    setActiveStockKey(null)
    setDisplayPriceInput(currentPrice === '—' ? '' : currentPrice)
    setDisplayPriceError('')
  }

  function handleStockSave(productId: string, productTitle: string, size: string) {
    const qty = parseInt(formAmount)
    if (!qty || qty <= 0) { setStockError('Masukkan jumlah yang valid.'); return }
    setStockError('')
    startStockTransition(async () => {
      const res = await adjustStockAction({ productId, productTitle, size, type: formType, amount: qty, note: formNote })
      if (res?.error) { setStockError(res.error); return }
      setActiveStockKey(null)
      router.refresh()
    })
  }

  function handlePriceSave(productId: string, productTitle: string, size: string) {
    const harga = parseInt(hargaInput.replace(/[^0-9]/g, '')) || null
    const hpp = parseInt(hppInput.replace(/[^0-9]/g, '')) || null
    setPriceError('')
    startPriceTransition(async () => {
      const key = `${productId}:${size}`
      const currentQty = stockMap[key] ?? 0
      const res = await upsertSizeEntryAction({ productId, productTitle, size, quantity: currentQty, harga, hpp })
      if (res?.error) { setPriceError(res.error); return }
      setActivePriceKey(null)
      router.refresh()
    })
  }

  function handleDisplayPriceSave(productId: string) {
    const val = displayPriceInput.trim()
    if (!val) { setDisplayPriceError('Harga tidak boleh kosong.'); return }
    setDisplayPriceError('')
    startDisplayPriceTransition(async () => {
      const res = await updateProductPriceAction(productId, val)
      if (res?.error) { setDisplayPriceError(res.error); return }
      setActiveDisplayPriceId(null)
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
      const entry = priceMap[key]
      const harga = entry?.harga ?? null
      const hpp = entry?.hpp ?? null
      const reseller = harga ? Math.round(harga * 0.85) : null

      const result = [
        <tr key={key} className={`wh-row${sizeIdx === 0 ? ' wh-row-group-start' : ''}`}>
          {/* Produk */}
          <td className="wh-product-cell">
            {sizeIdx === 0 ? (
              <div className="wh-product-name-wrap">
                <span>{product.title}</span>
                <button
                  className={`wh-price-edit-btn${activeDisplayPriceId === product.id ? ' active' : ''}`}
                  onClick={() => openDisplayPriceEdit(product.id, product.price)}
                  title="Edit harga tampilan website"
                >
                  {activeDisplayPriceId === product.id ? '↑' : '✎'}
                </button>
              </div>
            ) : null}
          </td>
          {/* Ukuran */}
          <td>
            {size !== '-'
              ? <span className="wh-size-chip">{size}</span>
              : <span style={{ color: '#aaa', fontSize: '0.8rem' }}>—</span>}
          </td>
          {/* Harga Jual */}
          <td style={{ fontWeight: harga ? 600 : 400 }}>{formatRp(harga)}</td>
          {/* HPP */}
          <td>{formatRp(hpp)}</td>
          {/* Harga Reseller */}
          <td style={{ color: reseller ? '#16a34a' : undefined }}>{formatRp(reseller)}</td>
          {/* Stok */}
          <td><StockBadge qty={qty} /></td>
          {/* Aksi */}
          <td>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`wh-edit-btn${activePriceKey === key ? ' active' : ''}`}
                onClick={() => openPriceEdit(key, product.id, size)}
              >
                {activePriceKey === key ? '↑' : 'Harga'}
              </button>
              <button
                className={`wh-edit-btn${activeStockKey === key ? ' active' : ''}`}
                onClick={() => openStockEdit(key)}
              >
                {activeStockKey === key ? '↑' : 'Stok'}
              </button>
            </div>
          </td>
        </tr>,
      ]

      // Display price edit row (per product, after first size)
      if (sizeIdx === 0 && activeDisplayPriceId === product.id) {
        result.push(
          <tr key={`${product.id}-display-price-form`} className="wh-form-row">
            <td colSpan={7}>
              <div className="wh-inline-form">
                <p style={{ fontSize: '0.78rem', color: '#888', margin: '0 0 8px' }}>
                  Harga tampilan di website (misal: Rp 150.000 atau Mulai Rp 150.000)
                </p>
                <div className="wh-form-row-inner">
                  <div className="wh-form-group wh-form-group-grow">
                    <label>Harga Display</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="cth. Rp 150.000"
                      value={displayPriceInput}
                      onChange={e => setDisplayPriceInput(e.target.value)}
                    />
                  </div>
                  <div className="wh-form-group wh-form-group-btn">
                    <label>&nbsp;</label>
                    <button className="btn-admin-primary" style={{ whiteSpace: 'nowrap' }}
                      disabled={displayPricePending}
                      onClick={() => handleDisplayPriceSave(product.id)}>
                      {displayPricePending ? 'Menyimpan…' : 'Simpan'}
                    </button>
                  </div>
                </div>
                {displayPriceError && <div className="admin-error" style={{ marginTop: '0.5rem' }}>{displayPriceError}</div>}
              </div>
            </td>
          </tr>
        )
      }

      // Price edit row
      if (activePriceKey === key) {
        result.push(
          <tr key={`${key}-price-form`} className="wh-form-row">
            <td colSpan={7}>
              <div className="wh-inline-form">
                <div className="wh-form-row-inner">
                  <div className="wh-form-group">
                    <label>Harga Jual (Rp)</label>
                    <input type="text" className="admin-form-input wh-price-input"
                      placeholder="cth. 150000"
                      value={hargaInput}
                      onChange={e => setHargaInput(e.target.value)} />
                  </div>
                  <div className="wh-form-group">
                    <label>HPP (Rp)</label>
                    <input type="text" className="admin-form-input wh-price-input"
                      placeholder="cth. 80000"
                      value={hppInput}
                      onChange={e => setHppInput(e.target.value)} />
                  </div>
                  <div className="wh-form-group" style={{ justifyContent: 'flex-end' }}>
                    <label style={{ fontSize: '0.75rem', color: '#888' }}>H. Reseller (auto)</label>
                    <div className="admin-form-input" style={{ background: '#f5f4f1', color: '#16a34a', fontWeight: 600, cursor: 'default' }}>
                      {hargaInput
                        ? 'Rp ' + Math.round((parseInt(hargaInput.replace(/[^0-9]/g, '')) || 0) * 0.85).toLocaleString('id-ID')
                        : '—'}
                    </div>
                  </div>
                  <div className="wh-form-group wh-form-group-btn">
                    <label>&nbsp;</label>
                    <button className="btn-admin-primary" style={{ whiteSpace: 'nowrap' }}
                      disabled={pricePending}
                      onClick={() => handlePriceSave(product.id, product.title, size)}>
                      {pricePending ? 'Menyimpan…' : 'Simpan Harga'}
                    </button>
                  </div>
                </div>
                {priceError && <div className="admin-error" style={{ marginTop: '0.5rem' }}>{priceError}</div>}
              </div>
            </td>
          </tr>
        )
      }

      // Stock edit row
      if (activeStockKey === key) {
        result.push(
          <tr key={`${key}-stock-form`} className="wh-form-row">
            <td colSpan={7}>
              <div className="wh-inline-form">
                <div className="wh-form-row-inner">
                  <div className="wh-form-group">
                    <label>Tipe</label>
                    <select className="admin-form-input wh-select" value={formType}
                      onChange={e => setFormType(e.target.value as typeof formType)}>
                      <option value="restock">Masuk (tambah stok)</option>
                      <option value="keluar">Keluar (kurangi stok)</option>
                      <option value="koreksi">Koreksi (set ke angka ini)</option>
                    </select>
                  </div>
                  <div className="wh-form-group">
                    <label>Jumlah (pcs)</label>
                    <input type="number" min={1} className="admin-form-input wh-num-input"
                      placeholder="0" value={formAmount}
                      onChange={e => setFormAmount(e.target.value)} />
                  </div>
                  <div className="wh-form-group wh-form-group-grow">
                    <label>Keterangan (opsional)</label>
                    <input type="text" className="admin-form-input"
                      placeholder="cth. restock batch Maret" value={formNote}
                      onChange={e => setFormNote(e.target.value)} />
                  </div>
                  <div className="wh-form-group wh-form-group-btn">
                    <label>&nbsp;</label>
                    <button className="btn-admin-primary" style={{ whiteSpace: 'nowrap' }}
                      disabled={stockPending}
                      onClick={() => handleStockSave(product.id, product.title, size)}>
                      {stockPending ? 'Menyimpan…' : 'Simpan'}
                    </button>
                  </div>
                </div>
                {stockError && <div className="admin-error" style={{ marginTop: '0.5rem' }}>{stockError}</div>}
              </div>
            </td>
          </tr>
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
          Stok &amp; Harga
        </button>
        <button className={`wh-tab${tab === 'log' ? ' active' : ''}`} onClick={() => setTab('log')}>
          Riwayat{logs.length > 0 ? ` (${logs.length})` : ''}
        </button>
      </div>

      {tab === 'stock' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <input type="text" className="admin-form-input wh-search-bar"
              placeholder="Cari nama produk atau tag..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filtered.length === 0 ? (
            <div className="admin-empty">Tidak ada produk ditemukan.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table wh-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th style={{ width: 70 }}>Ukuran</th>
                    <th style={{ width: 130 }}>Harga Jual</th>
                    <th style={{ width: 120 }}>HPP</th>
                    <th style={{ width: 130 }}>H. Reseller</th>
                    <th style={{ width: 100 }}>Stok</th>
                    <th style={{ width: 120 }}>Aksi</th>
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
                    <td><span className={`wh-badge ${TYPE_COLORS[log.type]}`}>{TYPE_LABELS[log.type]}</span></td>
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
