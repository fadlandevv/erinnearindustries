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
  quantity: number
  unitPrice: number
}

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
  createdAt: string
  updatedAt?: string
}

/** Identitas penerbit yang tercetak di kop invoice. */
export const INVOICE_ISSUER = {
  name: 'Erinnear Industries',
  tagline: 'Custom Apparel & Printing',
  address: 'Jakarta, Indonesia',
  email: 'hello@erinnear.com',
  phone: '+62 812-3456-7890',
  bankName: 'BCA',
  bankAccount: '1234567890',
  bankHolder: 'Erinnear Industries',
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
