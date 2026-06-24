'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { generateId } from '@/lib/utils'
import { uploadDesignFileAction } from '@/lib/actions'

type Side = 'front' | 'back'

const CDD_CHEVRON = (
  <svg className="cdd-chevron" width="11" height="7" viewBox="0 0 12 8" fill="none">
    <path d="M1 1l5 5 5-5" stroke="#a0722a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function useCddClose(ref: React.RefObject<HTMLDivElement | null>, open: boolean, setOpen: (v: boolean) => void) {
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
}

function CustomDropdown({ options, value, onChange, placeholder, disabled }: {
  options: { label: string; price: number }[]
  value: string
  onChange: (label: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useCddClose(ref, open, setOpen)
  const selected = options.find(o => o.label === value)

  return (
    <div ref={ref} className={`cdd-wrap${disabled ? ' cdd-wrap--disabled' : ''}`}>
      <button type="button" className={`cdd-trigger${open ? ' cdd-trigger--open' : ''}`}
        disabled={disabled} onClick={() => setOpen(o => !o)}>
        <span className={selected ? 'cdd-value' : 'cdd-placeholder'}>
          {selected ? selected.label : (placeholder ?? 'Pilih...')}
        </span>
        {CDD_CHEVRON}
      </button>
      {open && (
        <div className="cdd-menu">
          {options.map(opt => (
            <button key={opt.label} type="button"
              className={`cdd-item${opt.label === value ? ' cdd-item--active' : ''}`}
              onClick={() => { onChange(opt.label); setOpen(false) }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ColorDropdown({ colors, value, onChange }: {
  colors: { label: string; value: string }[]
  value: string
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useCddClose(ref, open, setOpen)
  const selected = colors.find(c => c.value === value)

  return (
    <div ref={ref} className="cdd-wrap">
      <button type="button" className={`cdd-trigger${open ? ' cdd-trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}>
        <span className="cdd-trigger-left">
          <span className="cdd-color-preview" style={{ background: value }} />
          <span className="cdd-value">{selected?.label ?? 'Pilih warna'}</span>
        </span>
        {CDD_CHEVRON}
      </button>
      {open && (
        <div className="cdd-menu">
          {colors.map(c => (
            <button key={c.value} type="button"
              className={`cdd-item cdd-item--color${c.value === value ? ' cdd-item--active' : ''}`}
              onClick={() => { onChange(c.value); setOpen(false) }}>
              <span className="cdd-color-dot" style={{ background: c.value }} />
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const PRODUCT_TABS = [
  {
    id: 'tshirt', name: 'T-Shirt',
    icon: <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="m416.475 18.411-68.471-15.104-102.004 10 10 498.693h172.614v-287.867l36.839-177.913c-12.906-13.697-29.822-23.583-48.978-27.809z" fill="#ff6c6c"/><path d="m163.996 3.307-68.471 15.104c-19.157 4.226-36.072 14.112-48.978 27.809l36.839 177.913v287.867h172.614v-498.693z" fill="#f96"/><path d="m318.012 0-72.012 10 10 84.668c50.518 0 91.652-40.924 92.004-91.361z" fill="#cc295f"/><path d="m193.988 0-29.992 3.307c.352 50.437 41.486 91.361 92.004 91.361v-84.668z" fill="#f37"/><path d="m256 0-10 32.334 10 32.334c34.194 0 62.012-27.818 62.012-62.012v-2.656z" fill="#ece6f2"/><path d="m193.988 0v2.656c0 34.194 27.818 62.012 62.012 62.012v-64.668z" fill="#fff5f5"/><path d="m489.65 93.138c-3.573-17.985-12.134-34.116-24.197-46.919l-17.862 46.999c-12.547 33.014-18.977 68.036-18.977 103.353v27.56l80.73-31.867z" fill="#cc295f"/><path d="m64.409 93.219-17.862-47c-12.063 12.804-20.624 28.934-24.197 46.919l-19.694 99.128 80.73 31.867v-27.56c0-35.318-6.431-70.34-18.977-103.354z" fill="#f37"/></g></svg>,
  },
  {
    id: 'totebag', name: 'Totebag',
    icon: <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><g><path d="m326.063 219.138-50.641-189.138h-38.843l-50.641 189.138-28.98-7.76 56.596-211.378h84.891l56.596 211.378z" fill="#ff9f22"/></g><g><path d="m326.063 219.138-50.641-189.138h-19.422v-30h42.445l56.596 211.378z" fill="#dd7d00"/></g><path d="m372.04 512h-232.08c-16.569 0-30-13.431-30-30v-276.742h292.08v276.742c0 16.569-13.431 30-30 30z" fill="#ffde55"/><path d="m256 205.258h146.04v276.742c0 16.569-13.431 30-30 30h-116.04z" fill="#ff9f22"/><circle cx="256" cy="358.629" fill="#00ddc2" r="55"/><path d="m256 303.629c30.376 0 55 24.624 55 55s-24.624 55-55 55z" fill="#00aa95"/><path d="m241 343.629h30v30h-30z" fill="#beebfa" transform="matrix(-.707 -.707 .707 -.707 183.43 793.237)"/><path d="m256 337.416 21.213 21.213-21.213 21.213z" fill="#b3d8f4"/></g></svg>,
  },
  {
    id: 'amplop-packaging', name: 'Amplop Packaging',
    icon: <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><g><g><path d="m58.692 43.09v468.91l197.308-49.514 27.889-377.409-27.889-69.625z" fill="#f8bf59"/><path d="m453.308 43.09-197.308-17.141v436.537l197.308 49.514z" fill="#f28d3d"/></g></g><g><path d="m256 154.679 27.889-69.602-27.889-85.077h-197.308v43.09l99.791 111.589z" fill="#feec7d"/><path d="m256 0v154.679h97.517l99.791-111.589v-43.09z" fill="#f8bf59"/></g><g><path d="m256 436.071 27.889 5.471-27.889 70.458h-197.308l69.791-75.929z" fill="#feec7d"/><path d="m256 512v-75.929h127.517l69.791 75.929z" fill="#f8bf59"/></g><g><g><path d="m240.307 239.984h-30.09v-126.345l30.09 19.272z" fill="#6a4e67"/></g><g><path d="m301.783 239.984h-30.09v-107.073l30.09-19.272z" fill="#52314e"/></g></g><g><path d="m240.307 112.472c0-8.654 7.04-15.694 15.693-15.694l7.847-14.941-7.847-15.148c-25.245 0-45.783 20.538-45.783 45.783s20.538 45.783 45.783 45.783l13.815-13.831-13.815-16.259c-8.654 0-15.693-7.04-15.693-15.693z" fill="#ff6c6c"/><path d="m301.783 112.472c0-25.245-20.538-45.783-45.783-45.783v30.089c8.654 0 15.693 7.04 15.693 15.694s-7.04 15.693-15.693 15.693v30.089c25.245 0 45.783-20.538 45.783-45.782z" fill="#f37"/><path d="m240.307 239.984c0-8.654 7.04-15.693 15.693-15.693l10.272-14.526-10.272-15.564c-25.245 0-45.783 20.538-45.783 45.783s20.538 45.783 45.783 45.783l7.847-13.81-7.847-16.28c-8.654 0-15.693-7.04-15.693-15.693z" fill="#ff6c6c"/><path d="m256 194.201v30.089c8.654 0 15.693 7.04 15.693 15.693s-7.04 15.693-15.693 15.693v30.089c25.245 0 45.783-20.538 45.783-45.783s-20.538-45.781-45.783-45.781z" fill="#f37"/></g></g></svg>,
  },
  {
    id: 'coach-jacket', name: 'Coach Jacket',
    icon: <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><g><g><path d="m126.488 87.009-11.357 6.364c-36.295 20.025-58.842 58.216-58.842 99.67v261.233l49.347 21.58 49.347-21.58z" fill="#ffe977"/><path d="m56.289 454.275v57.725h70.199l28.496-57.725z" fill="#4d628f"/><path d="m455.711 454.275v-261.233c0-41.454-22.547-79.645-58.842-99.67l-11.357-6.151-29.339 367.053 49.769 21.58z" fill="#ffd45c"/><path d="m356.173 454.275 29.339 57.725h70.199v-57.725z" fill="#283d66"/></g></g><path d="m256 454.275 38.626-172.843-38.626-222.514h-79.384l-50.128 28.091v367.266l88.591 22.271z" fill="#ff6f77"/><path d="m385.512 454.275v-367.053l-52.26-28.304h-77.252v395.357l69.981 22.271z" fill="#ff336a"/><path d="m126.488 454.275v57.725h129.512l32.822-28.862-32.822-28.863z" fill="#ff336a"/><g><path d="m303.201 150.951h30.051v30.051h-30.051z" fill="#283d66"/></g><g><path d="m256 0h-79.384v58.918l79.384 28.091 32.822-43.505z" fill="#4d628f"/></g><path d="m256 454.275h129.512v57.725h-129.512z" fill="#da0060"/><path d="m333.252 58.918v-58.918h-77.252v87.009z" fill="#283d66"/></g></svg>,
  },
  {
    id: 'hoodie', name: 'Hoodie',
    icon: <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="m0 422h90v-75l-45-30-45 30z" fill="#5c5ccc"/><path d="m422 347v75h90v-75l-45-30z" fill="#375798"/><path d="m256 0-45 120h135l-15-120z" fill="#3c454e"/><path d="m181 0-15 90h90v-90z" fill="#375798"/><path d="m241 60c0-33.137-26.863-60-60-60h-30c-16.569 0-30 13.431-30 30s13.431 30 30 30l105 30z" fill="#8160ff"/><path d="m271 60c0-33.137 26.863-60 60-60h30c16.569 0 30 13.431 30 30s-13.431 30-30 30l-105 30z" fill="#5c5ccc"/><path d="m422 89.32-9.929-9.228c-13.925-12.956-32.062-20.092-51.071-20.092h-30l-15 30-15-30h-45l-90 226 90 226h136v-75l-15-37.5 15-37.5v-137h90z" fill="#375798"/><path d="m211 60-15 30-15-30h-30c-19.009 0-37.146 7.136-51.071 20.092l-9.929 9.228-60 135.68h90v137l15 37.5-15 37.5v75h136v-452z" fill="#5c5ccc"/><path d="m392 362h-15c-24.813 0-45-20.187-45-45v-15h-76l-45 67.5 45 67.5h136z" fill="#5c5ccc"/><path d="m180 302v15c0 24.813-20.187 45-45 45h-15v75h136v-135z" fill="#8160ff"/><path d="m181 60h30v150h-30z" fill="#fff"/><path d="m301 60h30v150h-30z" fill="#c6f2ff"/><path d="m0 172.963v174.037h90v-257.68z" fill="#8160ff"/><path d="m512 172.963-90-83.643v257.68h90z" fill="#5c5ccc"/></g></svg>,
  },
  {
    id: 'jersey', name: 'Jersey',
    icon: <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="m456.153 71.568c-2.487-12.515-8.6-23.698-17.227-32.413l-66.566 71.597 27.042 113.381 80.73-31.867z" fill="#ece6f2"/><path d="m55.847 71.568c2.487-12.515 8.6-23.698 17.227-32.413l66.566 71.597-27.042 113.381-80.73-31.867z" fill="#fff5f5"/><path d="m294.069 40.448h-48.069l10 471.552h143.402v-315.428c0-29.129 4.386-58.054 12.958-85.821z" fill="#ff4d4d"/><path d="m217.931 40.448-118.292 70.304c8.573 27.766 12.959 56.691 12.959 85.821v315.427h143.402v-471.552z" fill="#ff884d"/><path d="m192.266 0-89.244 22.126c-11.594 2.875-21.872 8.87-29.948 17.028l20.546 54.065c2.198 5.784 4.198 11.634 6.019 17.532l118.292-60.303h38.069v-50.448z" fill="#ff4d4d"/><path d="m408.978 22.126-89.244-22.126h-63.734v50.448h38.069l118.292 60.303c1.821-5.899 3.82-11.748 6.019-17.532l20.547-54.065c-8.077-8.158-18.355-14.153-29.949-17.028z" fill="#cc295f"/><path d="m256 0-10 31.867 10 31.867c28.093 0 52.581-19.119 59.394-46.374l4.34-17.36z" fill="#cfcfe6"/><path d="m192.266 0 4.34 17.361c6.814 27.254 31.301 46.374 59.394 46.374v-63.735z" fill="#ece6f2"/><path d="m287.867 174.336v-30h-31.867l-10 15 10 15z" fill="#0f244d"/><path d="m224.133 144.336h31.867v30h-31.867z" fill="#283d66"/></g></svg>,
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
const LOGO_COMBO_PRICE = 10000

type PriceOption = { label: string; price: number }
type SablonOpt = PriceOption | null

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255]
}

function resolveEffectiveSablon(depan: SablonOpt, belakang: SablonOpt): { depan: SablonOpt; belakang: SablonOpt } {
  const both = !!depan && !!belakang
  return {
    depan:    both && depan?.label === 'Logo'    ? { ...depan,    price: LOGO_COMBO_PRICE } : depan,
    belakang: both && belakang?.label === 'Logo' ? { ...belakang, price: LOGO_COMBO_PRICE } : belakang,
  }
}

type DesignPos = { x: number; y: number }
type DesignSize = 'logo' | 'a4' | 'a3'
type AmplopDesignSize = 'kecil' | 'sedang' | 'besar'

const DESIGN_SIZES: Record<DesignSize, { x: number; y: number; w: number; h: number }> = {
  logo: { x: 126, y: 82,  w: 48,  h: 48  },
  a4:   { x: 97,  y: 70,  w: 105, h: 130 },
  a3:   { x: 85,  y: 50,  w: 130, h: 195 },
}

const AMPLOP_DESIGN_SIZES: Record<AmplopDesignSize, { x: number; y: number; w: number; h: number }> = {
  kecil:  { x: 110, y: 155, w: 80,  h: 100 },
  sedang: { x:  75, y: 115, w: 150, h: 185 },
  besar:  { x:  35, y:  70, w: 230, h: 280 },
}

function sablonToDesignSize(label?: string): DesignSize {
  if (!label) return 'a4'
  const l = label.toLowerCase()
  if (l.includes('logo')) return 'logo'
  if (l.includes('a3'))   return 'a3'
  return 'a4'
}

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
  depanUrl?: string
  belakangUrl?: string
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

function clientToSVG(svg: SVGSVGElement, clientX: number, clientY: number): DesignPos {
  const rect = svg.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * 300,
    y: ((clientY - rect.top) / rect.height) * 340,
  }
}

function ProductMockupSVG({ color, design, side, productType, designPos, isDragging, onDesignPointerDown, onSVGPointerMove, onSVGPointerUp, svgRef, designSize, amplopDesignSize }: {
  color: string
  design: string | null
  side: Side
  productType: string
  designPos?: DesignPos
  isDragging: boolean
  onDesignPointerDown?: (e: React.PointerEvent<SVGImageElement>) => void
  onSVGPointerMove?: (e: React.PointerEvent<SVGElement>) => void
  onSVGPointerUp?: () => void
  svgRef?: React.RefObject<SVGSVGElement | null>
  designSize?: DesignSize
  amplopDesignSize?: AmplopDesignSize
}) {
  const isDark = color === '#1a1a1a' || color === '#1e3a5f' || color === '#6b7c3d'
  const stroke = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const hint   = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)'
  const id     = `clip-${productType}-${side}`
  const cfg    = MOCKUP_CONFIGS[productType] ?? MOCKUP_CONFIGS.tshirt
  const PHOTO_MOCKUPS: Record<string, { front: string; back: string; vb: string }> = {
    tshirt:            { front: '/mockups/tshirt.png',                    back: '/mockups/tshirt-back.png',            vb: '0 0 300 300' },
    'amplop-packaging':{ front: '/mockups/amplop-packaging.png',          back: '/mockups/amplop-packaging-back.png',  vb: '0 0 300 375' },
  }
  const photoMockup = PHOTO_MOCKUPS[productType] ?? null
  const isPhoto = photoMockup !== null
  const da = productType === 'amplop-packaging' && amplopDesignSize
    ? AMPLOP_DESIGN_SIZES[amplopDesignSize]
    : isPhoto && productType === 'tshirt' && designSize
      ? DESIGN_SIZES[designSize]
      : cfg.da
  const ox = designPos?.x ?? 0
  const oy = designPos?.y ?? 0
  const vb = photoMockup?.vb ?? '0 0 300 340'
  const filterId = `shirt-tint-${side}`
  const [cr, cg, cb] = hexToRgb(color)
  const cm = [
    cr*0.299, cr*0.587, cr*0.114, 0, 0,
    cg*0.299, cg*0.587, cg*0.114, 0, 0,
    cb*0.299, cb*0.587, cb*0.114, 0, 0,
    0, 0, 0, 1, 0,
  ].join(' ')

  return (
    <svg
      ref={svgRef as React.RefObject<SVGSVGElement>}
      viewBox={vb}
      xmlns="http://www.w3.org/2000/svg"
      className="custom-shirt-svg"
      style={{ touchAction: 'none' }}
      onPointerMove={onSVGPointerMove as React.PointerEventHandler<SVGSVGElement>}
      onPointerUp={onSVGPointerUp}
      onPointerLeave={onSVGPointerUp}
    >
      <defs>
        {!isPhoto && <clipPath id={id}><path d={cfg.clipPath}/></clipPath>}
        {isPhoto && (
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={cm}/>
          </filter>
        )}
      </defs>

      {isPhoto && photoMockup ? (
        <image
          href={side === 'front' ? photoMockup.front : photoMockup.back}
          x="0" y="0" width="300" height={photoMockup.vb.split(' ')[3]}
          preserveAspectRatio="xMidYMid meet"
          filter={productType === 'tshirt' ? `url(#${filterId})` : undefined}
        />
      ) : (
        cfg.paths.map((p, i) => <path key={i} d={p} fill={color} stroke={stroke} strokeWidth="1.5"/>)
      )}

      {design
        ? <image
            href={design}
            x={da.x + ox}
            y={da.y + oy}
            width={da.w}
            height={da.h}
            clipPath={isPhoto ? undefined : `url(#${id})`}
            preserveAspectRatio="xMidYMid meet"
            style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            onPointerDown={onDesignPointerDown}
            onPointerMove={onSVGPointerMove as React.PointerEventHandler<SVGImageElement>}
            onPointerUp={onSVGPointerUp}
          />
        : (
          <g clipPath={isPhoto ? undefined : `url(#${id})`}>
            <rect x={da.x} y={da.y} width={da.w} height={da.h} fill="none" stroke={hint} strokeWidth="1.2" strokeDasharray="6 4" rx="6"/>
            <text x={da.x + da.w / 2} y={da.y + da.h / 2 - 7} textAnchor="middle" fontSize="10" fill={hint} fontFamily="inherit">
              {side === 'front' ? 'Desain Depan' : 'Desain Belakang'}
            </text>
            <text x={da.x + da.w / 2} y={da.y + da.h / 2 + 8} textAnchor="middle" fontSize="9" fill={hint} fontFamily="inherit">Upload di kiri</text>
          </g>
        )
      }

      {!isPhoto && cfg.paths.map((p, i) => <path key={`o${i}`} d={p} fill="none" stroke={stroke} strokeWidth="1.5"/>)}

      {productType === 'coach-jacket' && <line x1="150" y1="18" x2="150" y2="340" stroke={stroke} strokeWidth="1" strokeDasharray="5,3"/>}
      {productType === 'hoodie' && <>
        <line x1="150" y1="68" x2="150" y2="210" stroke={stroke} strokeWidth="1" strokeDasharray="5,3"/>
        <rect x="108" y="268" width="84" height="48" rx="8" fill="none" stroke={stroke} strokeWidth="1.2"/>
      </>}
      {productType === 'jersey' && <>
        <rect x="52" y="85" width="18" height="135" fill={stroke}/>
        <rect x="230" y="85" width="18" height="135" fill={stroke}/>
      </>}
      {productType === 'amplop-packaging' && !isPhoto && <>
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
  shirtColor:       '#FFFFFF',
  selectedSize:     null as string | null,
  bahan:            '',
  bahanPrice:       0,
  bahanCustom:      '',
  bahanCustomPrice: 0,
  jumlah:           12,
  sablonDepan:      null as SablonOpt,
  sablonBelakang:   null as SablonOpt,
  note:             '',
  frontDesign:      null as string | null,
  backDesign:       null as string | null,
  frontUrl:         null as string | null,
  backUrl:          null as string | null,
}

type DragState = {
  side: Side
  startSvgX: number
  startSvgY: number
  startPosX: number
  startPosY: number
} | null

export default function CustomDesignClient({
  bahanOptions,
  sablonOptions,
  productType = 'tshirt',
}: {
  bahanOptions:  PriceOption[]
  sablonOptions: PriceOption[]
  productType?:  string
}) {
  const { addCustomItem, openCart } = useCart()

  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [activeSide, setActiveSide]   = useState<Side>('front')
  const [error, setError]             = useState('')
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack, setUploadingBack]   = useState(false)
  const [frontPos, setFrontPos] = useState<DesignPos>({ x: 0, y: 0 })
  const [backPos,  setBackPos]  = useState<DesignPos>({ x: 0, y: 0 })
  const [dragState, setDragState] = useState<DragState>(null)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<InvoiceItem>>({})
  const [amplopDesignSize, setAmplopDesignSize] = useState<AmplopDesignSize>('sedang')

  const [invoiceId]    = useState(() => generateId(6))
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])

  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)
  const svgRef   = useRef<SVGSVGElement>(null)

  const set = <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleUpload = async (side: Side, file: File) => {
    const preview = URL.createObjectURL(file)
    if (side === 'front') {
      setForm(f => ({ ...f, frontDesign: preview, frontUrl: null, sablonDepan: f.sablonDepan ?? sablonOptions[0] ?? null }))
      setUploadingFront(true)
    } else {
      setForm(f => ({ ...f, backDesign: preview, backUrl: null, sablonBelakang: f.sablonBelakang ?? sablonOptions[0] ?? null }))
      setUploadingBack(true)
    }

    const fd = new FormData()
    fd.set('file', file)
    const result = await uploadDesignFileAction(fd)

    if (side === 'front') {
      setUploadingFront(false)
      if (result.url) setForm(f => ({ ...f, frontUrl: result.url! }))
    } else {
      setUploadingBack(false)
      if (result.url) setForm(f => ({ ...f, backUrl: result.url! }))
    }
  }

  // Drag handlers
  const handleDesignPointerDown = (e: React.PointerEvent<SVGImageElement>) => {
    e.preventDefault()
    if (!svgRef.current) return
    const svg = clientToSVG(svgRef.current, e.clientX, e.clientY)
    const pos = activeSide === 'front' ? frontPos : backPos
    setDragState({ side: activeSide, startSvgX: svg.x, startSvgY: svg.y, startPosX: pos.x, startPosY: pos.y })
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }

  const handleSVGPointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!dragState || !svgRef.current) return
    const svg = clientToSVG(svgRef.current, e.clientX, e.clientY)
    const dx = svg.x - dragState.startSvgX
    const dy = svg.y - dragState.startSvgY
    const newPos = { x: dragState.startPosX + dx, y: dragState.startPosY + dy }
    if (dragState.side === 'front') setFrontPos(newPos)
    else setBackPos(newPos)
  }

  const handleSVGPointerUp = () => setDragState(null)

  const isAmplop = productType === 'amplop-packaging'

  const finalBahan   = form.bahan === 'Lainnya' ? form.bahanCustom : form.bahan
  const activeDesign = activeSide === 'front' ? form.frontDesign : form.backDesign
  const activePos    = activeSide === 'front' ? frontPos : backPos

  const bahanPriceVal = isAmplop ? 0 : (form.bahan === 'Lainnya' ? form.bahanCustomPrice : form.bahanPrice)
  const { depan: effDepan, belakang: effBelakang } = resolveEffectiveSablon(form.sablonDepan, form.sablonBelakang)
  const autoHarga =
    bahanPriceVal +
    (effDepan    ? effDepan.price    : 0) +
    (effBelakang ? effBelakang.price : 0)

  const handleAddToInvoice = () => {
    if (!isAmplop && !form.selectedSize)           { setError('Pilih ukuran.'); return }
    if (!isAmplop && !finalBahan)                  { setError('Pilih atau isi jenis bahan.'); return }
    if (!form.frontDesign && !form.backDesign)     { setError('Upload minimal satu desain.'); return }
    if (form.jumlah < 1)                           { setError('Jumlah minimal 1 pcs.'); return }

    const warnaNama = SHIRT_COLORS.find(c => c.value === form.shirtColor)?.label ?? form.shirtColor

    const item: InvoiceItem = {
      rowId:    generateId(4),
      warna:    form.shirtColor,
      warnaNama,
      size:     form.selectedSize ?? '',
      bahan:    finalBahan ?? '',
      depan:    !!form.frontDesign,
      belakang: !!form.backDesign,
      depanPreview:    form.frontDesign  ?? undefined,
      belakangPreview: form.backDesign   ?? undefined,
      depanUrl:        form.frontUrl     ?? undefined,
      belakangUrl:     form.backUrl      ?? undefined,
      sablonDepan:    form.frontDesign  ? effDepan    : null,
      sablonBelakang: form.backDesign   ? effBelakang : null,
      jumlah:   form.jumlah,
      hargaPerPcs: autoHarga,
      catatan:  form.note || undefined,
    }

    setInvoiceItems(prev => [...prev, item])
    setForm(f => ({ ...EMPTY_FORM, shirtColor: f.shirtColor }))
    setFrontPos({ x: 0, y: 0 })
    setBackPos({ x: 0, y: 0 })
    setError('')
    setActiveSide('front')
  }

  const removeRow = (rowId: string) => {
    setInvoiceItems(prev => prev.filter(i => i.rowId !== rowId))
    if (editingRowId === rowId) setEditingRowId(null)
  }

  const duplicateRow = (item: InvoiceItem) => {
    setInvoiceItems(prev => {
      const idx = prev.findIndex(i => i.rowId === item.rowId)
      const copy = { ...item, rowId: generateId(4) }
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
  }

  const startEdit = (item: InvoiceItem) => {
    setEditingRowId(item.rowId)
    setEditDraft({ warna: item.warna, warnaNama: item.warnaNama, size: item.size, jumlah: item.jumlah, sablonDepan: item.sablonDepan, sablonBelakang: item.sablonBelakang })
  }

  const saveEdit = (item: InvoiceItem) => {
    const { depan: effD, belakang: effB } = resolveEffectiveSablon(editDraft.sablonDepan ?? null, editDraft.sablonBelakang ?? null)
    const basePcs = item.hargaPerPcs - (item.sablonDepan?.price ?? 0) - (item.sablonBelakang?.price ?? 0)
    const newHarga = basePcs + (effD?.price ?? 0) + (effB?.price ?? 0)
    setInvoiceItems(prev => prev.map(i => i.rowId === item.rowId
      ? { ...i, ...editDraft, sablonDepan: effD, sablonBelakang: effB, warnaNama: SHIRT_COLORS.find(c => c.value === editDraft.warna)?.label ?? editDraft.warnaNama ?? i.warnaNama, hargaPerPcs: newHarga }
      : i
    ))
    setEditingRowId(null)
  }

  const grandTotal  = invoiceItems.reduce((s, i) => s + i.hargaPerPcs * i.jumlah, 0)
  const grandQty    = invoiceItems.reduce((s, i) => s + i.jumlah, 0)
  const MIN_QTY     = 24
  const belowMinQty = grandQty < MIN_QTY

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
        depanUrl:    item.depanUrl,
        belakangUrl: item.belakangUrl,
      })
    })
    setInvoiceItems([])
    openCart()
  }

  const activeTabName = PRODUCT_TABS.find(t => t.id === productType)?.name ?? 'Produk'

  return (
    <div>
      {/* ── Hero ── */}
      <div className="custom-hero">
        <div className="custom-hero-inner">
          <h1 className="custom-hero-title">Desain {activeTabName} Sendiri</h1>
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

            {/* Warna + Bahan — hidden for amplop */}
            {!isAmplop && (
              <>
                <div className="custom-row-2col">
                  <div className="custom-control-group">
                    <p className="custom-control-label">Warna Baju</p>
                    <ColorDropdown
                      colors={SHIRT_COLORS}
                      value={form.shirtColor}
                      onChange={v => set('shirtColor', v)}
                    />
                  </div>
                  <div className="custom-control-group">
                    <p className="custom-control-label">Jenis Bahan <span className="custom-required">*</span></p>
                    <CustomDropdown
                      options={[...bahanOptions, { label: 'Lainnya', price: 0 }]}
                      value={form.bahan}
                      placeholder="— Pilih bahan —"
                      onChange={label => {
                        const opt = bahanOptions.find(b => b.label === label)
                        setForm(f => ({ ...f, bahan: label, bahanPrice: opt?.price ?? 0 }))
                      }}
                    />
                  </div>
                </div>
                {form.bahan === 'Lainnya' && (
                  <div className="custom-control-group">
                    <input type="text" className="custom-text-input" placeholder="Tulis jenis bahan..."
                      value={form.bahanCustom} onChange={e => set('bahanCustom', e.target.value)} />
                    <div className="custom-price-row">
                      <span className="custom-price-prefix">Rp</span>
                      <input type="number" inputMode="numeric" className="custom-text-input custom-text-input--price"
                        placeholder="Harga baju/pcs" min={0}
                        value={form.bahanCustomPrice || ''}
                        onChange={e => set('bahanCustomPrice', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Ukuran + Jumlah */}
            <div className="custom-row-2col">
              {!isAmplop && (
                <div className="custom-control-group">
                  <p className="custom-control-label">Ukuran <span className="custom-required">*</span></p>
                  <CustomDropdown
                    options={SIZES.map(s => ({ label: s, price: 0 }))}
                    value={form.selectedSize ?? ''}
                    placeholder="Pilih ukuran"
                    onChange={s => set('selectedSize', s)}
                  />
                </div>
              )}
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
            </div>

            {/* Ukuran Desain — amplop only */}
            {isAmplop && (
              <div className="custom-control-group">
                <p className="custom-control-label">Ukuran Desain</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['kecil', 'sedang', 'besar'] as AmplopDesignSize[]).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setAmplopDesignSize(sz)}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8, border: '1.5px solid',
                        borderColor: amplopDesignSize === sz ? '#a0722a' : '#e2dbd0',
                        background: amplopDesignSize === sz ? '#fdf6ec' : '#fff',
                        color: amplopDesignSize === sz ? '#a0722a' : '#555',
                        fontWeight: amplopDesignSize === sz ? 600 : 400,
                        fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                        textTransform: 'capitalize',
                      }}
                    >
                      {sz.charAt(0).toUpperCase() + sz.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Depan + Sablon Depan */}
            <div className="custom-control-group">
              <p className="custom-control-label">Desain Depan <span className="custom-required">*</span></p>
              <input ref={frontRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload('front', f) }} />
              <div className="custom-upload-row">
                <button type="button"
                  className={`custom-upload-area-btn${form.frontDesign ? ' custom-upload-area-btn--done' : ''}`}
                  disabled={uploadingFront}
                  onClick={() => { setActiveSide('front'); frontRef.current?.click() }}>
                  {form.frontDesign ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{uploadingFront ? 'Mengupload...' : 'Tersimpan'}</span>
                      <button type="button" className="custom-upload-remove-x"
                        onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, frontDesign: null, frontUrl: null, sablonDepan: null })); setFrontPos({ x: 0, y: 0 }) }}>×</button>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Upload Gambar</span>
                    </>
                  )}
                </button>
                <CustomDropdown
                  options={sablonOptions}
                  value={form.sablonDepan?.label ?? ''}
                  placeholder="Pilih ukuran sablon"
                  disabled={!form.frontDesign}
                  onChange={label => {
                    const opt = sablonOptions.find(o => o.label === label)
                    if (opt) set('sablonDepan', opt)
                  }}
                />
              </div>
            </div>

            {/* Upload Belakang + Sablon Belakang */}
            <div className="custom-control-group">
              <p className="custom-control-label">Desain Belakang</p>
              <input ref={backRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload('back', f) }} />
              <div className="custom-upload-row">
                <button type="button"
                  className={`custom-upload-area-btn${form.backDesign ? ' custom-upload-area-btn--done' : ''}`}
                  disabled={uploadingBack}
                  onClick={() => { setActiveSide('back'); backRef.current?.click() }}>
                  {form.backDesign ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{uploadingBack ? 'Mengupload...' : 'Tersimpan'}</span>
                      <button type="button" className="custom-upload-remove-x"
                        onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, backDesign: null, backUrl: null, sablonBelakang: null })); setBackPos({ x: 0, y: 0 }) }}>×</button>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Upload Gambar</span>
                    </>
                  )}
                </button>
                <CustomDropdown
                  options={sablonOptions}
                  value={form.sablonBelakang?.label ?? ''}
                  placeholder="Pilih ukuran sablon"
                  disabled={!form.backDesign}
                  onChange={label => {
                    const opt = sablonOptions.find(o => o.label === label)
                    if (opt) set('sablonBelakang', opt)
                  }}
                />
              </div>
            </div>

            {/* Auto price display */}
            {bahanPriceVal > 0 && (
              <div className="custom-price-display">
                <span className="custom-price-display-label">Harga/pcs</span>
                <div className="custom-price-breakdown">
                  {!isAmplop && <><span>Baju ({finalBahan || 'bahan'})</span><span>{formatRp(bahanPriceVal)}</span></>}
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
              <ProductMockupSVG
                color={form.shirtColor}
                design={activeDesign}
                side={activeSide}
                productType={productType}
                designPos={activePos}
                isDragging={dragState !== null}
                onDesignPointerDown={handleDesignPointerDown}
                onSVGPointerMove={handleSVGPointerMove}
                onSVGPointerUp={handleSVGPointerUp}
                svgRef={svgRef}
                designSize={sablonToDesignSize(activeSide === 'front' ? form.sablonDepan?.label : form.sablonBelakang?.label)}
                amplopDesignSize={isAmplop ? amplopDesignSize : undefined}
              />
            </div>
            {activeDesign
              ? <p className="custom-mockup-hint" style={{ opacity: 0.6 }}>Drag desain untuk atur posisi</p>
              : <p className="custom-mockup-hint">Upload desain {activeSide === 'front' ? 'depan' : 'belakang'} untuk preview</p>
            }
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
                    <React.Fragment key={item.rowId}>
                      <tr className={editingRowId === item.rowId ? 'invoice-row--editing' : ''}>
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
                          <div className="invoice-row-actions">
                            <button type="button" className="invoice-action-btn" title="Edit"
                              onClick={() => editingRowId === item.rowId ? setEditingRowId(null) : startEdit(item)}>
                              <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                            </button>
                            <button type="button" className="invoice-action-btn" title="Duplikat"
                              onClick={() => duplicateRow(item)}>
                              <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
                            </button>
                            <button type="button" className="invoice-remove-btn" title="Hapus"
                              onClick={() => removeRow(item.rowId)}>
                              <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editingRowId === item.rowId && (
                        <tr className="invoice-edit-row">
                          <td colSpan={9}>
                            <div className="invoice-edit-form">
                              <div className="invoice-edit-grid">
                                <div className="invoice-edit-field">
                                  <label className="invoice-edit-label">Warna</label>
                                  <ColorDropdown
                                    colors={SHIRT_COLORS}
                                    value={editDraft.warna ?? item.warna}
                                    onChange={v => setEditDraft(d => ({ ...d, warna: v }))}
                                  />
                                </div>
                                <div className="invoice-edit-field">
                                  <label className="invoice-edit-label">Ukuran</label>
                                  <CustomDropdown
                                    options={SIZES.map(s => ({ label: s, price: 0 }))}
                                    value={editDraft.size ?? item.size}
                                    onChange={s => setEditDraft(d => ({ ...d, size: s }))}
                                  />
                                </div>
                                <div className="invoice-edit-field">
                                  <label className="invoice-edit-label">Jumlah</label>
                                  <div className="custom-qty-row">
                                    <button type="button" className="custom-qty-btn"
                                      onClick={() => setEditDraft(d => ({ ...d, jumlah: Math.max(1, (d.jumlah ?? item.jumlah) - 1) }))}>−</button>
                                    <input type="number" className="custom-qty-input" min={1}
                                      value={editDraft.jumlah ?? item.jumlah}
                                      onChange={e => setEditDraft(d => ({ ...d, jumlah: Math.max(1, parseInt(e.target.value) || 1) }))} />
                                    <button type="button" className="custom-qty-btn"
                                      onClick={() => setEditDraft(d => ({ ...d, jumlah: (d.jumlah ?? item.jumlah) + 1 }))}>+</button>
                                  </div>
                                </div>
                                {item.depan && (
                                  <div className="invoice-edit-field">
                                    <label className="invoice-edit-label">Sablon Depan</label>
                                    <CustomDropdown
                                      options={sablonOptions}
                                      value={editDraft.sablonDepan?.label ?? item.sablonDepan?.label ?? ''}
                                      placeholder="Pilih sablon"
                                      onChange={label => {
                                        const opt = sablonOptions.find(o => o.label === label)
                                        if (opt) setEditDraft(d => ({ ...d, sablonDepan: opt }))
                                      }}
                                    />
                                  </div>
                                )}
                                {item.belakang && (
                                  <div className="invoice-edit-field">
                                    <label className="invoice-edit-label">Sablon Belakang</label>
                                    <CustomDropdown
                                      options={sablonOptions}
                                      value={editDraft.sablonBelakang?.label ?? item.sablonBelakang?.label ?? ''}
                                      placeholder="Pilih sablon"
                                      onChange={label => {
                                        const opt = sablonOptions.find(o => o.label === label)
                                        if (opt) setEditDraft(d => ({ ...d, sablonBelakang: opt }))
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="invoice-edit-actions">
                                <button type="button" className="invoice-edit-save" onClick={() => saveEdit(item)}>Simpan</button>
                                <button type="button" className="invoice-edit-cancel" onClick={() => setEditingRowId(null)}>Batal</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand Total */}
            <div className="invoice-grand-total">
              <div className="invoice-grand-left">
                <span>{grandQty} pcs · {invoiceItems.length} item</span>
                {belowMinQty && (
                  <span className="invoice-min-qty-warning">
                    Minimal order {MIN_QTY} pcs · kurang {MIN_QTY - grandQty} pcs
                  </span>
                )}
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
                onClick={handleCheckout} disabled={belowMinQty}>
                Masuk ke Keranjang →
              </button>
            </div>

          </div>
        </section>
      )}
    </div>
  )
}
