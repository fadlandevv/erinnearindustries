'use client'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  addCustomProductOptionAction,
  deleteCustomProductOptionAction,
  updateCustomProductOptionPriceAction,
  updateCustomProductOptionAction,
  upsertCustomProductOptionPriceAction,
  updateCustomProductImageAction,
  updatePricingAction,
  updateProductConfigAction,
} from '@/lib/actions'
import type { PricingItem } from '@/lib/pricing'
import { useAdminToast } from '@/context/AdminToastContext'

type ColorItem = { id: string; label: string; value: string }
type BahanItem = { id: string; label: string; price: number; sortOrder: number }
type SizeItem  = { id: string; label: string; price: number; sortOrder: number }

type Props = {
  productId: string
  productName: string
  productSub: string
  hasColors: boolean
  hasBahan:  boolean
  hasSizes:  boolean
  hasSablon: boolean
  savedImage?: string
  options:       { colors: ColorItem[]; bahans: BahanItem[]; sizes: SizeItem[] }
  sablonItems:   PricingItem[]
  productConfig: Record<string, number>
  configDefaults: Record<string, number>
  defaults: { colors: { label: string; value: string }[] }
}

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

function DeleteBtn({ id, label }: { id: string; label?: string }) {
  const router = useRouter()
  const { toast } = useAdminToast()
  const [busy, setBusy] = useState(false)
  return (
    <button type="button" className="btn-admin-danger"
      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await deleteCustomProductOptionAction(id)
        toast(label ? `${label} deleted` : 'Deleted', 'error')
        router.refresh()
      }}>
      Delete
    </button>
  )
}

function AddColorForm({ productType }: { productType: string }) {
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { ref.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={ref} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="color" />
      <input type="text" name="label" placeholder="Color name…" className="admin-form-input" style={{ flex: 1, minWidth: 110 }} required />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: '0.78rem', color: '#666' }}>Hex:</label>
        <input type="color" name="value" defaultValue="#ffffff" style={{ width: 38, height: 32, padding: 2, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }} />
      </div>
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Add'}
      </button>
      {state.error && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function AddBahanForm({ productType }: { productType: string }) {
  const router = useRouter()
  const { toast } = useAdminToast()
  const ref = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => {
    if (state.ok) { ref.current?.reset(); toast('Material successfully added'); router.refresh() }
    if (state.error) toast(state.error, 'error')
  }, [state.ok, state.error, router])
  return (
    <form ref={ref} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="bahan" />
      <input type="text" name="label" placeholder="New material name…" className="admin-form-input" style={{ flex: 1, minWidth: 130 }} required />
      <input type="number" name="price" placeholder="Price/pcs" className="admin-form-input" style={{ width: 140 }} min={0} step={1000} defaultValue={0}
        onFocus={e => { if (e.target.value === '0') e.target.value = '' }}
        onBlur={e => { if (e.target.value === '') e.target.value = '0' }} />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Add'}
      </button>
      {state.error && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function AddSizeForm({ productType }: { productType: string }) {
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { ref.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={ref} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="size" />
      <input type="text" name="label" placeholder="New size (e.g. XXXL)" className="admin-form-input" style={{ flex: 1, minWidth: 130 }} required />
      <input type="number" name="price" placeholder="Surcharge (Rp)" className="admin-form-input" style={{ width: 150 }} min={0} step={1000} defaultValue={0}
        onFocus={e => { if (e.target.value === '0') e.target.value = '' }}
        onBlur={e => { if (e.target.value === '') e.target.value = '0' }} />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Add'}
      </button>
      {state.error && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function PriceCell({ item, productType, category }: { item: BahanItem; productType: string; category: 'bahan' | 'size' }) {
  const router = useRouter()
  const { toast } = useAdminToast()
  const [price, setPrice] = useState(item.price)
  const [saving, setSaving] = useState(false)
  const isVirtual = item.id.startsWith('__new__:')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="number" value={price} min={0} step={1000}
        className="admin-form-input" style={{ width: 120 }}
        onFocus={e => { e.target.select(); if (price === 0) setPrice('' as unknown as number) }}
        onBlur={e => { if (e.target.value === '') setPrice(0) }}
        onChange={e => setPrice(e.target.value === '' ? '' as unknown as number : parseInt(e.target.value) || 0)} />
      {price !== item.price && (
        <button type="button" className="btn-admin-primary"
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            const res = isVirtual
              ? await upsertCustomProductOptionPriceAction(productType, category, item.label, price, item.sortOrder)
              : await updateCustomProductOptionPriceAction(item.id, price)
            setSaving(false)
            if (res?.ok) {
              toast(`Price for ${item.label} saved`)
              router.refresh()
            } else {
              toast(res?.error ?? 'Failed to save price', 'error')
            }
          }}>
          {saving ? '…' : 'Save'}
        </button>
      )}
    </div>
  )
}

function EditableRow({
  item, category, productType, onDone,
}: {
  item: BahanItem | SizeItem
  category: 'bahan' | 'size'
  productType: string
  onDone: () => void
}) {
  const router = useRouter()
  const { toast } = useAdminToast()
  const [label, setLabel] = useState(item.label)
  const [price, setPrice] = useState(item.price)
  const [saving, setSaving] = useState(false)
  const isVirtual = item.id.startsWith('__new__:')

  async function handleSave() {
    setSaving(true)
    const res = isVirtual
      ? await upsertCustomProductOptionPriceAction(productType, category, label, price, item.sortOrder)
      : await updateCustomProductOptionAction(item.id, label, price)
    setSaving(false)
    if (res?.ok) { toast(`${label} updated`); onDone(); router.refresh() }
    else toast(res?.error ?? 'Failed to save', 'error')
  }

  return (
    <tr style={{ background: '#faf9f7' }}>
      <td>
        <input value={label} onChange={e => setLabel(e.target.value)}
          className="admin-form-input" style={{ width: '100%', minWidth: 120 }} />
      </td>
      <td>
        <input type="number" value={price} min={0} step={1000}
          className="admin-form-input" style={{ width: 120 }}
          onFocus={e => { e.target.select(); if (price === 0) setPrice('' as unknown as number) }}
          onBlur={e => { if (e.target.value === '') setPrice(0) }}
          onChange={e => setPrice(e.target.value === '' ? '' as unknown as number : parseInt(e.target.value) || 0)} />
      </td>
      <td style={{ color: '#999', fontSize: '0.78rem' }}>
        {category === 'size' ? (price > 0 ? `+${formatRp(price as number)}` : '—') : formatRp(price as number)}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="btn-admin-primary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
            disabled={saving} onClick={handleSave}>
            {saving ? '…' : 'Save'}
          </button>
          <button type="button" className="btn-admin-secondary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
            onClick={onDone}>
            Cancel
          </button>
        </div>
      </td>
    </tr>
  )
}

function FotoCard({ productId, savedImage }: { productId: string; savedImage?: string }) {
  const [currentImage, setCurrentImage] = useState(savedImage)
  const [preview, setPreview]           = useState<string | null>(null)
  const [fileName, setFileName]         = useState<string | null>(null)
  const [isPending, startTransition]    = useTransition()
  const formRef  = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useAdminToast()
  const displayed = preview ?? currentImage ?? null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setFileName(file.name)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formRef.current) return
    const fd = new FormData(formRef.current)
    startTransition(async () => {
      const result = await updateCustomProductImageAction(productId, fd)
      if ('url' in result) {
        setCurrentImage(result.url); setPreview(null)
        toast('Photo saved successfully')
      } else {
        toast(result.error, 'error')
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1.5px dashed #d4ccbf', borderRadius: 10, cursor: 'pointer', background: fileName ? '#faf8f5' : '#fff', flex: 1 }}
          onClick={() => inputRef.current?.click()}>
          {displayed ? (
            <img src={displayed} alt="bg" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 5, flexShrink: 0, border: '1px solid #e5e0d8' }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 5, background: '#f0ede8', border: '1px dashed #d4ccbf', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
          )}
          <span style={{ fontSize: '0.82rem', color: fileName ? '#0d0d0d' : currentImage ? '#555' : '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {fileName ?? (currentImage ? 'Photo set — click to change' : 'Click to select photo…')}
          </span>
          {(fileName || currentImage) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <input ref={inputRef} type="file" name="image" accept="image/*" required={!currentImage} onChange={handleFileChange} style={{ display: 'none' }} />
        <button type="submit" className="btn-admin-primary" style={{ whiteSpace: 'nowrap' }} disabled={isPending || (!preview && !fileName)}>
          {isPending ? '…' : currentImage && !preview ? 'Change Photo' : 'Save Photo'}
        </button>
      </form>
  )
}

const hint = (text: string) => <p className="admin-form-hint" style={{ marginBottom: 8 }}>Default: {text}</p>

// Labels shown to admin per config key
const CONFIG_LABELS: Record<string, string> = {
  logo_combo_price: 'Logo combo price (front+back)/side',
  price_front:      'Front only price/pcs',
  price_both:       'Front+back price/pcs',
  surcharge_a3:     'A3 size surcharge/pcs',
  perekat_a4:       'A4 adhesive cost/pcs',
  perekat_a3:       'A3 adhesive cost/pcs',
  min_qty_a4:       'Min. order A4 (pcs)',
  min_qty_a3:       'Min. order A3 (pcs)',
  min_qty:          'Min. order (pcs)',
}

function ProductConfigSection({
  productId, config, defaults,
}: { productId: string; config: Record<string, number>; defaults: Record<string, number> }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(updateProductConfigAction, {})
  useEffect(() => { if (state.ok) router.refresh() }, [state.ok, router])

  const keys = Object.keys(defaults)
  if (keys.length === 0) return null

  return (
    <form action={action}>
      <input type="hidden" name="product_type" value={productId} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Setting</th><th style={{ width: 170 }}>Value</th><th style={{ width: 130 }}>Current</th></tr></thead>
          <tbody>
            {keys.map(key => (
              <tr key={key}>
                <td style={{ fontWeight: 500 }}>{CONFIG_LABELS[key] ?? key}</td>
                <td>
                  <input type="number" name={key} defaultValue={config[key] ?? defaults[key]}
                    min={0} step={key.includes('qty') ? 1 : 100}
                    className="admin-form-input" style={{ width: 130 }} />
                </td>
                <td style={{ color: '#999', fontSize: '0.78rem' }}>
                  {key.includes('qty')
                    ? `${config[key] ?? defaults[key]} pcs`
                    : 'Rp ' + (config[key] ?? defaults[key]).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {state.ok && <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: 6 }}>Saved.</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button type="submit" className="btn-admin-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}

function SablonSection({ items }: { items: PricingItem[] }) {
  const [saveState, saveAction, savePending] = useActionState(updatePricingAction, {})

  return (
    <form action={saveAction}>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Size</th><th style={{ width: 200 }}>Price/side</th><th style={{ width: 140 }}>Current value</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.label}</td>
                <td>
                  <input type="number" name={`price-${item.id}`} defaultValue={item.price}
                    min={1000} step={500} className="admin-form-input" style={{ width: 130 }} />
                </td>
                <td style={{ color: '#999', fontSize: '0.78rem' }}>{'Rp ' + item.price.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {saveState.ok && <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: 6 }}>Price saved.</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button type="submit" className="btn-admin-primary" disabled={savePending}>
          {savePending ? 'Saving…' : 'Save Screen Print Prices'}
        </button>
      </div>
    </form>
  )
}

function CollapsibleCard({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="admin-form-card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{title}</span>
        <svg
          width="14" height="14" viewBox="0 0 10 10" fill="none"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 1.1rem 1rem' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function CustomProductEditClient({
  productId, productName, productSub, hasColors, hasBahan, hasSizes, hasSablon,
  savedImage, options, sablonItems, productConfig, configDefaults, defaults,
}: Props) {
  const hasConfig = Object.keys(configDefaults).length > 0
  const sections = [
    'foto',
    ...(hasColors  ? ['warna']  : []),
    ...(hasBahan   ? ['bahan']  : []),
    ...(hasSizes   ? ['ukuran'] : []),
    ...(hasSablon  ? ['sablon'] : []),
    ...(hasConfig  ? ['config'] : []),
  ]
  const [openMap, setOpenMap]   = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  const toggle = (key: string) => setOpenMap(p => ({ ...p, [key]: !p[key] }))
  const allOpen = sections.every(s => openMap[s])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <div className="admin-page-header">
        <div>
          <Link href="/admin/custom-products" style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            ← Custom Products
          </Link>
          <h1 className="admin-page-title">{productName} <span style={{ color: '#aaa', fontWeight: 400 }}>· {productSub}</span></h1>
          <p className="admin-page-subtitle">Manage photos, colors, materials, and sizes for this product</p>
        </div>
        <button type="button" className="btn-admin-secondary"
          style={{ fontSize: '0.82rem', alignSelf: 'center' }}
          onClick={() => setOpenMap(allOpen ? {} : Object.fromEntries(sections.map(s => [s, true])))}>
          {allOpen ? 'Hide All' : 'Show All'}
        </button>
      </div>

      <CollapsibleCard title="Background Photo" open={!!openMap['foto']} onToggle={() => toggle('foto')}>
        <FotoCard productId={productId} savedImage={savedImage} />
      </CollapsibleCard>

      {hasColors && (
        <CollapsibleCard title="Warna" open={!!openMap['warna']} onToggle={() => toggle('warna')}>
          {options.colors.length === 0 && hint(defaults.colors.map(c => c.label).join(', '))}
          {options.colors.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th style={{ width: 140 }}>Color</th><th style={{ width: 80 }}></th></tr></thead>
                <tbody>
                  {options.colors.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.label}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 4, background: c.value, border: '1px solid #ddd', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>{c.value}</span>
                        </div>
                      </td>
                      <td><DeleteBtn id={c.id} label={c.label} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AddColorForm productType={productId} />
        </CollapsibleCard>
      )}

      {hasBahan && (
        <CollapsibleCard title="Material Type" open={!!openMap['bahan']} onToggle={() => toggle('bahan')}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Label</th><th style={{ width: 200 }}>Price/pcs</th><th style={{ width: 120 }}>Value</th><th style={{ width: 160 }}></th></tr></thead>
              <tbody>
                {options.bahans.map(b => {
                  const isVirtual = b.id.startsWith('__new__:')
                  if (editingId === b.id) {
                    return <EditableRow key={b.id} item={b} category="bahan" productType={productId} onDone={() => setEditingId(null)} />
                  }
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.label}</td>
                      <td><PriceCell item={b} productType={productId} category="bahan" /></td>
                      <td style={{ color: '#999', fontSize: '0.78rem' }}>{formatRp(b.price)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button type="button" className="btn-admin-secondary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                            onClick={() => setEditingId(b.id)}>
                            Edit
                          </button>
                          {!isVirtual && <DeleteBtn id={b.id} label={b.label} />}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <AddBahanForm productType={productId} />
        </CollapsibleCard>
      )}

      {hasSizes && (
        <CollapsibleCard title="Sizes" open={!!openMap['ukuran']} onToggle={() => toggle('ukuran')}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th style={{ width: 200 }}>Surcharge/pcs</th>
                  <th style={{ width: 120 }}>Value</th>
                  <th style={{ width: 160 }}></th>
                </tr>
              </thead>
              <tbody>
                {options.sizes.map(s => {
                  const isVirtual = s.id.startsWith('__new__:')
                  if (editingId === s.id) {
                    return <EditableRow key={s.id} item={s} category="size" productType={productId} onDone={() => setEditingId(null)} />
                  }
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.label}</td>
                      <td><PriceCell item={s} productType={productId} category="size" /></td>
                      <td style={{ color: '#999', fontSize: '0.78rem' }}>{s.price > 0 ? `+${formatRp(s.price)}` : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button type="button" className="btn-admin-secondary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                            onClick={() => setEditingId(s.id)}>
                            Edit
                          </button>
                          {!isVirtual && <DeleteBtn id={s.id} label={s.label} />}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <AddSizeForm productType={productId} />
        </CollapsibleCard>
      )}

      {hasSablon && (
        <CollapsibleCard title="Print Price" open={!!openMap['sablon']} onToggle={() => toggle('sablon')}>
          <SablonSection items={sablonItems} />
        </CollapsibleCard>
      )}

      {hasConfig && (
        <CollapsibleCard title="Pricing & Terms" open={!!openMap['config']} onToggle={() => toggle('config')}>
          <ProductConfigSection productId={productId} config={productConfig} defaults={configDefaults} />
        </CollapsibleCard>
      )}

      {!hasColors && !hasBahan && !hasSizes && !hasSablon && !hasConfig && (
        <div className="admin-form-card" style={{ color: '#aaa', fontSize: '0.82rem', padding: '1rem 1.1rem' }}>
          No configurable options available for this product.
        </div>
      )}
    </div>
  )
}
