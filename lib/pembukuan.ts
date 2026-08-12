import { db } from './db'
import { computeInvoiceTotals, type Invoice } from './invoice-constants'
import type { EntryType, PembukuanEntry } from './pembukuan-constants'

export type { EntryType, PembukuanEntry } from './pembukuan-constants'
export { PEMASUKAN_CATEGORIES, PENGELUARAN_CATEGORIES } from './pembukuan-constants'

/*
  Supabase table SQL (run once in Supabase SQL Editor):

  create table if not exists pembukuan (
    id uuid primary key default gen_random_uuid(),
    date date not null,
    type text not null check (type in ('pemasukan', 'pengeluaran')),
    category text not null,
    description text,
    amount bigint not null,
    note text,
    filled_by text,
    created_at timestamptz not null default now()
  );

  create index if not exists pembukuan_date_idx on pembukuan (date);
*/

export async function getPembukuanByMonth(
  year: number,
  month: number,
): Promise<PembukuanEntry[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data } = await db
    .from('pembukuan')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  return (data ?? []).map(row => ({
    id: row.id,
    date: row.date,
    type: row.type as EntryType,
    category: row.category,
    description: row.description ?? undefined,
    amount: row.amount,
    note: row.note ?? undefined,
    filledBy: row.filled_by ?? undefined,
    invoiceId: row.invoice_id ?? undefined,
    createdAt: row.created_at,
  }))
}

export async function savePembukuanEntry(
  entry: Omit<PembukuanEntry, 'id' | 'createdAt'>,
): Promise<void> {
  await db.from('pembukuan').insert({
    date: entry.date,
    type: entry.type,
    category: entry.category,
    description: entry.description ?? null,
    amount: entry.amount,
    note: entry.note ?? null,
    filled_by: entry.filledBy ?? null,
    invoice_id: entry.invoiceId ?? null,
  })
}

/**
 * Menyelaraskan satu entri pemasukan dengan status sebuah invoice.
 *
 * Dipanggil setiap kali invoice disimpan. `invoice_id` jadi kunci idempoten:
 * mengubah status Lunas → Draft → Lunas berkali-kali tetap menyisakan paling
 * banyak satu entri, dan mengubah nominal invoice ikut memperbarui entrinya.
 * Begitu status bukan Lunas lagi, entrinya dihapus supaya pembukuan tidak
 * menyimpan pemasukan hantu.
 */
export async function syncInvoiceIncome(invoice: Invoice): Promise<void> {
  const { data } = await db.from('pembukuan').select('id').eq('invoice_id', invoice.id).maybeSingle()
  const existingId = data?.id as string | undefined

  const totals = computeInvoiceTotals(invoice)
  // "Jumlah yang benar-benar dibayar" = kolom Sudah Dibayar / DP. Kalau admin
  // menandai Lunas tanpa mengisinya, total invoice yang dipakai — mencatat Rp 0
  // jelas bukan yang dimaksud.
  const amount = totals.paid > 0 ? totals.paid : totals.total

  if (invoice.status !== 'paid' || amount <= 0) {
    if (existingId) await db.from('pembukuan').delete().eq('id', existingId)
    return
  }

  const row = {
    date: invoice.issueDate,
    type: 'pemasukan' as EntryType,
    // Invoice dari order web dicatat sebagai penjualan web; sisanya invoice
    // yang dibuat manual, jadi masuk penjualan offline.
    category: invoice.orderId ? 'Penjualan Web' : 'Penjualan Offline',
    description: `Invoice ${invoice.number} — ${invoice.billTo.name}`,
    amount,
    note: 'Tercatat otomatis dari invoice',
    filled_by: invoice.createdBy ?? null,
    invoice_id: invoice.id,
  }

  const { error } = existingId
    ? await db.from('pembukuan').update(row).eq('id', existingId)
    : await db.from('pembukuan').insert(row)
  if (error) throw new Error(error.message)
}

/** Membersihkan entri otomatis saat invoice-nya dihapus. */
export async function removeInvoiceIncome(invoiceId: string): Promise<void> {
  await db.from('pembukuan').delete().eq('invoice_id', invoiceId)
}

export async function deletePembukuanEntry(id: string): Promise<void> {
  await db.from('pembukuan').delete().eq('id', id)
}

export async function getPembukuanByYear(year: number): Promise<PembukuanEntry[]> {
  const from = `${year}-01-01`
  const to = `${year}-12-31`

  const { data } = await db
    .from('pembukuan')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })

  return (data ?? []).map(row => ({
    id: row.id,
    date: row.date,
    type: row.type as EntryType,
    category: row.category,
    description: row.description ?? undefined,
    amount: row.amount,
    note: row.note ?? undefined,
    filledBy: row.filled_by ?? undefined,
    invoiceId: row.invoice_id ?? undefined,
    createdAt: row.created_at,
  }))
}
