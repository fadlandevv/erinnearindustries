// Shared invoice types & math — safe to import in client components (no Node.js APIs)

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled'

export const INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'cancelled']

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Terkirim',
  paid: 'Lunas',
  cancelled: 'Batal',
}

export type InvoiceItem = {
  description: string
  /** Nama warna sebagaimana dicetak, mis. "Hitam" — bukan kode hex. */
  color?: string
  size?: string
  quantity: number
  unitPrice: number
}

/** Apakah ada item yang mengisi varian, untuk memutuskan kolom dicetak atau tidak. */
export const hasVariants = (items: InvoiceItem[], key: 'color' | 'size') =>
  items.some(it => Boolean(it[key]))

export type InvoiceBillTo = {
  name: string
  email: string
  phone: string
  address: string
}

export type Invoice = {
  id: string
  number: string
  orderId?: string
  issueDate: string          // YYYY-MM-DD
  dueDate?: string           // YYYY-MM-DD
  status: InvoiceStatus
  billTo: InvoiceBillTo
  items: InvoiceItem[]
  discount: number           // rupiah, dipotong dari subtotal
  shipping: number           // rupiah, ditambahkan setelah pajak
  taxPercent: number         // mis. 11 untuk PPN 11%
  paidAmount: number         // DP / pembayaran yang sudah masuk
  notes?: string
  createdBy?: string
  /** URL bukti transfer yang diunggah admin untuk verifikasi. */
  paymentProof?: string
  createdAt: string
  updatedAt?: string
}

/**
 * Bentuk invoice sebagaimana diisi di form. Beda dari `Invoice`: field opsional
 * memakai string kosong, bukan `undefined`, karena itu yang dipegang input HTML.
 *
 * Tinggal di sini — bukan di komponen form — supaya halaman edit (server
 * component) bisa memanggil `draftFromInvoice()` tanpa melintasi batas 'use client'.
 */
export type InvoiceDraft = {
  orderId?: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  billTo: InvoiceBillTo
  items: InvoiceItem[]
  discount: number
  shipping: number
  taxPercent: number
  paidAmount: number
  notes: string
}

export const EMPTY_INVOICE_ITEM: InvoiceItem = { description: '', quantity: 1, unitPrice: 0 }

/**
 * Rangkai alamat pengiriman jadi satu baris untuk invoice. Kolom `address` pada
 * order sering sudah memuat kota/kode pos, jadi keduanya hanya ditambahkan bila
 * belum ada — kalau tidak, alamat cetak jadi "…, Depok (16454), Depok, 16454".
 */
export function joinAddress(address?: string, city?: string, postalCode?: string): string {
  const main = (address ?? '').trim()
  const parts = main ? [main] : []
  const haystack = main.toLowerCase()
  for (const extra of [city, postalCode]) {
    const value = (extra ?? '').trim()
    if (value && !haystack.includes(value.toLowerCase())) parts.push(value)
  }
  return parts.join(', ')
}

/** Produk katalog yang bisa dipilih di baris item invoice. */
export type InvoiceProductOption = {
  title: string
  unitPrice: number
  /** Ukuran & nama warna yang tersedia; jadi pilihan dropdown di kolomnya masing-masing. */
  sizes: string[]
  colors: string[]
}

/**
 * Nama warna acuan. Katalog produk hanya menyimpan kode hex tanpa nama, padahal
 * yang pantas tercetak di invoice adalah namanya — jadi hex dicocokkan ke daftar
 * ini lewat jarak RGB terdekat. Namanya tebakan terdidik, bukan data resmi;
 * admin tetap bisa menimpanya lewat opsi "Lainnya".
 */
const COLOR_NAMES: [name: string, hex: string][] = [
  ['Hitam', '#000000'], ['Putih', '#ffffff'], ['Broken White', '#f5f2ec'],
  ['Krem', '#f0e6d2'], ['Abu Muda', '#c4c4c4'], ['Abu-abu', '#808080'],
  ['Abu Tua', '#4a5568'], ['Navy', '#1a3a5c'], ['Biru', '#1e40af'],
  ['Biru Muda', '#60a5fa'], ['Tosca', '#14b8a6'], ['Hijau', '#16a34a'],
  ['Hijau Army', '#4b5320'], ['Merah', '#dc2626'], ['Maroon', '#7f1d1d'],
  ['Pink', '#ec4899'], ['Ungu', '#7c3aed'], ['Kuning', '#eab308'],
  ['Mustard', '#d97706'], ['Oranye', '#f97316'], ['Coklat', '#78350f'],
]

const hexToRgb = (hex: string): [number, number, number] | null => {
  const h = hex.trim().replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

/** Nama warna terdekat untuk sebuah hex; kalau tidak terbaca, hex-nya dikembalikan apa adanya. */
export function colorNameFromHex(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  let best = COLOR_NAMES[0][0]
  let bestDist = Infinity
  for (const [name, ref] of COLOR_NAMES) {
    const refRgb = hexToRgb(ref)!
    const dist = rgb.reduce((sum, c, i) => sum + (c - refRgb[i]) ** 2, 0)
    if (dist < bestDist) { bestDist = dist; best = name }
  }
  return best
}

/**
 * Katalog → opsi dropdown. Judul dipakai sebagai nilai opsi, jadi judul kembar
 * (varian yang tercatat dua kali) harus dibuang dulu supaya pilihannya tidak ambigu.
 *
 * Warna diterjemahkan dari hex ke nama; dua hex yang jatuh ke nama sama
 * (mis. #000000 dan #0d0d0d → "Hitam") digabung jadi satu pilihan.
 */
export function toProductOptions(
  products: { title: string; price: string; sizes?: string[]; colors?: string[] }[],
): InvoiceProductOption[] {
  const byTitle = new Map<string, InvoiceProductOption>()
  for (const p of products) {
    if (!p.title || byTitle.has(p.title)) continue
    const colors: string[] = []
    for (const hex of p.colors ?? []) {
      const name = colorNameFromHex(hex)
      if (!colors.includes(name)) colors.push(name)
    }
    byTitle.set(p.title, {
      title: p.title,
      unitPrice: parseInt(p.price.replace(/[^\d]/g, ''), 10) || 0,
      sizes: p.sizes ?? [],
      colors,
    })
  }
  return [...byTitle.values()]
}

export function draftFromInvoice(inv: Invoice): InvoiceDraft {
  return {
    orderId: inv.orderId,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate ?? '',
    status: inv.status,
    billTo: inv.billTo,
    items: inv.items.length ? inv.items : [{ ...EMPTY_INVOICE_ITEM }],
    discount: inv.discount,
    shipping: inv.shipping,
    taxPercent: inv.taxPercent,
    paidAmount: inv.paidAmount,
    notes: inv.notes ?? '',
  }
}

/** Identitas penerbit yang tercetak di kop invoice. */
export const INVOICE_ISSUER = {
  name: 'Erinnear Industries',
  tagline: 'Custom Apparel & Printing',
  address: 'Jakarta, Indonesia',
  email: 'hello@erinnear.com',
  phone: '+62 812-3456-7890',
  bankName: 'BANK BCA',
  bankAccount: '1234567890',
  bankHolder: 'Fadlan Hidayatulloh',
}

export type InvoiceTotals = {
  subtotal: number
  discount: number
  taxable: number
  tax: number
  shipping: number
  total: number
  paid: number
  balance: number
}

/**
 * Urutan hitung: subtotal → potong diskon → pajak atas nilai setelah diskon →
 * baru ongkir ditambahkan (ongkir tidak ikut dipajaki).
 */
export function computeInvoiceTotals(inv: {
  items: InvoiceItem[]
  discount: number
  shipping: number
  taxPercent: number
  paidAmount: number
}): InvoiceTotals {
  const subtotal = inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
  const discount = Math.min(Math.max(inv.discount, 0), subtotal)
  const taxable = subtotal - discount
  const tax = Math.round((taxable * inv.taxPercent) / 100)
  const shipping = Math.max(inv.shipping, 0)
  const total = taxable + tax + shipping
  const paid = Math.max(inv.paidAmount, 0)
  return { subtotal, discount, taxable, tax, shipping, total, paid, balance: total - paid }
}

export const formatRupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID')

export const formatInvoiceDate = (ymd: string) => {
  if (!ymd) return '—'
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ymd
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

/** Invoice dianggap lewat jatuh tempo hanya kalau belum lunas & belum dibatalkan. */
export function isOverdue(inv: Pick<Invoice, 'dueDate' | 'status'>, today = new Date()): boolean {
  if (!inv.dueDate || inv.status === 'paid' || inv.status === 'cancelled') return false
  const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return inv.dueDate < todayYmd
}
