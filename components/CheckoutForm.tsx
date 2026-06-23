'use client'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import {
  createCheckoutOrder,
  getShippingCostByNameAction,
  getProvincesAction, getRegenciesAction, getDistrictsAction, getVillagesAction,
} from '@/lib/actions'
import type { ShippingOption } from '@/lib/rajaongkir'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (r: unknown) => void
        onPending?: (r: unknown) => void
        onError?: (r: unknown) => void
        onClose?: () => void
      }) => void
    }
  }
}

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''
const IS_PROD    = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
const SNAP_URL   = IS_PROD
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

const FALLBACK_COURIERS = [
  { id: 'jne-reg',  name: 'JNE',           service: 'REG',          etd: '2–3 hari kerja', price: 15000 },
  { id: 'jnt-ez',   name: 'J&T Express',   service: 'Express',      etd: '1–2 hari kerja', price: 14000 },
  { id: 'sicepat',  name: 'SiCepat',       service: 'REG',          etd: '2–3 hari kerja', price: 13000 },
  { id: 'anteraja', name: 'AnterAja',      service: 'Reguler',      etd: '3–5 hari kerja', price: 10000 },
  { id: 'pos',      name: 'Pos Indonesia', service: 'Kilat Khusus', etd: '3–5 hari kerja', price:  9000 },
]

function formatRupiah(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }
function titleCase(s: string)    { return s.toLowerCase().replace(/(?:^|[\s.])\S/g, c => c.toUpperCase()) }

/* ── Custom Dropdown ──────────────────────────────────────────── */

type WItem = { id: string; name: string }

const CHEVRON = (
  <svg className="co-sel-chevron" width="11" height="7" viewBox="0 0 12 8" fill="none">
    <path d="M1 1l5 5 5-5" stroke="#a0722a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function CheckoutSelect({
  options, value, onChange, placeholder, disabled, loading,
}: {
  options:     WItem[]
  value:       string
  onChange:    (item: WItem) => void
  placeholder: string
  disabled?:   boolean
  loading?:    boolean
}) {
  const [open,  setOpen ] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const selected  = options.find(o => o.id === value)
  const filtered  = query.trim()
    ? options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
    : options
  const showSearch = options.length > 10

  return (
    <div ref={ref} className={`co-sel${disabled || loading ? ' co-sel--disabled' : ''}${open ? ' co-sel--open' : ''}`}>
      <button
        type="button"
        className="co-sel-trigger"
        disabled={disabled || loading}
        onClick={() => { if (!disabled && !loading) { setOpen(o => !o); setQuery('') } }}
      >
        <span className={selected ? 'co-sel-value' : 'co-sel-placeholder'}>
          {loading ? 'Memuat data...' : selected ? titleCase(selected.name) : placeholder}
        </span>
        {CHEVRON}
      </button>

      {open && (
        <div className="co-sel-menu">
          {showSearch && (
            <div className="co-sel-search-wrap">
              <input
                type="text" autoFocus
                className="co-sel-search"
                placeholder="Ketik untuk mencari..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          )}
          <div className="co-sel-list">
            {filtered.length === 0
              ? <div className="co-sel-empty">Tidak ditemukan</div>
              : filtered.map(o => (
                  <button key={o.id} type="button"
                    className={`co-sel-item${o.id === value ? ' co-sel-item--active' : ''}`}
                    onClick={() => { onChange(o); setOpen(false); setQuery('') }}>
                    {titleCase(o.name)}
                  </button>
                ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────────── */

type SelKurir = { id: string; name: string; service: string; price: number; etd: string; estimated?: boolean }
type Props    = { userInfo?: { name: string; email: string } | null }

export default function CheckoutForm({ userInfo }: Props) {
  const { items, totalPrice, clearCart } = useCart()
  const router  = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const [loading, setLoading] = useState(false)
  const [error,   setError  ] = useState('')

  // Wilayah
  const [provinces, setProvinces] = useState<WItem[]>([])
  const [regencies, setRegencies] = useState<WItem[]>([])
  const [districts, setDistricts] = useState<WItem[]>([])
  const [villages,  setVillages ] = useState<WItem[]>([])

  const [selProvince, setSelProvince] = useState<WItem | null>(null)
  const [selRegency,  setSelRegency ] = useState<WItem | null>(null)
  const [selDistrict, setSelDistrict] = useState<WItem | null>(null)
  const [selVillage,  setSelVillage ] = useState<WItem | null>(null)

  const [loadingProv, setLoadingProv] = useState(true)
  const [loadingReg,  setLoadingReg ] = useState(false)
  const [loadingDist, setLoadingDist] = useState(false)
  const [loadingVil,  setLoadingVil ] = useState(false)

  // Shipping
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [loadingShipping, setLoadingShipping ] = useState(false)
  const [selectedKurir,   setSelectedKurir   ] = useState<SelKurir | null>(null)

  const grandTotal = totalPrice + (selectedKurir?.price ?? 0)
  const kurirList: SelKurir[] = shippingOptions.length > 0
    ? shippingOptions.map(o => ({ id: o.id, name: o.courier, service: o.service, price: o.price, etd: o.etd }))
    : FALLBACK_COURIERS.map(c => ({ ...c, estimated: true }))

  useEffect(() => {
    getProvincesAction().then(data => { setProvinces(data); setLoadingProv(false) })
  }, [])

  const onProvinceChange = async (p: WItem) => {
    setSelProvince(p)
    setSelRegency(null); setSelDistrict(null); setSelVillage(null)
    setRegencies([]); setDistricts([]); setVillages([])
    setShippingOptions([]); setSelectedKurir(null)
    setLoadingReg(true)
    setRegencies(await getRegenciesAction(p.id))
    setLoadingReg(false)
  }

  const onRegencyChange = async (r: WItem) => {
    setSelRegency(r)
    setSelDistrict(null); setSelVillage(null)
    setDistricts([]); setVillages([])
    setShippingOptions([]); setSelectedKurir(null)
    setLoadingDist(true)
    setLoadingShipping(true)
    getDistrictsAction(r.id).then(d => { setDistricts(d); setLoadingDist(false) })
    const options = await getShippingCostByNameAction(r.name)
    setShippingOptions(options)
    setLoadingShipping(false)
  }

  const onDistrictChange = async (d: WItem) => {
    setSelDistrict(d)
    setSelVillage(null); setVillages([])
    setLoadingVil(true)
    setVillages(await getVillagesAction(d.id))
    setLoadingVil(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length)  { setError('Keranjang kosong'); return }
    if (!selProvince)   { setError('Pilih provinsi.'); return }
    if (!selRegency)    { setError('Pilih kota/kabupaten.'); return }
    if (!selDistrict)   { setError('Pilih kecamatan.'); return }
    if (!selectedKurir) { setError('Pilih kurir pengiriman.'); return }
    setLoading(true); setError('')

    const formData = new FormData(formRef.current!)
    formData.set('cart', JSON.stringify(items))
    formData.set('city', titleCase(selRegency.name))
    formData.set('kurir', JSON.stringify({ name: selectedKurir.name, service: selectedKurir.service, price: selectedKurir.price }))

    const result = await createCheckoutOrder(formData)
    if ('error' in result) { setError(result.error); setLoading(false); return }

    const { orderId, snapToken } = result
    setLoading(false)
    window.snap.pay(snapToken, {
      onSuccess: () => { clearCart(); router.push(`/checkout/success?order_id=${orderId}`) },
      onPending: () => { clearCart(); router.push(`/checkout/pending?order_id=${orderId}`) },
      onError:   () => { setLoading(false); setError('Pembayaran gagal. Silakan coba lagi.') },
      onClose:   () => { setLoading(false); setError('Pembayaran dibatalkan.') },
    })
  }

  if (!items.length) {
    return (
      <div className="checkout-empty">
        <div className="checkout-empty-icon">🛒</div>
        <p>Keranjang belanja kamu masih kosong.</p>
        <Link href="/product" className="btn-dark">Lihat Produk</Link>
      </div>
    )
  }

  return (
    <>
      <Script src={SNAP_URL} data-client-key={CLIENT_KEY} strategy="afterInteractive" />

      <div className="checkout-grid">
        {/* ── Form ── */}
        <form ref={formRef} onSubmit={handleSubmit} className="checkout-form-card">

          {/* Step 1 */}
          <div className="checkout-form-section">
            <div className="checkout-form-section-label">
              <span className="checkout-step-num">1</span>
              <h2 className="checkout-section-title">Informasi Pemesan</h2>
            </div>
            {error && <div className="checkout-error">{error}</div>}
            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label htmlFor="co-name">Nama Lengkap *</label>
                <input id="co-name" name="name" type="text" required
                  placeholder="Budi Santoso" className="checkout-input"
                  defaultValue={userInfo?.name ?? ''} />
              </div>
              <div className="checkout-form-group">
                <label htmlFor="co-email">Email *</label>
                <input id="co-email" name="email" type="email" required
                  placeholder="budi@email.com" className="checkout-input"
                  defaultValue={userInfo?.email ?? ''} />
              </div>
            </div>
            <div className="checkout-form-group">
              <label htmlFor="co-phone">No. HP / WhatsApp *</label>
              <input id="co-phone" name="phone" type="tel" required
                placeholder="08xxxxxxxxxx" className="checkout-input" />
            </div>
          </div>

          <div className="checkout-form-divider" />

          {/* Step 2 */}
          <div className="checkout-form-section">
            <div className="checkout-form-section-label">
              <span className="checkout-step-num">2</span>
              <h2 className="checkout-section-title">Alamat Pengiriman</h2>
            </div>

            <div className="checkout-form-group">
              <label>Alamat Lengkap *</label>
              <textarea name="address" required rows={3}
                placeholder="Jl. Sudirman No. 10, RT 01 RW 02..." className="checkout-textarea" />
            </div>

            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label>Provinsi *</label>
                <CheckoutSelect
                  options={provinces} value={selProvince?.id ?? ''}
                  placeholder="Pilih Provinsi"
                  loading={loadingProv}
                  onChange={onProvinceChange} />
              </div>
              <div className="checkout-form-group">
                <label>Kota / Kabupaten *</label>
                <CheckoutSelect
                  options={regencies} value={selRegency?.id ?? ''}
                  placeholder="Pilih Kota/Kabupaten"
                  disabled={!selProvince} loading={loadingReg}
                  onChange={onRegencyChange} />
              </div>
            </div>

            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label>Kecamatan *</label>
                <CheckoutSelect
                  options={districts} value={selDistrict?.id ?? ''}
                  placeholder="Pilih Kecamatan"
                  disabled={!selRegency} loading={loadingDist}
                  onChange={onDistrictChange} />
              </div>
              <div className="checkout-form-group">
                <label>Kelurahan / Desa</label>
                <CheckoutSelect
                  options={villages} value={selVillage?.id ?? ''}
                  placeholder="Pilih Kelurahan/Desa"
                  disabled={!selDistrict} loading={loadingVil}
                  onChange={v => setSelVillage(v)} />
              </div>
            </div>

            <div className="checkout-form-row">
              <div className="checkout-form-group" style={{ maxWidth: 160 }}>
                <label htmlFor="co-postal">Kode Pos *</label>
                <input id="co-postal" name="postalCode" type="text" required
                  placeholder="12190" className="checkout-input" maxLength={5} />
              </div>
            </div>

            <div className="checkout-form-group">
              <label htmlFor="co-notes">Catatan (opsional)</label>
              <textarea id="co-notes" name="notes" rows={2}
                placeholder="Instruksi khusus untuk kurir..." className="checkout-textarea" />
            </div>
          </div>

          <div className="checkout-form-divider" />

          {/* Step 3 */}
          <div className="checkout-form-section">
            <div className="checkout-form-section-label">
              <span className="checkout-step-num">3</span>
              <h2 className="checkout-section-title">Pilih Kurir</h2>
            </div>

            {!selRegency && !loadingShipping && (
              <p className="co-kurir-hint">Pilih kota tujuan dulu untuk melihat ongkir.</p>
            )}
            {loadingShipping && (
              <div className="co-kurir-loading">
                <span className="checkout-spinner co-kurir-spinner" />
                <span>Mengecek ongkir...</span>
              </div>
            )}
            {!loadingShipping && selRegency && (
              <>
                {shippingOptions.length === 0 && (
                  <p className="co-kurir-hint co-kurir-hint--warn">
                    Harga ongkir tidak dapat dimuat otomatis. Berikut estimasi harga — harga final dikonfirmasi admin.
                  </p>
                )}
                <div className="checkout-kurir-list">
                  {kurirList.map(k => (
                    <label key={k.id} className={`checkout-kurir-card${selectedKurir?.id === k.id ? ' checkout-kurir-card--active' : ''}`}>
                      <input type="radio" name="kurir_radio" value={k.id} className="checkout-kurir-radio"
                        checked={selectedKurir?.id === k.id}
                        onChange={() => setSelectedKurir(k)} />
                      <div className="checkout-kurir-info">
                        <span className="checkout-kurir-name">{k.name} {k.service}</span>
                        <span className="checkout-kurir-service">{k.etd}</span>
                      </div>
                      <div className="checkout-kurir-price-wrap">
                        {k.estimated && <span className="checkout-kurir-est">estimasi</span>}
                        <span className="checkout-kurir-price">{formatRupiah(k.price)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <button type="submit" className="checkout-pay-btn" disabled={loading}>
            {loading && <span className="checkout-spinner" />}
            {loading ? 'Memproses...' : 'Lanjut ke Pembayaran →'}
          </button>
          <p className="checkout-secure-note">🔒 Pembayaran aman diproses oleh Midtrans</p>
        </form>

        {/* ── Summary ── */}
        <aside className="checkout-summary">
          <h2 className="checkout-section-title">Ringkasan Pesanan</h2>
          <div className="checkout-summary-items">
            {items.map((item, i) => (
              <div key={`${item.product.id}-${item.size}-${i}`} className="checkout-summary-item">
                <div className="checkout-summary-visual" style={{ background: item.product.bg }}>
                  <span className="checkout-summary-qty">×{item.quantity}</span>
                </div>
                <div className="checkout-summary-info">
                  <span className="checkout-summary-name">{item.product.title}</span>
                  <span className="checkout-summary-meta">Ukuran {item.size}</span>
                </div>
                <span className="checkout-summary-price">
                  {formatRupiah(item.quantity * parseInt(item.product.price.replace(/\D/g,'')))}
                </span>
              </div>
            ))}
          </div>
          <div className="checkout-summary-divider" />
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatRupiah(totalPrice)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Ongkos Kirim</span>
            {loadingShipping
              ? <span className="checkout-kurir-placeholder">Mengecek...</span>
              : selectedKurir
                ? <span>{selectedKurir.estimated ? '~' : ''}{formatRupiah(selectedKurir.price)}</span>
                : <span className="checkout-kurir-placeholder">— pilih kurir</span>}
          </div>
          <div className="checkout-summary-divider" />
          <div className="checkout-summary-total">
            <span>Total Pembayaran</span>
            <strong>{formatRupiah(grandTotal)}</strong>
          </div>
          <div className="checkout-payment-methods">
            <p className="checkout-pm-label">Metode Pembayaran</p>
            <div className="checkout-pm-list">
              {['Transfer Bank','GoPay','OVO','DANA','QRIS','Kartu Kredit','Alfamart','Indomaret'].map(m => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
