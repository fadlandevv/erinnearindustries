'use client'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  addCustomProductOptionAction,
  deleteCustomProductOptionAction,
  updateCustomProductOptionPriceAction,
  updateCustomProductImageAction,
} from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'

type ColorItem = { id: string; label: string; value: string }
type BahanItem = { id: string; label: string; price: number }
type SizeItem  = { id: string; label: string }

type Props = {
  productId: string
  productName: string
  hasColors: boolean
  hasBahan:  boolean
  hasSizes:  boolean
  savedImage?: string
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
      <input type="text" name="label" placeholder="Nama warna…" className="admin-form-input" style={{ flex: 1, minWidth: 110 }} required />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: '0.78rem', color: '#666' }}>Hex:</label>
        <input type="color" name="value" defaultValue="#ffffff" style={{ width: 38, height: 32, padding: 2, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }} />
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
  const ref = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { ref.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={ref} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="bahan" />
      <input type="text" name="label" placeholder="Nama bahan baru…" className="admin-form-input" style={{ flex: 1, minWidth: 130 }} required />
      <input type="number" name="price" placeholder="Harga/pcs" className="admin-form-input" style={{ width: 140 }} min={0} step={1000} defaultValue={0} />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Tambah'}
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
        {pending ? '…' : '+ Tambah'}
      </button>
      {state.error && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function PriceCell({ item }: { item: BahanItem }) {
  const router = useRouter()
  const [price, setPrice] = useState(item.price)
  const [saving, setSaving] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="number" value={price} min={0} step={1000}
        className="admin-form-input" style={{ width: 120 }}
        onChange={e => setPrice(parseInt(e.target.value) || 0)} />
      {price !== item.price && (
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
        toast('Foto berhasil disimpan')
      } else {
        toast(result.error, 'error')
      }
    })
  }

  return (
    <div className="admin-form-card" style={{ height: '100%' }}>
      <p className="admin-form-section-title">Foto Background</p>
      <div className="admin-showcase-preview" style={{ marginBottom: 12 }}>
        {displayed ? (
          <img src={displayed} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div className="admin-gallery-empty" style={{ flexDirection: 'column', gap: 8, border: '1.5px dashed rgba(255,255,255,0.15)', margin: 12, borderRadius: 8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
            </svg>
            <span>Belum ada foto</span>
          </div>
        )}
        {preview && (
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: 6, pointerEvents: 'none', zIndex: 2 }}>
            Preview
          </div>
        )}
      </div>
      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="admin-form-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1.5px dashed #d4ccbf', borderRadius: 10, cursor: 'pointer', background: fileName ? '#faf8f5' : '#fff' }}
            onClick={() => inputRef.current?.click()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{ fontSize: '0.82rem', color: fileName ? '#0d0d0d' : '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {fileName ?? 'Klik untuk pilih foto…'}
            </span>
            {fileName && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <input ref={inputRef} type="file" name="image" accept="image/*" required={!currentImage} onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn-admin-primary" style={{ width: '100%' }} disabled={isPending || (!preview && !fileName)}>
            {isPending ? 'Menyimpan…' : currentImage && !preview ? 'Ganti Foto' : 'Simpan Foto'}
          </button>
        </div>
      </form>
    </div>
  )
}

const col2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' } as const
const hint = (text: string) => <p className="admin-form-hint" style={{ marginBottom: 8 }}>Default: {text}</p>

export default function CustomProductEditClient({
  productId, hasColors, hasBahan, hasSizes, savedImage, options, defaults,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 860 }}>

      {/* Row 1: Foto + Warna */}
      <div style={col2}>
        <FotoCard productId={productId} savedImage={savedImage} />

        {hasColors ? (
          <div className="admin-form-card">
            <p className="admin-form-section-title">Warna</p>
            {options.colors.length === 0 && hint(defaults.colors.map(c => c.label).join(', '))}
            {options.colors.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Nama</th><th style={{ width: 110 }}>Warna</th><th style={{ width: 80 }}></th></tr></thead>
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
                        <td><DeleteBtn id={c.id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <AddColorForm productType={productId} />
          </div>
        ) : (
          <div className="admin-form-card" style={{ color: '#aaa', fontSize: '0.82rem' }}>
            Produk ini tidak menggunakan pilihan warna.
          </div>
        )}
      </div>

      {/* Row 2: Bahan + Ukuran */}
      <div style={col2}>
        {hasBahan ? (
          <div className="admin-form-card">
            <p className="admin-form-section-title">Jenis Bahan</p>
            {options.bahans.length === 0 && hint(defaults.bahans.map(b => b.label).join(', '))}
            {options.bahans.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Label</th><th style={{ width: 180 }}>Harga/pcs</th><th style={{ width: 110 }}>Nilai</th><th style={{ width: 80 }}></th></tr></thead>
                  <tbody>
                    {options.bahans.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.label}</td>
                        <td><PriceCell item={b} /></td>
                        <td style={{ color: '#999', fontSize: '0.78rem' }}>{formatRp(b.price)}</td>
                        <td><DeleteBtn id={b.id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <AddBahanForm productType={productId} />
          </div>
        ) : (
          <div className="admin-form-card" style={{ color: '#aaa', fontSize: '0.82rem' }}>
            Produk ini tidak menggunakan pilihan bahan.
          </div>
        )}

        {hasSizes ? (
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
        ) : (
          <div className="admin-form-card" style={{ color: '#aaa', fontSize: '0.82rem' }}>
            Produk ini tidak menggunakan pilihan ukuran.
          </div>
        )}
      </div>
    </div>
  )
}
