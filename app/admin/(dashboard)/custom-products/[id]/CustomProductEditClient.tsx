'use client'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addCustomProductOptionAction, deleteCustomProductOptionAction, updateCustomProductOptionPriceAction } from '@/lib/actions'

type ColorItem = { id: string; label: string; value: string }
type BahanItem = { id: string; label: string; price: number }
type SizeItem  = { id: string; label: string }

type Props = {
  productId: string
  productName: string
  hasColors: boolean
  hasBahan:  boolean
  hasSizes:  boolean
  options:  { colors: ColorItem[]; bahans: BahanItem[]; sizes: SizeItem[] }
  defaults: { colors: { label: string; value: string }[]; bahans: { label: string }[]; sizes: { label: string }[] }
}

function formatRp(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

function DeleteBtn({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <button type="button" className="btn-admin-danger"
      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
      disabled={busy}
      onClick={async () => { setBusy(true); await deleteCustomProductOptionAction(id); router.refresh() }}>
      Hapus
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
      <input type="text" name="label" placeholder="Nama warna (misal: Merah)" className="admin-form-input" style={{ flex: 1, minWidth: 130 }} required />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: '0.78rem', color: '#666' }}>Hex:</label>
        <input type="color" name="value" defaultValue="#ffffff" style={{ width: 40, height: 32, padding: 2, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }} />
      </div>
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Tambah Warna'}
      </button>
      {state.error && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function AddBahanForm({ productType }: { productType: string }) {
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { ref.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={ref} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="bahan" />
      <input type="text" name="label" placeholder="Nama bahan baru…" className="admin-form-input" style={{ flex: 1, minWidth: 140 }} required />
      <input type="number" name="price" placeholder="Harga/pcs" className="admin-form-input" style={{ width: 150 }} min={0} step={1000} defaultValue={0} />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Tambah Bahan'}
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
    <form ref={ref} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="size" />
      <input type="text" name="label" placeholder="Ukuran baru (misal: XXXL)" className="admin-form-input" style={{ flex: 1 }} required />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Tambah Ukuran'}
      </button>
      {state.error && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function PriceCell({ item }: { item: BahanItem }) {
  const router = useRouter()
  const [price, setPrice] = useState(item.price)
  const [saving, setSaving] = useState(false)
  const changed = price !== item.price
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="number" value={price} min={0} step={1000}
        className="admin-form-input" style={{ width: 130 }}
        onChange={e => setPrice(parseInt(e.target.value) || 0)} />
      {changed && (
        <button type="button" className="btn-admin-primary"
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            await updateCustomProductOptionPriceAction(item.id, price)
            setSaving(false); router.refresh()
          }}>
          {saving ? '…' : 'Simpan'}
        </button>
      )}
    </div>
  )
}

export default function CustomProductEditClient({ productId, hasColors, hasBahan, hasSizes, options, defaults }: Props) {
  const hint = (text: string) => (
    <p className="admin-form-hint" style={{ marginBottom: 8 }}>Default: {text}</p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720 }}>

      {hasColors && (
        <div className="admin-form-card">
          <p className="admin-form-section-title">Warna</p>
          {options.colors.length === 0 && hint(defaults.colors.map(c => c.label).join(', '))}
          {options.colors.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Nama</th><th style={{ width: 120 }}>Warna</th><th style={{ width: 80 }}></th></tr>
                </thead>
                <tbody>
                  {options.colors.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.label}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 4, background: c.value, border: '1px solid #ddd', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.78rem', color: '#888' }}>{c.value}</span>
                        </div>
                      </td>
                      <td><DeleteBtn id={c.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AddColorForm productType={productId} />
        </div>
      )}

      {hasBahan && (
        <div className="admin-form-card">
          <p className="admin-form-section-title">Jenis Bahan</p>
          {options.bahans.length === 0 && hint(defaults.bahans.map(b => b.label).join(', '))}
          {options.bahans.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Label</th><th style={{ width: 210 }}>Harga/pcs</th><th style={{ width: 130 }}>Nilai saat ini</th><th style={{ width: 80 }}></th></tr>
                </thead>
                <tbody>
                  {options.bahans.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.label}</td>
                      <td><PriceCell item={b} /></td>
                      <td style={{ color: '#999', fontSize: '0.82rem' }}>{formatRp(b.price)}</td>
                      <td><DeleteBtn id={b.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AddBahanForm productType={productId} />
        </div>
      )}

      {hasSizes && (
        <div className="admin-form-card">
          <p className="admin-form-section-title">Ukuran</p>
          {options.sizes.length === 0 && hint(defaults.sizes.map(s => s.label).join(', '))}
          {options.sizes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {options.sizes.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f0', borderRadius: 8, padding: '5px 12px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{s.label}</span>
                  <DeleteBtn id={s.id} />
                </div>
              ))}
            </div>
          )}
          <AddSizeForm productType={productId} />
        </div>
      )}

      {!hasColors && !hasBahan && !hasSizes && (
        <div className="admin-form-card">
          <p className="admin-form-hint">Tidak ada opsi yang bisa dikonfigurasi untuk produk ini.</p>
        </div>
      )}
    </div>
  )
}
