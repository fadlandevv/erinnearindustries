import { db } from './db'

export type EntryType = 'pemasukan' | 'pengeluaran'

export type PembukuanEntry = {
  id: string
  date: string
  type: EntryType
  category: string
  description?: string
  amount: number
  note?: string
  filledBy?: string
  createdAt: string
}

export const PEMASUKAN_CATEGORIES = [
  'Penjualan Web',
  'Penjualan Marketplace',
  'Penjualan Offline',
  'Piutang / Transfer',
  'Lainnya',
]

export const PENGELUARAN_CATEGORIES = [
  'Bahan Baku',
  'Gaji & Upah',
  'Biaya Operasional',
  'Marketing & Promosi',
  'Sewa Tempat',
  'Utilitas',
  'Biaya Pengiriman',
  'Pembelian Peralatan',
  'Lainnya',
]

/*
  Supabase table SQL (run once in Supabase SQL editor):

  create table pembukuan (
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
  })
}

export async function deletePembukuanEntry(id: string): Promise<void> {
  await db.from('pembukuan').delete().eq('id', id)
}
