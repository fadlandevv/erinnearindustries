'use client'
import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { adjustStockAction, updateProductPriceAction, upsertSizeEntryAction, copyPricingToSizes } from '@/lib/actions'
import type { Product } from '@/lib/data'
import type { StockLogEntry } from '@/lib/warehouse'

type Props = {
  products: Product[]
  stockMap: Record<string, number>
  priceMap: Record<string, { harga: number | null; hpp: number | null }>
  logs: StockLogEntry[]
}

const TYPE_LABELS = { restock: 'In', keluar: 'Out', koreksi: 'Correction' }
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
    <span onClick={startEdit} title="Click to edit" className="wh-inline-val"
      style={{ opacity: pending ? 0.5 : 1, color: value ? 'inherit' : '#aaa', fontWeight: value ? 600 : 400 }}>
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
  const [amount, setAmount] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setAmount(String(qty))
    setEditing(true)
    setTimeout(() => { inputRef.current?.select() }, 0)
  }

  function commit() {
    const n = parseInt(amount, 10)
    if (!isNaN(n) && n >= 0) onSave('koreksi', n)
    setEditing(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input ref={inputRef} type="number" min={0} className="admin-form-input"
        style={{ width: 90, padding: '0.3rem 0.5rem', fontSize: '0.82rem' }}
        value={amount} onChange={e => setAmount(e.target.value)}
        onBlur={commit} onKeyDown={onKeyDown} autoFocus />
    )
  }

  const color = qty === 0 ? '#dc2626' : qty <= 10 ? '#d97706' : 'inherit'
  return (
    <span onClick={startEdit} title="Click to edit" className="wh-inline-val"
      style={{ color, fontWeight: 600, opacity: pending ? 0.5 : 1 }}>
      {qty === 0 ? 'Out of stock' : `${qty} pcs`}
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
        onBlur={commit} onKeyDown={onKeyDown} autoFocus placeholder="e.g. Rp 150.000" />
    )
  }

  return (
    <button className={`wh-price-edit-btn${pending ? ' active' : ''}`}
      onClick={startEdit} title="Edit website display price" style={{ opacity: pending ? 0.5 : 1 }}>
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
  const [hiddenProducts, setHiddenProducts] = useState<Set<string>>(new Set())
  const [copyPopover, setCopyPopover] = useState<{ productId: string; fromSize: string; allSizes: string[] } | null>(null)
  const [copyTargets, setCopyTargets] = useState<string[]>([])
  const [copyPending, setCopyPending] = useState(false)

  function handleCopyClick(productId: string, fromSize: string, allSizes: string[]) {
    const others = allSizes.filter(s => s !== fromSize)
    setCopyPopover({ productId, fromSize, allSizes: others })
    setCopyTargets(others)
  }

  async function handleCopyConfirm() {
    if (!copyPopover || copyTargets.length === 0) return
    setCopyPending(true)
    await copyPricingToSizes(copyPopover.productId, copyPopover.fromSize, copyTargets)
    setCopyPending(false)
    setCopyPopover(null)
    router.refresh()
  }

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
    const isHidden = hiddenProducts.has(product.id)
    function toggleHide() {
      setHiddenProducts(prev => {
        const next = new Set(prev)
        next.has(product.id) ? next.delete(product.id) : next.add(product.id)
        return next
      })
    }
    return sizes.flatMap((size, sizeIdx) => {
      if (isHidden && sizeIdx > 0) return []
      const key = `${product.id}:${size}`
      const qty = stockMap[key] ?? 0
      const entry = priceMap[key]
      const harga = entry?.harga ?? null
      const hpp = entry?.hpp ?? null
      const reseller = harga ? Math.round(harga * 0.85) : null

      return [(
        <tr key={key} className={`wh-row${sizeIdx === 0 ? ' wh-row-group-start' : ''}${isHidden ? ' wh-row-hidden' : ''}`}>
          <td className="wh-product-cell">
            {sizeIdx === 0 ? (
              <div className="wh-product-name-wrap">
                <button type="button" onClick={toggleHide} className={`wh-visibility-btn${isHidden ? ' collapsed' : ''}`} title={isHidden ? 'Tampilkan' : 'Sembunyikan'}>
                  <svg width="13" height="13" viewBox="0 0 10 10" fill="none" className="wh-chevron">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span style={{ opacity: isHidden ? 0.45 : 1 }}>{product.title}</span>
                <InlineDisplayPriceCell productId={product.id} currentPrice={product.price} />
              </div>
            ) : null}
          </td>
          <td>
            {size !== '-'
              ? <span className="wh-size-chip">{size}</span>
              : <span style={{ color: '#aaa', fontSize: '0.8rem' }}>—</span>}
          </td>
          <td style={{ whiteSpace: 'nowrap' }}>
            <InlinePriceCell value={harga} pending={savingKey === key}
              onSave={v => handlePriceSave(product.id, product.title, size, 'harga', v)} />
          </td>
          <td style={{ whiteSpace: 'nowrap' }}>
            <InlinePriceCell value={hpp} pending={savingKey === key}
              onSave={v => handlePriceSave(product.id, product.title, size, 'hpp', v)} />
          </td>
          <td style={{ whiteSpace: 'nowrap' }}>
            <span className="wh-inline-val" style={{ color: reseller ? '#16a34a' : '#aaa', fontWeight: reseller ? 600 : 400 }}>
              {formatRp(reseller)}
            </span>
          </td>
          <td style={{ whiteSpace: 'nowrap' }}>
            <InlineStockCell qty={qty} pending={stockSavingKey === key}
              onSave={(type, amount) => handleStockSave(product.id, product.title, size, type, amount)} />
          </td>
          <td>
            {product.sizes.length > 1 ? (
              <button className="btn-admin-secondary"
                onClick={() => handleCopyClick(product.id, size, product.sizes)}
                style={{ padding: '0.25rem', lineHeight: 1, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Copy price & stock to other sizes">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
            ) : null}
          </td>
        </tr>
      )]
    })
  })

  return (
    <>
    <div className="wh-wrap">
      <div className="wh-stats">
        <div className="wh-stat-card">
          <div className="wh-stat-val">{products.length}</div>
          <div className="wh-stat-lbl">Products</div>
        </div>
        <div className="wh-stat-card">
          <div className="wh-stat-val">{totalItems.toLocaleString('id-ID')}</div>
          <div className="wh-stat-lbl">Total Stock (pcs)</div>
        </div>
        <div className="wh-stat-card">
          <div className={`wh-stat-val${outOfStock > 0 ? ' wh-stat-danger' : ''}`}>{outOfStock}</div>
          <div className="wh-stat-lbl">Out of Stock Variants</div>
        </div>
        <div className="wh-stat-card">
          <div className="wh-stat-val">{logs.length}</div>
          <div className="wh-stat-lbl">Total Transactions</div>
        </div>
      </div>

      <div className="wh-tabs">
        <button className={`wh-tab${tab === 'stock' ? ' active' : ''}`} onClick={() => setTab('stock')}>
          Stock &amp; Price
        </button>
        <button className={`wh-tab${tab === 'log' ? ' active' : ''}`} onClick={() => setTab('log')}>
          History{logs.length > 0 ? ` (${logs.length})` : ''}
        </button>
      </div>

      {tab === 'stock' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <input type="text" className="admin-form-input wh-search-bar"
              placeholder="Search product name or tag..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <div className="admin-empty">No products found.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table wh-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ width: 70 }}>Size</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Selling Price</th>
                    <th style={{ whiteSpace: 'nowrap' }}>COGS</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Reseller Price</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Stock</th>
                    <th style={{ width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.75rem' }}>
            Click a value to edit inline.
          </p>
        </>
      )}

      {tab === 'log' && (
        <div className="admin-table-wrap">
          {logs.length === 0 ? (
            <div className="admin-empty">No stock change history yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th><th>Product</th>
                  <th style={{ width: 70 }}>Size</th>
                  <th style={{ width: 90 }}>Type</th>
                  <th style={{ width: 100 }}>Change</th>
                  <th style={{ width: 100 }}>Stock After</th>
                  <th>Note</th>
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

    {copyPopover && (

      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={e => { if (e.target === e.currentTarget) setCopyPopover(null) }}>
        <div className="admin-form-card" style={{ width: 280, padding: '1.25rem', margin: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Copy price &amp; stock from <strong>{copyPopover.fromSize}</strong></p>
          <p style={{ fontSize: '0.78rem', color: '#999', marginBottom: 12 }}>Select target sizes:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {copyPopover.allSizes.map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={copyTargets.includes(s)}
                  onChange={e => setCopyTargets(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s))} />
                {s}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-admin-primary" style={{ flex: 1 }}
              onClick={handleCopyConfirm} disabled={copyPending || copyTargets.length === 0}>
              {copyPending ? 'Copying...' : 'Apply'}
            </button>
            <button className="btn-admin-secondary" onClick={() => setCopyPopover(null)} disabled={copyPending}>Cancel</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
