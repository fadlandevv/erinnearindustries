import { db } from './db'
import { generateId } from './utils'
import { getUsers } from './users'
import { getOrders } from './orders'
import { joinAddress } from './invoice-constants'
import type { Invoice, InvoiceItem, InvoiceStatus } from './invoice-constants'

export type { Invoice, InvoiceItem, InvoiceStatus, InvoiceBillTo } from './invoice-constants'

/*
  Tabel `invoices` ada di supabase-schema.sql — jalankan sekali di Supabase SQL Editor.
*/

function toInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    number: row.number as string,
    orderId: (row.order_id as string) ?? undefined,
    issueDate: row.issue_date as string,
    dueDate: (row.due_date as string) ?? undefined,
    status: row.status as InvoiceStatus,
    billTo: row.bill_to as Invoice['billTo'],
    items: (row.items as InvoiceItem[]) ?? [],
    discount: Number(row.discount ?? 0),
    shipping: Number(row.shipping ?? 0),
    taxPercent: Number(row.tax_percent ?? 0),
    paidAmount: Number(row.paid_amount ?? 0),
    notes: (row.notes as string) ?? undefined,
    createdBy: (row.created_by as string) ?? undefined,
    paymentProof: (row.payment_proof as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? undefined,
  }
}

function toRow(inv: Invoice) {
  return {
    id: inv.id,
    number: inv.number,
    order_id: inv.orderId ?? null,
    issue_date: inv.issueDate,
    due_date: inv.dueDate ?? null,
    status: inv.status,
    bill_to: inv.billTo,
    items: inv.items,
    discount: inv.discount,
    shipping: inv.shipping,
    tax_percent: inv.taxPercent,
    paid_amount: inv.paidAmount,
    notes: inv.notes ?? null,
    created_by: inv.createdBy ?? null,
    payment_proof: inv.paymentProof ?? null,
  }
}

export async function getInvoices(): Promise<Invoice[]> {
  const { data } = await db
    .from('invoices')
    .select('*')
    .order('issue_date', { ascending: false })
    .order('created_at', { ascending: false })
  return (data ?? []).map(toInvoice)
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const { data } = await db.from('invoices').select('*').eq('id', id).maybeSingle()
  return data ? toInvoice(data) : undefined
}

export async function getInvoicesByOrderId(orderId: string): Promise<Invoice[]> {
  const { data } = await db
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(toInvoice)
}

/** Nomor berikutnya untuk bulan tsb: INV/2026/08/0007 */
async function nextInvoiceNumber(issueDate: string): Promise<string> {
  const [year, month] = issueDate.split('-')
  const prefix = `INV/${year}/${month}/`
  const { data } = await db
    .from('invoices')
    .select('number')
    .like('number', `${prefix}%`)
    .order('number', { ascending: false })
    .limit(1)

  const last = data?.[0]?.number as string | undefined
  const seq = last ? parseInt(last.slice(prefix.length), 10) + 1 : 1
  return prefix + String(Number.isNaN(seq) ? 1 : seq).padStart(4, '0')
}

/**
 * Menyimpan invoice baru dengan nomor urut per bulan.
 *
 * Nomor dihitung lewat read-then-insert, jadi dua admin yang menyimpan bersamaan
 * bisa memperebutkan nomor yang sama. Unique constraint di kolom `number` yang
 * memutuskan siapa yang menang; yang kalah menghitung ulang dan mencoba lagi.
 */
export async function createInvoice(
  input: Omit<Invoice, 'id' | 'number' | 'createdAt'>,
): Promise<Invoice> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const invoice: Invoice = {
      ...input,
      id: generateId(10),
      number: await nextInvoiceNumber(input.issueDate),
      createdAt: new Date().toISOString(),
    }
    const { data, error } = await db.from('invoices').insert(toRow(invoice)).select().single()
    if (!error && data) return toInvoice(data)
    // 23505 = unique_violation → nomor keburu dipakai orang lain, hitung ulang.
    if (error?.code !== '23505') throw new Error(error?.message ?? 'Gagal menyimpan invoice.')
  }
  throw new Error('Gagal mendapatkan nomor invoice, coba lagi.')
}

/**
 * Patch parsial. Field yang *ada* di `patch` selalu ditulis, termasuk kalau
 * nilainya `undefined` — itulah cara admin mengosongkan jatuh tempo atau catatan
 * lewat form edit. Field yang tidak disebut sama sekali dibiarkan apa adanya.
 */
export async function updateInvoice(
  id: string,
  patch: Partial<Omit<Invoice, 'id' | 'number' | 'createdAt'>>,
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const set = (key: keyof typeof patch, column: string, nullable = false) => {
    if (!(key in patch)) return
    const value = patch[key]
    if (value === undefined && !nullable) return
    row[column] = value ?? null
  }

  set('orderId', 'order_id', true)
  set('issueDate', 'issue_date')
  set('dueDate', 'due_date', true)
  set('status', 'status')
  set('billTo', 'bill_to')
  set('items', 'items')
  set('discount', 'discount')
  set('shipping', 'shipping')
  set('taxPercent', 'tax_percent')
  set('paidAmount', 'paid_amount')
  set('notes', 'notes', true)
  set('paymentProof', 'payment_proof', true)

  const { error } = await db.from('invoices').update(row).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await db.from('invoices').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export type InvoiceCustomerOption = {
  name: string
  email: string
  phone: string
  address: string
  source: 'member' | 'order'
}

/**
 * Kandidat penerima tagihan untuk dropdown di form invoice: member terdaftar
 * digabung dengan pembeli yang pernah checkout. Deduplikasi memakai email —
 * data order lebih diutamakan karena membawa alamat pengiriman.
 * Order reseller (`@reseller.internal`) dilewati, itu bukan pelanggan akhir.
 */
export async function getInvoiceCustomerOptions(): Promise<InvoiceCustomerOption[]> {
  const [users, orders] = await Promise.all([getUsers(), getOrders()])
  const byEmail = new Map<string, InvoiceCustomerOption>()

  for (const u of users) {
    const key = u.email.toLowerCase()
    if (!key) continue
    byEmail.set(key, {
      name: u.name, email: u.email, phone: u.phone ?? '', address: '', source: 'member',
    })
  }

  for (const o of orders) {
    const email = (o.customer.email ?? '').toLowerCase()
    if (!email || email.endsWith('@reseller.internal')) continue
    const address = joinAddress(o.customer.address, o.customer.city, o.customer.postalCode)
    const existing = byEmail.get(email)
    // getOrders() terurut terbaru dulu, jadi entri pertama yang menang.
    if (existing?.source === 'order') continue
    byEmail.set(email, {
      name: o.customer.name || existing?.name || email,
      email: o.customer.email,
      phone: o.customer.phone || existing?.phone || '',
      address,
      source: 'order',
    })
  }

  return [...byEmail.values()].sort((a, b) => a.name.localeCompare(b.name, 'id'))
}
