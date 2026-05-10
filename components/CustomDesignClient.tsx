'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

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

function ShirtSVG({ color, design, side }: { color: string; design: string | null; side: Side }) {
  const isDark = color === '#1a1a1a' || color === '#1e3a5f' || color === '#6b7c3d'
  const strokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const labelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)'

  return (
    <svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" className="custom-shirt-svg">
      <defs>
        <clipPath id={`shirt-clip-${side}`}>
          <path d="M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 Q 176,50 150,55 Q 124,50 118,0 Z" />
        </clipPath>
      </defs>

      {/* Shirt fill */}
      <path
        d="M 118,0 L 52,22 L 0,68 L 0,105 L 52,85 L 52,340 L 248,340 L 248,85 L 300,105 L 300,68 L 248,22 L 182,0 Q 176,50 150,55 Q 124,50 118,0 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
      />

      {/* Design overlay clipped to shirt */}
      {design && (
        <image
          href={design}
          x="90" y="90"
          width="120" height="120"
          clipPath={`url(#shirt-clip-${side})`}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* Empty print zone indicator */}
      {!design && (
        <g clipPath={`url(#shirt-clip-${side})`}>
          <rect x="90" y="90" width="120" height="120" fill="none" stroke={labelColor} strokeWidth="1.2" strokeDasharray="6 4" rx="6" />
          <text x="150" y="148" textAnchor="middle" fontSize="10" fill={labelColor} fontFamily="inherit">
            {side === 'front' ? 'Desain Depan' : 'Desain Belakang'}
          </text>
          <text x="150" y="162" textAnchor="middle" fontSize="9" fill={labelColor} fontFamily="inherit">
            Klik upload di bawah
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
  const [activeSide, setActiveSide] = useState<Side>('front')
  const [frontDesign, setFrontDesign] = useState<string | null>(null)
  const [backDesign, setBackDesign] = useState<string | null>(null)
  const [shirtColor, setShirtColor] = useState('#FFFFFF')
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const frontRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)

  const handleUpload = (side: Side, file: File) => {
    const url = URL.createObjectURL(file)
    if (side === 'front') setFrontDesign(url)
    else setBackDesign(url)
  }

  const activeDesign = activeSide === 'front' ? frontDesign : backDesign

  const whatsappMsg = encodeURIComponent(
    `Halo Erinnear! Saya ingin custom order:\n- Warna baju: ${SHIRT_COLORS.find(c => c.value === shirtColor)?.label ?? shirtColor}\n- Ukuran: ${selectedSize ?? 'belum dipilih'}\n- Catatan: ${note || '-'}\n\n(desain akan saya kirim via file)`
  )

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

          {/* Ukuran */}
          <div className="custom-control-group">
            <p className="custom-control-label">Ukuran</p>
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

          {/* Upload Depan */}
          <div className="custom-control-group">
            <p className="custom-control-label">Desain Depan</p>
            <input
              ref={frontRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleUpload('front', f)
              }}
            />
            <button
              type="button"
              className={`custom-upload-btn${frontDesign ? ' custom-upload-btn--done' : ''}`}
              onClick={() => { setActiveSide('front'); frontRef.current?.click() }}
            >
              {frontDesign ? '✓ Desain Depan Terupload' : '↑ Upload Desain Depan'}
            </button>
            {frontDesign && (
              <button type="button" className="custom-remove-btn" onClick={() => setFrontDesign(null)}>
                Hapus
              </button>
            )}
          </div>

          {/* Upload Belakang */}
          <div className="custom-control-group">
            <p className="custom-control-label">Desain Belakang</p>
            <input
              ref={backRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleUpload('back', f)
              }}
            />
            <button
              type="button"
              className={`custom-upload-btn${backDesign ? ' custom-upload-btn--done' : ''}`}
              onClick={() => { setActiveSide('back'); backRef.current?.click() }}
            >
              {backDesign ? '✓ Desain Belakang Terupload' : '↑ Upload Desain Belakang'}
            </button>
            {backDesign && (
              <button type="button" className="custom-remove-btn" onClick={() => setBackDesign(null)}>
                Hapus
              </button>
            )}
          </div>

          {/* Catatan */}
          <div className="custom-control-group">
            <p className="custom-control-label">Catatan Tambahan <span style={{ color: '#aaa', fontWeight: 400 }}>(opsional)</span></p>
            <textarea
              className="custom-note-input"
              rows={3}
              placeholder="cth. sablon rubber, jumlah 24 pcs, dll."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* CTA */}
          <a
            href={`https://wa.me/6281234567890?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark custom-order-btn"
          >
            Pesan via WhatsApp →
          </a>
          <Link href="/contact" className="btn-outline custom-order-btn" style={{ textAlign: 'center', justifyContent: 'center' }}>
            Atau kirim via form kontak
          </Link>
        </div>

        {/* ── Kanan: Mockup ── */}
        <div className="custom-mockup">

          {/* Tab depan / belakang */}
          <div className="custom-tab-btns">
            <button
              type="button"
              className={`custom-tab-btn${activeSide === 'front' ? ' custom-tab-btn--active' : ''}`}
              onClick={() => setActiveSide('front')}
            >
              Depan
              {frontDesign && <span className="custom-tab-dot" />}
            </button>
            <button
              type="button"
              className={`custom-tab-btn${activeSide === 'back' ? ' custom-tab-btn--active' : ''}`}
              onClick={() => setActiveSide('back')}
            >
              Belakang
              {backDesign && <span className="custom-tab-dot" />}
            </button>
          </div>

          {/* Shirt mockup */}
          <div className="custom-shirt-wrap">
            <ShirtSVG color={shirtColor} design={activeDesign} side={activeSide} />
          </div>

          {/* Upload hint */}
          {!activeDesign && (
            <p className="custom-mockup-hint">
              Klik &quot;Upload Desain {activeSide === 'front' ? 'Depan' : 'Belakang'}&quot; di kiri untuk melihat preview
            </p>
          )}

          {/* Info */}
          <div className="custom-info-pills">
            <span className="custom-info-pill">PNG / JPG / SVG</span>
            <span className="custom-info-pill">Min. 300 DPI</span>
            <span className="custom-info-pill">Transparent background</span>
          </div>
        </div>

      </div>
    </section>
  )
}
