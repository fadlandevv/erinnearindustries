'use client'
import { useState, useRef } from 'react'
import { useCart } from '@/context/CartContext'
import { generateId } from '@/lib/utils'

type Side = 'front' | 'back'

const PRODUCT_TABS = [
  {
    id: 'tshirt', name: 'T-Shirt',
    icon: <svg viewBox="0 0 80 88" fill="none"><path d="M18,22 L2,12 L0,30 L18,36 L18,78 L62,78 L62,36 L80,30 L78,12 L62,22 Q40,36 18,22Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  },
  {
    id: 'totebag', name: 'Totebag',
    icon: <svg viewBox="0 0 80 88" fill="none"><path d="M12,32 L10,78 L70,78 L68,32 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/><path d="M24,32 C24,14 36,10 40,10 C44,10 56,14 56,32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><line x1="12" y1="32" x2="24" y2="32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><line x1="56" y1="32" x2="68" y2="32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>,
  },
  {
    id: 'amplop-packaging', name: 'Amplop Packaging',
    icon: <svg viewBox="0 0 80 88" fill="none"><rect x="6" y="22" width="68" height="52" rx="4" stroke="currentColor" strokeWidth="2.2"/><path d="M6,22 L40,50 L74,22" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/><path d="M6,74 L32,50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M74,74 L48,50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    id: 'coach-jacket', name: 'Coach Jacket',
    icon: <svg viewBox="0 0 80 88" fill="none"><path d="M18,26 L2,14 L0,32 L18,38 L18,78 L62,78 L62,38 L80,32 L78,14 L62,26 L52,20 L40,22 L28,20 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/><path d="M28,20 L28,30 L52,30 L52,20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/><line x1="40" y1="30" x2="40" y2="78" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,3"/></svg>,
  },
  {
    id: 'hoodie', name: 'Hoodie',
    icon: <svg viewBox="0 0 80 88" fill="none"><path d="M18,32 L2,16 L0,34 L18,40 L18,78 L62,78 L62,40 L80,34 L78,16 L62,32 C58,20 50,12 40,12 C30,12 22,20 18,32Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/><path d="M18,32 C22,20 30,10 40,10 C50,10 58,20 62,32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="28" y="58" width="24" height="14" rx="4" stroke="currentColor" strokeWidth="1.8"/><line x1="40" y1="30" x2="40" y2="58" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,3"/></svg>,
  },
  {
    id: 'jersey', name: 'Jersey',
    icon: <svg viewBox="0 0 80 88" fill="none"><path d="M18,24 L2,12 L0,30 L18,36 L18,78 L62,78 L62,36 L80,30 L78,12 L62,24 L40,38 L18,24Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/><line x1="20" y1="52" x2="30" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="50" y1="52" x2="60" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><text x="40" y="64" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor" fontFamily="system-ui,sans-serif">10</text></svg>,
  },
]

const SHIRT_COLORS = [
  { label: 'Putih',  value: '#FFFFFF' },
  { label: 'Krem',   value: '#f5f0e8' },
  { label: 'Abu',    value: '#d1d5db' },
  { label: 'Hitam',  value: '#1a1a1a' },
  { label: 'Navy',   value: '#1e3a5f' },
  { label: 'Olive',  value: '#6b7c3d' },
]

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

type PriceOption = { label: string; price: number }

type SablonOpt = PriceOption | null

type InvoiceItem = {
  rowId: string
  warna: string
  warnaNama: string
  size: string
  bahan: string
  depan: boolean
  belakang: boolean
  depanPreview?: string
  belakangPreview?: string
  sablonDepan: SablonOpt
  sablonBelakang: SablonOpt
  jumlah: number
  hargaPerPcs: number
  catatan?: string
}

const MOCKUP_CONFIGS: Record<string, {
  paths: string[]
  clipPath: string
  da: { x: number; y: number; w: number; h: number }
}> = {
  tshirt: {
    paths: ['M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 Q 176,50 150,55 Q 124,50 118,0 Z'],
    clipPath: 'M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 Q 176,50 150,55 Q 124,50 118,0 Z',
    da: { x: 90, y: 90, w: 120, h: 120 },
  },
  totebag: {
    paths: [
      'M 40,100 L 20,330 L 280,330 L 260,100 Z',
      'M 80,0 L 80,100 L 110,100 L 110,0 Z',
      'M 190,0 L 190,100 L 220,100 L 220,0 Z',
    ],
    clipPath: 'M 40,100 L 20,330 L 280,330 L 260,100 Z',
    da: { x: 75, y: 130, w: 150, h: 150 },
  },
  'amplop-packaging': {
    paths: ['M 15,80 L 15,310 L 285,310 L 285,80 Z'],
    clipPath: 'M 15,80 L 15,310 L 285,310 L 285,80 Z',
    da: { x: 60, y: 105, w: 180, h: 155 },
  },
  'coach-jacket': {
    paths: ['M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 L 162,26 L 150,18 L 138,26 Z'],
    clipPath: 'M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 L 162,26 L 150,18 L 138,26 Z',
    da: { x: 90, y: 100, w: 120, h: 120 },
  },
  hoodie: {
    paths: ['M 108,68 L 52,80 L 0,122 L 0,158 L 52,138 L 52,340 L 248,340 L 248,138 L 300,158 L 300,122 L 248,80 L 192,68 C 182,18 150,4 150,4 C 150,4 118,18 108,68 Z'],
    clipPath: 'M 108,68 L 52,80 L 0,122 L 0,158 L 52,138 L 52,340 L 248,340 L 248,138 L 300,158 L 300,122 L 248,80 L 192,68 C 182,18 150,4 150,4 C 150,4 118,18 108,68 Z',
    da: { x: 90, y: 118, w: 120, h: 110 },
  },
  jersey: {
    paths: ['M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 L 150,56 L 118,0 Z'],
    clipPath: 'M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 L 150,56 L 118,0 Z',
    da: { x: 90, y: 90, w: 120, h: 120 },
  },
}

function ProductMockupSVG({ color, design, side, productType }: {
  color: string; design: string | null; side: Side; productType: string
}) {
  const isDark = color === '#1a1a1a' || color === '#1e3a5f' || color === '#6b7c3d'
  const stroke = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const hint   = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)'
  const id     = `clip-${productType}-${side}`
  const cfg    = MOCKUP_CONFIGS[productType] ?? MOCKUP_CONFIGS.tshirt
  const { da } = cfg

  return (
    <svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" className="custom-shirt-svg">
      <defs><clipPath id={id}><path d={cfg.clipPath}/></clipPath></defs>

      {cfg.paths.map((p, i) => <path key={i} d={p} fill={color} stroke={stroke} strokeWidth="1.5"/>)}

      {design
        ? <image href={design} x={da.x} y={da.y} width={da.w} height={da.h} clipPath={`url(#${id})`} preserveAspectRatio="xMidYMid meet"/>
        : (
          <g clipPath={`url(#${id})`}>
            <rect x={da.x} y={da.y} width={da.w} height={da.h} fill="none" stroke={hint} strokeWidth="1.2" strokeDasharray="6 4" rx="6"/>
            <text x={da.x + da.w / 2} y={da.y + da.h / 2 - 7} textAnchor="middle" fontSize="10" fill={hint} fontFamily="inherit">
              {side === 'front' ? 'Desain Depan' : 'Desain Belakang'}
            </text>
            <text x={da.x + da.w / 2} y={da.y + da.h / 2 + 8} textAnchor="middle" fontSize="9" fill={hint} fontFamily="inherit">Upload di kiri</text>
          </g>
        )
      }

      {cfg.paths.map((p, i) => <path key={`o${i}`} d={p} fill="none" stroke={stroke} strokeWidth="1.5"/>)}

      {productType === 'coach-jacket' && <line x1="150" y1="18" x2="150" y2="340" stroke={stroke} strokeWidth="1" strokeDasharray="5,3"/>}
      {productType === 'hoodie' && <>
        <line x1="150" y1="68" x2="150" y2="210" stroke={stroke} strokeWidth="1" strokeDasharray="5,3"/>
        <rect x="108" y="268" width="84" height="48" rx="8" fill="none" stroke={stroke} strokeWidth="1.2"/>
      </>}
      {productType === 'jersey' && <>
        <rect x="52" y="85" width="18" height="135" fill={stroke}/>
        <rect x="230" y="85" width="18" height="135" fill={stroke}/>
      </>}
      {productType === 'amplop-packaging' && <>
        <path d="M 15,80 L 150,185 L 285,80" fill="none" stroke={stroke} strokeWidth="1.5"/>
        <line x1="15" y1="310" x2="115" y2="195" stroke={stroke} strokeWidth="1" strokeLinecap="round"/>
        <line x1="285" y1="310" x2="185" y2="195" stroke={stroke} strokeWidth="1" strokeLinecap="round"/>
      </>}
    </svg>
  )
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

const EMPTY_FORM = {
  shirtColor:      '#FFFFFF',
  selectedSize:    null as string | null,
  bahan:           '',
  bahanPrice:      0,
  bahanCustom:     '',
  bahanCustomPrice: 0,
  jumlah:          12,
  sablonDepan:     null as SablonOpt,
  sablonBelakang:  null as SablonOpt,
  note:            '',
  frontDesign:     null as string | null,
  backDesign:      null as string | null,
}

export default function CustomDesignClient({
  bahanOptions,
  sablonOptions,
}: {
  bahanOptions: PriceOption[]
  sablonOptions: PriceOption[]
}) {
  const { addCustomItem, openCart } = useCart()

  const [selectedTab, setSelectedTab] = useState('tshirt')
  const [form, setForm]         = useState({ ...EMPTY_FORM })
  const [activeSide, setActiveSide] = useState<Side>('front')
  const [error, setError]       = useState('')

  const [invoiceId]    = useState(() => generateId(6))
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])

  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)

  const set = <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleUpload = (side: Side, file: File) => {
    const url = URL.createObjectURL(file)
    if (side === 'front')
      setForm(f => ({ ...f, frontDesign: url, sablonDepan: f.sablonDepan ?? sablonOptions[0] ?? null }))
    else
      setForm(f => ({ ...f, backDesign: url, sablonBelakang: f.sablonBelakang ?? sablonOptions[0] ?? null }))
  }

  const finalBahan   = form.bahan === 'Lainnya' ? form.bahanCustom : form.bahan
  const activeDesign = activeSide === 'front' ? form.frontDesign : form.backDesign

  const bahanPriceVal = form.bahan === 'Lainnya' ? form.bahanCustomPrice : form.bahanPrice
  const autoHarga =
    bahanPriceVal +
    (form.sablonDepan    ? form.sablonDepan.price    : 0) +
    (form.sablonBelakang ? form.sablonBelakang.price : 0)

  const handleAddToInvoice = () => {
    if (!form.selectedSize)                        { setError('Pilih ukuran.'); return }
    if (!finalBahan)                               { setError('Pilih atau isi jenis bahan.'); return }
    if (!form.frontDesign && !form.backDesign)     { setError('Upload minimal satu desain.'); return }
    if (form.jumlah < 1)                           { setError('Jumlah minimal 1 pcs.'); return }

    const warnaNama = SHIRT_COLORS.find(c => c.value === form.shirtColor)?.label ?? form.shirtColor

    const item: InvoiceItem = {
      rowId:    generateId(4),
      warna:    form.shirtColor,
      warnaNama,
      size:     form.selectedSize,
      bahan:    finalBahan,
      depan:    !!form.frontDesign,
      belakang: !!form.backDesign,
      depanPreview:    form.frontDesign  ?? undefined,
      belakangPreview: form.backDesign   ?? undefined,
      sablonDepan:    form.frontDesign  ? form.sablonDepan    : null,
      sablonBelakang: form.backDesign   ? form.sablonBelakang : null,
      jumlah:   form.jumlah,
      hargaPerPcs: autoHarga,
      catatan:  form.note || undefined,
    }

    setInvoiceItems(prev => [...prev, item])
    setForm(f => ({ ...EMPTY_FORM, shirtColor: f.shirtColor }))
    setError('')
    setActiveSide('front')
  }

  const removeRow = (rowId: string) =>
    setInvoiceItems(prev => prev.filter(i => i.rowId !== rowId))

  const grandTotal = invoiceItems.reduce((s, i) => s + i.hargaPerPcs * i.jumlah, 0)
  const grandQty   = invoiceItems.reduce((s, i) => s + i.jumlah, 0)

  const handleCheckout = () => {
    if (invoiceItems.length === 0) return
    invoiceItems.forEach(item => {
      addCustomItem({
        warna:       item.warna,
        warnaNama:   item.warnaNama,
        bahan:       item.bahan,
        jumlah:      item.jumlah,
        hargaPerPcs: item.hargaPerPcs,
        size:        item.size,
        depan:       item.depan,
        belakang:    item.belakang,
        catatan:     item.catatan,
      })
    })
    setInvoiceItems([])
    openCart()
  }

  const activeTab = PRODUCT_TABS.find(t => t.id === selectedTab)!

  return (
    <div>
      {/* ── Product Tabs ── */}
      <section className="custom-products-section">
        <div className="custom-products-inner">
<div className="custom-products-grid">
            {PRODUCT_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`custom-product-card${selectedTab === tab.id ? ' custom-product-card--active' : ''}`}
                onClick={() => setSelectedTab(tab.id)}
              >
                <div className="custom-product-icon">{tab.icon}</div>
                <span className="custom-product-name">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hero ── */}
      <div className="custom-hero">
        <div className="custom-hero-inner">
          <span className="pill pill-yellow">✦ {activeTab.name}</span>
          <h1 className="custom-hero-title">Desain {activeTab.name} Sendiri</h1>
          <p className="custom-hero-sub">
            Upload desain depan & belakang, pilih warna dan ukuran — kami produksi sesuai pesananmu.
          </p>
        </div>
      </div>

      {/* ── Form + Mockup ── */}
      <section className="custom-section">
        <div className="custom-inner">

          {/* Controls */}
          <div className="custom-controls">

            {/* Warna */}
            <div className="custom-control-group">
              <p className="custom-control-label">Warna Baju</p>
              <div className="custom-color-swatches">
                {SHIRT_COLORS.map(c => (
                  <button key={c.value} type="button" title={c.label}
                    className={`custom-color-swatch${form.shirtColor === c.value ? ' custom-color-swatch--active' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => set('shirtColor', c.value)} />
                ))}
              </div>
              <p className="custom-color-name">{SHIRT_COLORS.find(c => c.value === form.shirtColor)?.label}</p>
            </div>

            {/* Bahan */}
            <div className="custom-control-group">
              <p className="custom-control-label">Jenis Bahan <span className="custom-required">*</span></p>
              <select className="custom-select" value={form.bahan}
                onChange={e => {
                  const opt = bahanOptions.find(b => b.label === e.target.value)
                  setForm(f => ({ ...f, bahan: e.target.value, bahanPrice: opt?.price ?? 0 }))
                }}>
                <option value="">— Pilih bahan —</option>
                {bahanOptions.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
                <option value="Lainnya">Lainnya...</option>
              </select>
              {form.bahan === 'Lainnya' && (
                <>
                  <input type="text" className="custom-text-input" placeholder="Tulis jenis bahan..."
                    value={form.bahanCustom} onChange={e => set('bahanCustom', e.target.value)} />
                  <div className="custom-price-row">
                    <span className="custom-price-prefix">Rp</span>
                    <input type="number" inputMode="numeric" className="custom-text-input custom-text-input--price"
                      placeholder="Harga baju/pcs" min={0}
                      value={form.bahanCustomPrice || ''}
                      onChange={e => set('bahanCustomPrice', parseInt(e.target.value) || 0)} />
                  </div>
                </>
              )}
            </div>

            {/* Ukuran */}
            <div className="custom-control-group">
              <p className="custom-control-label">Ukuran <span className="custom-required">*</span></p>
              <div className="custom-size-grid">
                {SIZES.map(s => (
                  <button key={s} type="button"
                    className={`custom-size-btn${form.selectedSize === s ? ' custom-size-btn--active' : ''}`}
                    onClick={() => set('selectedSize', s)}>{s}</button>
                ))}
              </div>
            </div>

            {/* Jumlah */}
            <div className="custom-control-group">
              <p className="custom-control-label">Jumlah (pcs) <span className="custom-required">*</span></p>
              <div className="custom-qty-row">
                <button type="button" className="custom-qty-btn"
                  onClick={() => set('jumlah', Math.max(1, form.jumlah - 1))}>−</button>
                <input type="number" className="custom-qty-input" min={1} value={form.jumlah}
                  onChange={e => set('jumlah', Math.max(1, parseInt(e.target.value) || 1))} />
                <button type="button" className="custom-qty-btn"
                  onClick={() => set('jumlah', form.jumlah + 1)}>+</button>
              </div>
            </div>

            {/* Upload Depan */}
            <div className="custom-control-group">
              <p className="custom-control-label">Desain Depan <span className="custom-required">*</span></p>
              <input ref={frontRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload('front', f) }} />
              <button type="button"
                className={`custom-upload-btn${form.frontDesign ? ' custom-upload-btn--done' : ''}`}
                onClick={() => { setActiveSide('front'); frontRef.current?.click() }}>
                {form.frontDesign ? '✓ Desain Depan Terupload' : '↑ Upload Desain Depan'}
              </button>
              {form.frontDesign && (
                <button type="button" className="custom-remove-btn"
                  onClick={() => setForm(f => ({ ...f, frontDesign: null, sablonDepan: null }))}>Hapus</button>
              )}
            </div>

            {/* Ukuran Sablon Depan */}
            {form.frontDesign && (
              <div className="custom-control-group custom-sablon-group">
                <p className="custom-control-label">Ukuran Sablon Depan</p>
                <select className="custom-select"
                  value={form.sablonDepan?.label ?? ''}
                  onChange={e => {
                    const opt = sablonOptions.find(o => o.label === e.target.value)
                    if (opt) set('sablonDepan', opt)
                  }}>
                  {sablonOptions.map(opt => (
                    <option key={opt.label} value={opt.label}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Upload Belakang */}
            <div className="custom-control-group">
              <p className="custom-control-label">Desain Belakang</p>
              <input ref={backRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload('back', f) }} />
              <button type="button"
                className={`custom-upload-btn${form.backDesign ? ' custom-upload-btn--done' : ''}`}
                onClick={() => { setActiveSide('back'); backRef.current?.click() }}>
                {form.backDesign ? '✓ Desain Belakang Terupload' : '↑ Upload Desain Belakang (opsional)'}
              </button>
              {form.backDesign && (
                <button type="button" className="custom-remove-btn"
                  onClick={() => setForm(f => ({ ...f, backDesign: null, sablonBelakang: null }))}>Hapus</button>
              )}
            </div>

            {/* Ukuran Sablon Belakang */}
            {form.backDesign && (
              <div className="custom-control-group custom-sablon-group">
                <p className="custom-control-label">Ukuran Sablon Belakang</p>
                <select className="custom-select"
                  value={form.sablonBelakang?.label ?? ''}
                  onChange={e => {
                    const opt = sablonOptions.find(o => o.label === e.target.value)
                    if (opt) set('sablonBelakang', opt)
                  }}>
                  {sablonOptions.map(opt => (
                    <option key={opt.label} value={opt.label}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Auto price display */}
            {bahanPriceVal > 0 && (
              <div className="custom-price-display">
                <span className="custom-price-display-label">Harga/pcs</span>
                <div className="custom-price-breakdown">
                  <span>Baju ({finalBahan || 'bahan'})</span>
                  <span>{formatRp(bahanPriceVal)}</span>
                  {form.sablonDepan && (
                    <>
                      <span>Sablon depan ({form.sablonDepan.label})</span>
                      <span>{formatRp(form.sablonDepan.price)}</span>
                    </>
                  )}
                  {form.sablonBelakang && (
                    <>
                      <span>Sablon belakang ({form.sablonBelakang.label})</span>
                      <span>{formatRp(form.sablonBelakang.price)}</span>
                    </>
                  )}
                </div>
                <span className="custom-price-display-val">{formatRp(autoHarga)}</span>
                {form.jumlah > 0 && (
                  <span className="custom-price-display-total">
                    Subtotal {form.jumlah} pcs → <strong>{formatRp(autoHarga * form.jumlah)}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Catatan */}
            <div className="custom-control-group">
              <p className="custom-control-label">
                Catatan&nbsp;<span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>(opsional)</span>
              </p>
              <textarea className="custom-note-input" rows={2}
                placeholder="cth. sablon rubber, posisi dada kiri, dll."
                value={form.note} onChange={e => set('note', e.target.value)} />
            </div>

            {error && <p className="custom-error">{error}</p>}

            <button type="button" className="btn-dark custom-order-btn"
              onClick={handleAddToInvoice}>
              + Tambah ke Invoice
            </button>
          </div>

          {/* Mockup */}
          <div className="custom-mockup">
            <div className="custom-tab-btns">
              <button type="button"
                className={`custom-tab-btn${activeSide === 'front' ? ' custom-tab-btn--active' : ''}`}
                onClick={() => setActiveSide('front')}>
                Depan {form.frontDesign && <span className="custom-tab-dot" />}
              </button>
              <button type="button"
                className={`custom-tab-btn${activeSide === 'back' ? ' custom-tab-btn--active' : ''}`}
                onClick={() => setActiveSide('back')}>
                Belakang {form.backDesign && <span className="custom-tab-dot" />}
              </button>
            </div>
            <div className="custom-shirt-wrap">
              <ProductMockupSVG color={form.shirtColor} design={activeDesign} side={activeSide} productType={selectedTab} />
            </div>
            {!activeDesign && (
              <p className="custom-mockup-hint">
                Upload desain {activeSide === 'front' ? 'depan' : 'belakang'} untuk preview
              </p>
            )}
            <div className="custom-info-pills">
              <span className="custom-info-pill">PNG / JPG / SVG</span>
              <span className="custom-info-pill">Min. 300 DPI</span>
              <span className="custom-info-pill">Background transparan</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Invoice Table ── */}
      {invoiceItems.length > 0 && (
        <section className="invoice-section">
          <div className="invoice-inner">

            {/* Header */}
            <div className="invoice-header">
              <div>
                <p className="invoice-label">Invoice Pesanan</p>
                <p className="invoice-id">#{invoiceId}</p>
              </div>
              <div className="invoice-summary-pills">
                <span className="invoice-pill">{invoiceItems.length} item</span>
                <span className="invoice-pill">{grandQty} pcs</span>
              </div>
            </div>

            {/* Table */}
            <div className="invoice-table-wrap">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Preview</th>
                    <th>Detail</th>
                    <th>Sablon Depan</th>
                    <th>Sablon Belakang</th>
                    <th>Jumlah</th>
                    <th>Harga/pcs</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, idx) => (
                    <tr key={item.rowId}>
                      <td className="invoice-td-num">{idx + 1}</td>
                      <td>
                        <div className="invoice-preview-thumbs">
                          {item.depanPreview && (
                            <div className="invoice-thumb-wrap" title="Depan">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.depanPreview} alt="depan" className="invoice-thumb" />
                              <span className="invoice-thumb-label">D</span>
                            </div>
                          )}
                          {item.belakangPreview && (
                            <div className="invoice-thumb-wrap" title="Belakang">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.belakangPreview} alt="belakang" className="invoice-thumb" />
                              <span className="invoice-thumb-label">B</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="invoice-detail-cell">
                          <div className="invoice-color-cell">
                            <span className="invoice-color-dot"
                              style={{ background: item.warna, border: item.warna === '#FFFFFF' ? '1px solid #e0e0e0' : 'none' }} />
                            <strong>{item.warnaNama}</strong>
                          </div>
                          <span className="invoice-detail-sub">{item.size} · {item.bahan}</span>
                          {item.catatan && <span className="invoice-detail-note">{item.catatan}</span>}
                        </div>
                      </td>
                      <td>
                        {item.sablonDepan
                          ? <div className="invoice-sablon-cell"><span className="invoice-sablon-size">{item.sablonDepan.label.split('—')[0].trim()}</span><span className="invoice-sablon-price">{formatRp(item.sablonDepan.price)}</span></div>
                          : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td>
                        {item.belakang
                          ? item.sablonBelakang
                            ? <div className="invoice-sablon-cell"><span className="invoice-sablon-size">{item.sablonBelakang.label.split('—')[0].trim()}</span><span className="invoice-sablon-price">{formatRp(item.sablonBelakang.price)}</span></div>
                            : <span style={{ color: '#ccc' }}>—</span>
                          : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td className="invoice-td-center">{item.jumlah} pcs</td>
                      <td className="invoice-td-price">{formatRp(item.hargaPerPcs)}</td>
                      <td className="invoice-td-price invoice-td-subtotal">{formatRp(item.hargaPerPcs * item.jumlah)}</td>
                      <td>
                        <button type="button" className="invoice-remove-btn"
                          onClick={() => removeRow(item.rowId)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand Total */}
            <div className="invoice-grand-total">
              <div className="invoice-grand-left">
                <span>{grandQty} pcs · {invoiceItems.length} item</span>
              </div>
              <div className="invoice-grand-right">
                <span className="invoice-grand-label">Total</span>
                <span className="invoice-grand-val">{formatRp(grandTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="invoice-actions">
              <button type="button" className="btn-outline invoice-add-more"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                + Tambah Item Lagi
              </button>
              <button type="button" className="btn-dark invoice-checkout-btn"
                onClick={handleCheckout}>
                Masuk ke Keranjang →
              </button>
            </div>

          </div>
        </section>
      )}
    </div>
  )
}
