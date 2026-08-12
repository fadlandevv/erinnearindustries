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
