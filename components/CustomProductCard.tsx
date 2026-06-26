'use client'
import { useRef, useState, useTransition, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateCustomProductImageAction, addCustomProductOptionAction, deleteCustomProductOptionAction, updateCustomProductOptionPriceAction } from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'

type ColorItem = { id: string; label: string; value: string }
type BahanItem = { id: string; label: string; price: number }
type SizeItem  = { id: string; label: string }

type Props = {
  id: string
  name: string
  sub: string
  savedImage?: string
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
      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
      disabled={busy}
      onClick={async () => { setBusy(true); await deleteCustomProductOptionAction(id); router.refresh() }}>
      ×
    </button>
  )
}

function AddColorForm({ productType }: { productType: string }) {
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { ref.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={ref} action={action} style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="color" />
      <input type="text" name="label" placeholder="Nama warna…" className="admin-form-input" style={{ flex: 1, minWidth: 100 }} required />
      <input type="color" name="value" defaultValue="#ffffff" style={{ width: 36, height: 30, padding: 2, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }} />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap', padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}>
        {pending ? '…' : '+ Tambah'}
      </button>
      {state.error && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function AddBahanForm({ productType }: { productType: string }) {
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { ref.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={ref} action={action} style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="bahan" />
      <input type="text" name="label" placeholder="Nama bahan…" className="admin-form-input" style={{ flex: 1, minWidth: 100 }} required />
      <input type="number" name="price" placeholder="Harga" className="admin-form-input" style={{ width: 100 }} min={0} step={1000} defaultValue={0} />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap', padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}>
        {pending ? '…' : '+ Tambah'}
      </button>
      {state.error && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function AddSizeForm({ productType }: { productType: string }) {
  const router = useRouter()
  const ref = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addCustomProductOptionAction, {})
  useEffect(() => { if (state.ok) { ref.current?.reset(); router.refresh() } }, [state.ok, router])
  return (
    <form ref={ref} action={action} style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="category" value="size" />
      <input type="text" name="label" placeholder="Ukuran baru…" className="admin-form-input" style={{ flex: 1 }} required />
      <button type="submit" className="btn-admin-primary" disabled={pending} style={{ whiteSpace: 'nowrap', padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}>
        {pending ? '…' : '+ Tambah'}
      </button>
      {state.error && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{state.error}</span>}
    </form>
  )
}

function BahanPriceCell({ item }: { item: BahanItem }) {
  const router = useRouter()
  const [price, setPrice] = useState(item.price)
  const [saving, setSaving] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input type="number" value={price} min={0} step={1000}
        className="admin-form-input" style={{ width: 90, fontSize: '0.78rem' }}
        onChange={e => setPrice(parseInt(e.target.value) || 0)} />
      {price !== item.price && (
        <button type="button" className="btn-admin-primary"
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            await updateCustomProductOptionPriceAction(item.id, price)
            setSaving(false); router.refresh()
          }}>
          {saving ? '…' : 'OK'}
        </button>
      )}
    </div>
  )
}

function DetailSection({ id, hasColors, hasBahan, hasSizes, options, defaults }: {
  id: string
  hasColors: boolean; hasBahan: boolean; hasSizes: boolean
  options: Props['options']; defaults: Props['defaults']
}) {
  const hint = { fontSize: '0.72rem', color: '#999', marginBottom: 4 }
  const secTitle = { fontWeight: 600, fontSize: '0.78rem', color: '#555', marginBottom: 6, marginTop: 14, display: 'block' as const }

  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 12 }}>

      {hasColors && (
        <div>
          <span style={secTitle}>Warna</span>
          {options.colors.length === 0
            ? <p style={hint}>Default: {defaults.colors.map(c => c.label).join(', ')}</p>
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                {options.colors.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f5f5f0', borderRadius: 6, padding: '3px 8px', fontSize: '0.78rem' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: c.value, border: '1px solid #ddd', flexShrink: 0 }} />
                    <span>{c.label}</span>
                    <DeleteBtn id={c.id} />
                  </div>
                ))}
              </div>
          }
          <AddColorForm productType={id} />
        </div>
      )}

      {hasBahan && (
        <div>
          <span style={secTitle}>Jenis Bahan</span>
          {options.bahans.length === 0
            ? <p style={hint}>Default: {defaults.bahans.map(b => b.label).join(', ')}</p>
            : <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', marginBottom: 4 }}>
                <tbody>
                  {options.bahans.map(b => (
                    <tr key={b.id}>
                      <td style={{ padding: '3px 0', fontWeight: 600 }}>{b.label}</td>
                      <td style={{ padding: '3px 6px' }}><BahanPriceCell item={b} /></td>
                      <td style={{ color: '#aaa', fontSize: '0.7rem', paddingRight: 6 }}>{formatRp(b.price)}</td>
                      <td><DeleteBtn id={b.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
          <AddBahanForm productType={id} />
        </div>
      )}

      {hasSizes && (
        <div>
          <span style={secTitle}>Ukuran</span>
          {options.sizes.length === 0
            ? <p style={hint}>Default: {defaults.sizes.map(s => s.label).join(', ')}</p>
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                {options.sizes.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f5f5f0', borderRadius: 6, padding: '3px 8px', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 600 }}>{s.label}</span>
                    <DeleteBtn id={s.id} />
                  </div>
                ))}
              </div>
          }
          <AddSizeForm productType={id} />
        </div>
      )}

      {!hasColors && !hasBahan && !hasSizes && (
        <p style={hint}>Tidak ada opsi yang bisa dikonfigurasi untuk produk ini.</p>
      )}
    </div>
  )
}

export default function CustomProductCard({ id, name, sub, savedImage, hasColors, hasBahan, hasSizes, options, defaults }: Props) {
  const [currentImage, setCurrentImage] = useState(savedImage)
  const [preview, setPreview]           = useState<string | null>(null)
  const [fileName, setFileName]         = useState<string | null>(null)
  const [isPending, startTransition]    = useTransition()
  const [showDetail, setShowDetail]     = useState(false)
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
    const formData = new FormData(formRef.current)
    startTransition(async () => {
      const result = await updateCustomProductImageAction(id, formData)
      if ('url' in result) {
        setCurrentImage(result.url)
        setPreview(null)
        toast('Foto berhasil disimpan')
      } else {
        toast(result.error, 'error')
      }
    })
  }

  return (
    <div className="admin-form-card">
      {/* Preview area */}
      <div className="admin-showcase-preview">
        {displayed ? (
          <img src={displayed} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 10 }}>
          {name} <span style={{ fontWeight: 400, color: '#888' }}>· {sub}</span>
        </div>
        <div className="admin-form-group">
          <label>Foto Background</label>
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
        <div className="admin-form-actions" style={{ justifyContent: 'space-between' }}>
          <button type="button"
            onClick={() => setShowDetail(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#888', padding: 0, textDecoration: 'underline' }}>
            {showDetail ? 'Tutup Detail' : 'Lihat Detail'}
          </button>
          <button type="submit" className="btn-admin-primary" disabled={isPending || (!preview && !fileName)}>
            {isPending ? 'Menyimpan…' : currentImage && !preview ? 'Ganti Foto' : 'Simpan'}
          </button>
        </div>
      </form>

      {showDetail && (
        <DetailSection
          id={id}
          hasColors={hasColors}
          hasBahan={hasBahan}
          hasSizes={hasSizes}
          options={options}
          defaults={defaults}
        />
      )}
    </div>
  )
}
