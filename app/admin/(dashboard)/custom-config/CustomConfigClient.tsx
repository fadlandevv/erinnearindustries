'use client'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addCustomProductOptionAction, deleteCustomProductOptionAction, updateCustomProductOptionPriceAction } from '@/lib/actions'

type ColorItem = { id: string; label: string; value: string }
type BahanItem = { id: string; label: string; price: number }
type SizeItem  = { id: string; label: string }

type Product = {
  id: string
  name: string
  hasColors: boolean
  hasBahan: boolean
  hasSizes: boolean
  options: { colors: ColorItem[]; bahans: BahanItem[]; sizes: SizeItem[] }
  defaults: { colors: { label: string; value: string }[]; bahans: { label: string }[]; sizes: { label: string }[] }
}

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

function DeleteBtn({ id, onDone }: { id: string; onDone: () => void }) {
  return (
    <button type="button" className="btn-admin-danger"
      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
      onClick={async () => { await deleteCustomProductOptionAction(id); onDone() }}>
      Hapus
    </button>
  )
}

function AddColorForm({ productType }: { productType: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { formRef.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={formRef} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="color" />
      <input type="text" name="label" placeholder="Nama warna (misal: Merah)" className="admin-form-input" style={{ flex: 1, minWidth: 130 }} required />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: '0.78rem', color: '#666' }}>Hex:</label>
        <input type="color" name="value" defaultValue="#ffffff" style={{ width: 40, height: 32, padding: 2, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }} required />
      </div>
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Tambah'}
      </button>
      {state.error && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function AddBahanForm({ productType }: { productType: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { formRef.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={formRef} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="bahan" />
      <input type="text" name="label" placeholder="Nama bahan baru…" className="admin-form-input" style={{ flex: 1, minWidth: 140 }} required />
      <input type="number" name="price" placeholder="Harga/pcs (0 = gratis)" className="admin-form-input" style={{ width: 160 }} min={0} step={1000} defaultValue={0} />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Tambah'}
      </button>
      {state.error && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function AddSizeForm({ productType }: { productType: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { formRef.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={formRef} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="size" />
      <input type="text" name="label" placeholder="Ukuran baru (misal: XXXL)" className="admin-form-input" style={{ flex: 1 }} required />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Tambah'}
      </button>
      {state.error && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function PriceCell({ item }: { item: BahanItem }) {
  const router = useRouter()
  const [price, setPrice] = useState(item.price)
  const [saving, setSaving] = useState(false)
  const changed = price !== item.price
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input type="number" value={price} min={0} step={1000}
        className="admin-form-input" style={{ width: 120 }}
        onChange={e => setPrice(parseInt(e.target.value) || 0)} />
      {changed && (
        <button type="button" className="btn-admin-primary"
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            await updateCustomProductOptionPriceAction(item.id, price)
            setSaving(false)
            router.refresh()
          }}>
          {saving ? '…' : 'Simpan'}
        </button>
      )}
    </div>
  )
}

function ColorSection({ productId, items, defaults, refresh }: {
  productId: string; items: ColorItem[]; defaults: { label: string; value: string }[]; refresh: () => void
}) {
  const isEmpty = items.length === 0
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p className="admin-form-section-title">Warna</p>
      {isEmpty && (
        <p className="admin-form-hint" style={{ marginBottom: 8 }}>
          Kosong — menggunakan default: {defaults.map(c => c.label).join(', ')}
        </p>
      )}
      {items.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Nama</th><th style={{ width: 80 }}>Warna</th><th style={{ width: 80 }}></th></tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.label}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 4, background: c.value, border: '1px solid #ddd' }} />
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>{c.value}</span>
                    </div>
                  </td>
                  <td><DeleteBtn id={c.id} onDone={refresh} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AddColorForm productType={productId} />
    </div>
  )
}

function BahanSection({ productId, items, defaults, refresh }: {
  productId: string; items: BahanItem[]; defaults: { label: string }[]; refresh: () => void
}) {
  const isEmpty = items.length === 0
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p className="admin-form-section-title">Jenis Bahan</p>
      {isEmpty && (
        <p className="admin-form-hint" style={{ marginBottom: 8 }}>
          Kosong — menggunakan default: {defaults.map(d => d.label).join(', ')}
        </p>
      )}
      {items.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Label</th><th style={{ width: 200 }}>Harga/pcs</th><th style={{ width: 120 }}>Nilai saat ini</th><th style={{ width: 80 }}></th></tr></thead>
            <tbody>
              {items.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.label}</td>
                  <td><PriceCell item={b} /></td>
                  <td style={{ color: '#999', fontSize: '0.82rem' }}>{formatRp(b.price)}</td>
                  <td><DeleteBtn id={b.id} onDone={refresh} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AddBahanForm productType={productId} />
    </div>
  )
}

function SizeSection({ productId, items, defaults, refresh }: {
  productId: string; items: SizeItem[]; defaults: { label: string }[]; refresh: () => void
}) {
  const isEmpty = items.length === 0
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p className="admin-form-section-title">Ukuran</p>
      {isEmpty && (
        <p className="admin-form-hint" style={{ marginBottom: 8 }}>
          Kosong — menggunakan default: {defaults.map(d => d.label).join(', ')}
        </p>
      )}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {items.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f0', borderRadius: 8, padding: '4px 10px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600 }}>{s.label}</span>
              <DeleteBtn id={s.id} onDone={refresh} />
            </div>
          ))}
        </div>
      )}
      <AddSizeForm productType={productId} />
    </div>
  )
}

export default function CustomConfigClient({ products }: { products: Product[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(products[0]?.id ?? '')
  const refresh = () => router.refresh()
  const product = products.find(p => p.id === activeTab)

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #eee', paddingBottom: 0 }}>
        {products.map(p => (
          <button key={p.id} type="button"
            onClick={() => setActiveTab(p.id)}
            style={{
              padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: activeTab === p.id ? 700 : 400,
              color: activeTab === p.id ? '#0d0d0d' : '#888',
              borderBottom: activeTab === p.id ? '2px solid #0d0d0d' : '2px solid transparent',
              fontSize: '0.88rem', marginBottom: -1,
            }}>
            {p.name}
          </button>
        ))}
      </div>

      {product && (
        <div className="admin-form-card" style={{ maxWidth: 720 }}>
          {product.hasColors && (
            <ColorSection productId={product.id} items={product.options.colors} defaults={product.defaults.colors} refresh={refresh} />
          )}
          {product.hasBahan && (
            <BahanSection productId={product.id} items={product.options.bahans} defaults={product.defaults.bahans} refresh={refresh} />
          )}
          {product.hasSizes && (
            <SizeSection productId={product.id} items={product.options.sizes} defaults={product.defaults.sizes} refresh={refresh} />
          )}
          {!product.hasColors && !product.hasBahan && !product.hasSizes && (
            <p className="admin-form-hint">Tidak ada opsi yang bisa dikonfigurasi untuk produk ini.</p>
          )}
        </div>
      )}
    </div>
  )
}
