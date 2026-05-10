'use client'
import { useState, useRef } from 'react'
import { useCart } from '@/context/CartContext'

type Side = 'front' | 'back'

const SHIRT_COLORS = [
  { label: 'Putih',  value: '#FFFFFF' },
  { label: 'Krem',   value: '#f5f0e8' },
  { label: 'Abu',    value: '#d1d5db' },
  { label: 'Hitam',  value: '#1a1a1a' },
  { label: 'Navy',   value: '#1e3a5f' },
  { label: 'Olive',  value: '#6b7c3d' },
]

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const BAHAN_OPTIONS = [
  'Cotton Combed 30s',
  'Cotton Combed 24s',
  'Cotton Bamboo',
  'Drifit Polyester',
  'Linen',
  'Fleece',
]

function ShirtSVG({ color, design, side }: { color: string; design: string | null; side: Side }) {
  const isDark = color === '#1a1a1a' || color === '#1e3a5f' || color === '#6b7c3d'
  const strokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const labelColor  = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)'
  const id = `shirt-clip-${side}`

  return (
    <svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" className="custom-shirt-svg">
      <defs>
        <clipPath id={id}>
          <path d="M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 Q 176,50 150,55 Q 124,50 118,0 Z" />
        </clipPath>
      </defs>

      {/* Shirt body */}
      <path
        d="M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 Q 176,50 150,55 Q 124,50 118,0 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
      />

      {/* Design overlay */}
      {design && (
        <image
          href={design}
          x="90" y="90" width="120" height="120"
          clipPath={`url(#${id})`}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* Empty zone hint */}
      {!design && (
        <g clipPath={`url(#${id})`}>
          <rect x="90" y="90" width="120" height="120" fill="none" stroke={labelColor} strokeWidth="1.2" strokeDasharray="6 4" rx="6" />
          <text x="150" y="146" textAnchor="middle" fontSize="10" fill={labelColor} fontFamily="inherit">
            {side === 'front' ? 'Desain Depan' : 'Desain Belakang'}
          </text>
          <text x="150" y="160" textAnchor="middle" fontSize="9" fill={labelColor} fontFamily="inherit">
            Upload di kiri
          </text>
        </g>
      )}

      {/* Shirt outline on top */}
      <path
        d="M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 Q 176,50 150,55 Q 124,50 118,0 Z"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
    </svg>
  )
}

export default function CustomDesignClient() {
  const { addCustomItem } = useCart()

  const [activeSide, setActiveSide]   = useState<Side>('front')
  const [frontDesign, setFrontDesign] = useState<string | null>(null)
  const [backDesign, setBackDesign]   = useState<string | null>(null)
  const [shirtColor, setShirtColor]   = useState('#FFFFFF')
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [bahan, setBahan]             = useState('')
  const [bahanCustom, setBahanCustom] = useState('')
  const [jumlah, setJumlah]           = useState(1)
  const [hargaPerPcs, setHargaPerPcs] = useState('')
  const [note, setNote]               = useState('')
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)

  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)

  const handleUpload = (side: Side, file: File) => {
    const url = URL.createObjectURL(file)
    if (side === 'front') setFrontDesign(url)
    else setBackDesign(url)
  }

  const activeDesign = activeSide === 'front' ? frontDesign : backDesign
  const finalBahan   = bahan === 'Lainnya' ? bahanCustom : bahan
  const hargaNum     = parseInt(hargaPerPcs.replace(/\D/g, '')) || 0
  const totalEstimasi = hargaNum * jumlah

  const handleAddToCart = () => {
    if (!selectedSize) { setError('Pilih ukuran terlebih dahulu.'); return }
    if (!finalBahan)   { setError('Pilih atau isi jenis bahan.'); return }
    if (!frontDesign && !backDesign) { setError('Upload minimal satu desain (depan atau belakang).'); return }
    if (jumlah < 1)    { setError('Jumlah minimal 1 pcs.'); return }

    const warnaNama = SHIRT_COLORS.find(c => c.value === shirtColor)?.label ?? shirtColor

    addCustomItem({
      warna: shirtColor,
      warnaNama,
      bahan: finalBahan,
      jumlah,
      hargaPerPcs: hargaNum,
      size: selectedSize,
      depan: !!frontDesign,
      belakang: !!backDesign,
      catatan: note || undefined,
    })

    setError('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <section className="custom-section">
      <div className="custom-inner">

        {/* ── Kiri: Controls ── */}
        <div className="custom-controls">

          {/* Warna baju */}
          <div className="custom-control-group">
            <p className="custom-control-label">Warna Baju</p>
            <div className="custom-color-swatches">
              {SHIRT_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`custom-color-swatch${shirtColor === c.value ? ' custom-color-swatch--active' : ''}`}
                  style={{ background: c.value }}
                  onClick={() => setShirtColor(c.value)}
                  title={c.label}
                  type="button"
                />
              ))}
            </div>
            <p className="custom-color-name">{SHIRT_COLORS.find(c => c.value === shirtColor)?.label}</p>
          </div>

          {/* Jenis Bahan */}
          <div className="custom-control-group">
            <p className="custom-control-label">Jenis Bahan <span className="custom-required">*</span></p>
            <select
              className="custom-select"
              value={bahan}
              onChange={(e) => setBahan(e.target.value)}
            >
              <option value="">— Pilih bahan —</option>
              {BAHAN_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value="Lainnya">Lainnya...</option>
            </select>
            {bahan === 'Lainnya' && (
              <input
                type="text"
                className="custom-text-input"
                placeholder="Tulis jenis bahan..."
                value={bahanCustom}
                onChange={(e) => setBahanCustom(e.target.value)}
              />
            )}
          </div>

          {/* Ukuran */}
          <div className="custom-control-group">
            <p className="custom-control-label">Ukuran <span className="custom-required">*</span></p>
            <div className="custom-size-grid">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`custom-size-btn${selectedSize === s ? ' custom-size-btn--active' : ''}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Jumlah */}
          <div className="custom-control-group">
            <p className="custom-control-label">Jumlah (pcs) <span className="custom-required">*</span></p>
            <div className="custom-qty-row">
              <button type="button" className="custom-qty-btn" onClick={() => setJumlah(q => Math.max(1, q - 1))}>−</button>
              <input
                type="number"
                className="custom-qty-input"
                min={1}
                value={jumlah}
                onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button type="button" className="custom-qty-btn" onClick={() => setJumlah(q => q + 1)}>+</button>
            </div>
          </div>

          {/* Harga estimasi per pcs */}
          <div className="custom-control-group">
            <p className="custom-control-label">Estimasi Harga/pcs <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>(opsional)</span></p>
            <div className="custom-price-row">
              <span className="custom-price-prefix">Rp</span>
              <input
                type="text"
                className="custom-text-input custom-text-input--price"
                placeholder="cth. 75000"
                value={hargaPerPcs}
                onChange={(e) => setHargaPerPcs(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
              />
            </div>
            {hargaNum > 0 && (
              <p className="custom-price-total">
                Total estimasi: <strong>Rp {totalEstimasi.toLocaleString('id-ID')}</strong> ({jumlah} pcs × Rp {hargaNum.toLocaleString('id-ID')})
              </p>
            )}
          </div>

          {/* Upload Depan */}
          <div className="custom-control-group">
            <p className="custom-control-label">Desain Depan <span className="custom-required">*</span></p>
            <input ref={frontRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload('front', f) }} />
            <button type="button"
              className={`custom-upload-btn${frontDesign ? ' custom-upload-btn--done' : ''}`}
              onClick={() => { setActiveSide('front'); frontRef.current?.click() }}>
              {frontDesign ? '✓ Desain Depan Terupload' : '↑ Upload Desain Depan'}
            </button>
            {frontDesign && (
              <button type="button" className="custom-remove-btn" onClick={() => setFrontDesign(null)}>Hapus</button>
            )}
          </div>

          {/* Upload Belakang */}
          <div className="custom-control-group">
            <p className="custom-control-label">Desain Belakang</p>
            <input ref={backRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload('back', f) }} />
            <button type="button"
              className={`custom-upload-btn${backDesign ? ' custom-upload-btn--done' : ''}`}
              onClick={() => { setActiveSide('back'); backRef.current?.click() }}>
              {backDesign ? '✓ Desain Belakang Terupload' : '↑ Upload Desain Belakang (opsional)'}
            </button>
            {backDesign && (
              <button type="button" className="custom-remove-btn" onClick={() => setBackDesign(null)}>Hapus</button>
            )}
          </div>

          {/* Catatan */}
          <div className="custom-control-group">
            <p className="custom-control-label">Catatan <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>(opsional)</span></p>
            <textarea className="custom-note-input" rows={2}
              placeholder="cth. sablon rubber, posisi dada kiri, dll."
              value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {/* Error */}
          {error && <p className="custom-error">{error}</p>}

          {/* CTA */}
          <button type="button" className="btn-dark custom-order-btn" onClick={handleAddToCart}>
            {success ? '✓ Ditambahkan ke Keranjang' : 'Tambah ke Keranjang →'}
          </button>
        </div>

        {/* ── Kanan: Mockup ── */}
        <div className="custom-mockup">
          <div className="custom-tab-btns">
            <button type="button"
              className={`custom-tab-btn${activeSide === 'front' ? ' custom-tab-btn--active' : ''}`}
              onClick={() => setActiveSide('front')}>
              Depan {frontDesign && <span className="custom-tab-dot" />}
            </button>
            <button type="button"
              className={`custom-tab-btn${activeSide === 'back' ? ' custom-tab-btn--active' : ''}`}
              onClick={() => setActiveSide('back')}>
              Belakang {backDesign && <span className="custom-tab-dot" />}
            </button>
          </div>

          <div className="custom-shirt-wrap">
            <ShirtSVG color={shirtColor} design={activeDesign} side={activeSide} />
          </div>

          {!activeDesign && (
            <p className="custom-mockup-hint">
              Upload desain {activeSide === 'front' ? 'depan' : 'belakang'} untuk lihat preview
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
  )
}
