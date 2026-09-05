/*
  Bentuk baris pesanan custom — satu baris = satu kombinasi warna/ukuran/desain
  dengan jumlahnya sendiri, sebagaimana disusun di tabel invoice halaman custom.

  Dipakai bersama oleh halaman custom publik dan halaman order manual admin,
  jadi tidak boleh mengimpor apa pun yang khusus server.
*/

import type { PriceOption } from './custom-defaults'
import type { AmplopDesignSize, DesignPlacement } from './mockup'

export type SablonOpt = PriceOption | null

export type CustomOrderRow = {
  rowId: string
  /** Jenis produk saat baris dibuat — admin bisa mencampur produk dalam satu order. */
  productType: string
  warna: string
  warnaNama: string
  size: string
  bahan: string
  depan: boolean
  belakang: boolean
  /** URL preview lokal (blob) selama sesi berlangsung; bukan untuk disimpan. */
  depanPreview?: string
  belakangPreview?: string
  depanUrl?: string
  belakangUrl?: string
  sablonDepan: SablonOpt
  sablonBelakang: SablonOpt
  jumlah: number
  hargaPerPcs: number
  catatan?: string
  /** Penempatan desain di mockup, supaya produksi tahu orientasi & posisinya. */
  depanPlacement?: DesignPlacement
  belakangPlacement?: DesignPlacement
  /**
   * Ukuran cetak amplop yang dipilih saat baris dibuat. Disimpan karena area
   * cetaknya berbeda-beda, dan mockup perlu dirender ulang kalau baris diedit.
   */
  amplopDesignSize?: AmplopDesignSize
  /** Mockup hasil render — data URL selama di browser, URL storage setelah diunggah. */
  mockupDepan?: string
  mockupBelakang?: string
}

export const CUSTOM_PRODUCT_LABELS: Record<string, string> = {
  tshirt:             'T-Shirt',
  totebag:            'Totebag',
  'amplop-packaging': 'Amplop Packaging',
  'coach-jacket':     'Coach Jacket',
  hoodie:             'Hoodie',
  jersey:             'Jersey',
}

export const customProductLabel = (type: string) => CUSTOM_PRODUCT_LABELS[type] ?? 'Produk Custom'

/** Nama sablon tanpa embel-embel harga di belakang tanda "—". */
const sablonName = (o: SablonOpt) => o?.label.split('—')[0].trim()

/**
 * Judul satu baris untuk order & invoice. Semua spek diringkas ke satu kalimat
 * karena `InvoiceItem` hanya punya kolom deskripsi — tidak ada tempat terpisah
 * untuk bahan maupun sablon.
 */
export function customRowTitle(row: CustomOrderRow): string {
  const specs = [row.bahan, row.warnaNama].filter(Boolean).join(' · ')
  const sablon = [
    row.depan    && sablonName(row.sablonDepan)    ? `${sablonName(row.sablonDepan)} (depan)`       : '',
    row.belakang && sablonName(row.sablonBelakang) ? `${sablonName(row.sablonBelakang)} (belakang)` : '',
  ].filter(Boolean).join(' + ')

  return [
    `Custom ${customProductLabel(row.productType)}`,
    specs || undefined,
    sablon ? `Sablon ${sablon}` : undefined,
  ].filter(Boolean).join(' — ')
}

export const customRowsTotal = (rows: CustomOrderRow[]) =>
  rows.reduce((s, r) => s + r.hargaPerPcs * r.jumlah, 0)

export const customRowsQty = (rows: CustomOrderRow[]) =>
  rows.reduce((s, r) => s + r.jumlah, 0)
