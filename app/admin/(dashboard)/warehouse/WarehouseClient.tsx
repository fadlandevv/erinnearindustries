'use client'
import { useState, useTransition, useRef } from 'react'
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
  if (!n) return '—'
  return 'Rp ' + n.toLocaleString('id-ID')
}

function InlinePriceCell({ value, onSave, pending }: {
  value: number | null
  onSave: (val: number | null) => void
  pending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setInput(value ? String(value) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const parsed = parseInt(input.replace(/[^0-9]/g, ''), 10)
    const newVal = isNaN(parsed) || parsed === 0 ? null : parsed
    setEditing(false)
    if (newVal !== value) onSave(newVal)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input ref={inputRef} type="text" className="admin-form-input"
        style={{ width: 110, padding: '0.3rem 0.5rem', fontSize: '0.82rem' }}
        value={input}
        onChange={e => setInput(e.target.value)}
        onBlur={commit} onKeyDown={onKeyDown} autoFocus />
    )
  }

  return (
    <span onClick={startEdit} title="Klik untuk edit"
      style={{ cursor: 'pointer', color: value ? 'inherit' : '#ccc', fontWeight: value ? 600 : 400,
        opacity: pending ? 0.5 : 1 }}>
      {formatRp(value)}
    </span>
  )
}

function InlineStockCell({ qty, onSave, pending }: {
  qty: number
  onSave: (type: 'restock' | 'keluar' | 'koreksi', amount: number) => void
  pending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState<'restock' | 'keluar' | 'koreksi'>('koreksi')
  const [amount, setAmount] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setType('koreksi')
    setAmount(String(qty))
    setEditing(true)
    setTimeout(() => { inputRef.current?.select() }, 0)
  }

  function commit() {
    const n = parseInt(amount, 10)
    if (!isNaN(n) && n >= 0) onSave(type, n)
    setEditing(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="admin-form-input" value={type}
          style={{ padding: '0.3rem 0.4rem', fontSize: '0.75rem', width: 'auto' }}
          onChange={e => setType(e.target.value as typeof type)}>
          <option value="koreksi">Set</option>
          <option value="restock">+ Masuk</option>
          <option value="keluar">− Keluar</option>
        </select>
        <input ref={inputRef} type="number" min={0} className="admin-form-input"
          style={{ width: 64, padding: '0.3rem 0.5rem', fontSize: '0.82rem' }}
          value={amount} onChange={e => setAmount(e.target.value)}
          onBlur={commit} onKeyDown={onKeyDown} autoFocus />
      </div>
    )
  }

  const badgeClass = qty === 0 ? 'wh-badge-empty' : qty <= 10 ? 'wh-badge-low' : 'wh-badge-ok'
  return (
    <span className={`wh-badge ${badgeClass}`} onClick={startEdit} title="Klik untuk edit"
      style={{ cursor: 'pointer', opacity: pending ? 0.5 : 1 }}>
      {qty === 0 ? 'Habis' : `${qty} pcs`}
    </span>
  )
}

function InlineDisplayPriceCell({ productId, currentPrice }: { productId: string; currentPrice: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setInput(currentPrice === '—' ? '' : currentPrice)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const val = input.trim()
    setEditing(false)
    if (val && val !== currentPrice) {
      startTransition(async () => {
        await updateProductPriceAction(productId, val)
        router.refresh()
      })
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input ref={inputRef} type="text" className="admin-form-input"
        style={{ width: '100%', padding: '0.25rem 0.4rem', fontSize: '0.82rem', marginTop: 4 }}
        value={input} onChange={e => setInput(e.target.value)}
        onBlur={commit} onKeyDown={onKeyDown} autoFocus placeholder="cth. Rp 150.000" />
    )
  }

  return (
    <button className={`wh-price-edit-btn${pending ? ' active' : ''}`}
      onClick={startEdit} title="Edit harga tampilan website" style={{ opacity: pending ? 0.5 : 1 }}>
      {pending ? '…' : '✎'}
    </button>
  )
}

export default function WarehouseClient({ products, stockMap, priceMap, logs }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'stock' | 'log'>('stock')
  const [search, setSearch] = useState('')
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [stockSavingKey, setStockSavingKey] = useState<string | null>(null)

  const totalItems = Object.values(stockMap).reduce((a, b) => a + b, 0)
  const outOfStock = products.reduce((acc, p) => {
    const sizes = p.sizes?.length ? p.sizes : ['-']
    return acc + sizes.filter(s => (stockMap[`${p.id}:${s}`] ?? 0) === 0).length
  }, 0)

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.tag ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function handlePriceSave(productId: string, productTitle: string, size: string, field: 'harga' | 'hpp', newVal: number | null) {
    const key = `${productId}:${size}`
    const entry = priceMap[key]
    const harga = field === 'harga' ? newVal : (entry?.harga ?? null)
    const hpp   = field === 'hpp'   ? newVal : (entry?.hpp   ?? null)
    setSavingKey(key)
    upsertSizeEntryAction({ productId, productTitle, size, quantity: stockMap[key] ?? 0, harga, hpp })
      .then(() => router.refresh())
      .finally(() => setSavingKey(null))
  }

  function handleStockSave(productId: string, productTitle: string, size: string, type: 'restock' | 'keluar' | 'koreksi', amount: number) {
    const key = `${productId}:${size}`
    setStockSavingKey(key)
    adjustStockAction({ productId, productTitle, size, type, amount, note: '' })
      .then(() => router.refresh())
      .finally(() => setStockSavingKey(null))
  }

  const rows = filtered.flatMap(product => {
    const sizes = product.sizes?.length ? product.sizes : ['-']
    return sizes.map((size, sizeIdx) => {
      const key = `${product.id}:${size}`
      const qty = stockMap[key] ?? 0
      const entry = priceMap[key]
      const harga = entry?.harga ?? null
      const hpp = entry?.hpp ?? null
      const reseller = harga ? Math.round(harga * 0.85) : null

      return (
        <tr key={key} className={`wh-row${sizeIdx === 0 ? ' wh-row-group-start' : ''}`}>
          <td className="wh-product-cell">
            {sizeIdx === 0 ? (
              <div className="wh-product-name-wrap">
                <span>{product.title}</span>
                <InlineDisplayPriceCell productId={product.id} currentPrice={product.price} />
              </div>
            ) : null}
          </td>
          <td>
            {size !== '-'
              ? <span className="wh-size-chip">{size}</span>
              : <span style={{ color: '#aaa', fontSize: '0.8rem' }}>—</span>}
          </td>
          <td>
            <InlinePriceCell value={harga} pending={savingKey === key}
              onSave={v => handlePriceSave(product.id, product.title, size, 'harga', v)} />
          </td>
          <td>
            <InlinePriceCell value={hpp} pending={savingKey === key}
              onSave={v => handlePriceSave(product.id, product.title, size, 'hpp', v)} />
          </td>
          <td style={{ color: reseller ? '#16a34a' : '#ccc', fontWeight: reseller ? 600 : 400 }}>
            {formatRp(reseller)}
          </td>
          <td>
            <InlineStockCell qty={qty} pending={stockSavingKey === key}
              onSave={(type, amount) => handleStockSave(product.id, product.title, size, type, amount)} />
          </td>
        </tr>
      )
    })
  })

  return (
    <div className="wh-wrap">
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
                    <th style={{ width: 130 }}>Stok</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.75rem' }}>
            Klik nilai untuk mengedit langsung.
          </p>
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
                  <th>Waktu</th><th>Produk</th>
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
