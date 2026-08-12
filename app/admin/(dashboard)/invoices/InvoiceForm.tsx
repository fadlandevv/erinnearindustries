'use client'
import { useState, useActionState } from 'react'
import Link from 'next/link'
import AdminSelect from '@/components/AdminSelect'
import { createInvoiceAction, updateInvoiceAction } from '@/lib/actions'
import {
  computeInvoiceTotals, formatRupiah, EMPTY_INVOICE_ITEM,
  INVOICE_STATUSES, INVOICE_STATUS_LABELS,
  type InvoiceDraft, type InvoiceItem, type InvoiceProductOption,
} from '@/lib/invoice-constants'
import type { InvoiceCustomerOption } from '@/lib/invoices'

/** Nilai sentinel untuk item yang diketik manual (produk khusus / jasa). */
const CUSTOM = '__custom__'

/**
 * Blok angka selalu tersorot saat diklik, jadi mengetik langsung menimpa nilai
 * lama alih-alih menyisip di sebelah "0" atau "1".
 */
const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select()

/** Input rupiah: tampil "1.500.000" untuk admin, kirim angka mentah ke server. */
function RupiahInput({
  name, value, onChange, id,
}: { name: string; value: number; onChange: (n: number) => void; id?: string }) {
  return (
    <div className="inv-money-input">
      <span className="inv-money-prefix">Rp</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        className="admin-form-input"
        value={value ? value.toLocaleString('id-ID') : ''}
        placeholder="0"
        onFocus={selectOnFocus}
        onChange={e => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
      />
      {/* Field yang benar-benar terkirim — server tidak perlu mengurai pemisah ribuan. */}
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

type Props = {
  mode: 'create' | 'edit'
  invoiceId?: string
  initial: InvoiceDraft
  cancelHref: string
  products: InvoiceProductOption[]
  customers: InvoiceCustomerOption[]
}

export default function InvoiceForm({
  mode, invoiceId, initial, cancelHref, products, customers,
}: Props) {
  const action = mode === 'create' ? createInvoiceAction : updateInvoiceAction
  const [state, formAction, isPending] = useActionState(action, null)

  const [items, setItems] = useState<InvoiceItem[]>(initial.items)
  const [billTo, setBillTo] = useState(initial.billTo)
  const [discount, setDiscount] = useState(initial.discount)
  const [shipping, setShipping] = useState(initial.shipping)
  const [taxPercent, setTaxPercent] = useState(initial.taxPercent)
  const [paidAmount, setPaidAmount] = useState(initial.paidAmount)

  // Baris yang sengaja diketik manual. Sisanya mengikuti kecocokan judul produk,
  // supaya invoice lama tetap menampilkan produknya saat dibuka lagi.
  const [manualRows, setManualRows] = useState<Set<number>>(() => {
    const titles = new Set(products.map(p => p.title))
    return new Set(initial.items.flatMap((it, i) =>
      it.description && !titles.has(it.description) ? [i] : []))
  })

  const totals = computeInvoiceTotals({ items, discount, shipping, taxPercent, paidAmount })

  const productOptions = [
    ...products.map(p => ({ value: p.title, label: p.title })),
    { value: CUSTOM, label: 'Lainnya (ketik manual)' },
  ]

  const customerOptions = [
    ...customers.map(c => ({
      value: c.email,
      label: c.email ? `${c.name} — ${c.email}` : c.name,
    })),
    { value: CUSTOM, label: 'Lainnya (ketik manual)' },
  ]

  const patchItem = (i: number, patch: Partial<InvoiceItem>) =>
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  function pickProduct(i: number, value: string) {
    setManualRows(prev => {
      const next = new Set(prev)
      if (value === CUSTOM) next.add(i)
      else next.delete(i)
      return next
    })
    if (value === CUSTOM) {
      patchItem(i, { description: '' })
      return
    }
    const product = products.find(p => p.title === value)
    // Harga katalog hanya jadi titik awal — admin tetap bisa menimpanya.
    patchItem(i, { description: value, unitPrice: product?.unitPrice ?? 0 })
  }

  function pickCustomer(value: string) {
    if (value === CUSTOM) {
      setBillTo({ name: '', email: '', phone: '', address: '' })
      return
    }
    const c = customers.find(x => x.email === value)
    if (c) setBillTo({ name: c.name, email: c.email, phone: c.phone, address: c.address })
  }

  const removeItem = (i: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== i))
    // Penanda "manual" melekat pada indeks, jadi harus digeser saat baris dihapus.
    setManualRows(prev => {
      const next = new Set<number>()
      for (const idx of prev) {
        if (idx < i) next.add(idx)
        else if (idx > i) next.add(idx - 1)
      }
      return next
    })
  }

  // Kosong → dropdown menampilkan placeholder; ada isian tapi bukan pelanggan
  // terdaftar → dianggap manual.
  const knownCustomer = billTo.email && customers.some(c => c.email === billTo.email)
  const hasBillTo = Boolean(billTo.name || billTo.email)
  const selectedCustomer = knownCustomer ? billTo.email : hasBillTo ? CUSTOM : ''

  return (
    <form action={formAction}>
      {mode === 'edit' && <input type="hidden" name="id" value={invoiceId} />}
      {initial.orderId && <input type="hidden" name="orderId" value={initial.orderId} />}

      {state?.error && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: '1rem' }}>
          {state.error}
        </div>
      )}

      <div className="inv-form-layout">
        <div>
          {/* ── Detail invoice ── */}
          <div className="admin-form-card">
            <h3 className="admin-form-section-title">Detail Invoice</h3>
            <div className="inv-form-row-3">
              <div className="admin-form-group">
                <label htmlFor="issueDate">Tanggal Invoice</label>
                <input id="issueDate" name="issueDate" type="date" required
                  defaultValue={initial.issueDate} className="admin-form-input" />
              </div>
              <div className="admin-form-group">
                <label htmlFor="dueDate">Jatuh Tempo</label>
                <input id="dueDate" name="dueDate" type="date"
                  defaultValue={initial.dueDate} className="admin-form-input" />
              </div>
              <div className="admin-form-group">
                <label>Status</label>
                <AdminSelect
                  name="status"
                  defaultValue={initial.status}
                  options={INVOICE_STATUSES.map(s => ({ value: s, label: INVOICE_STATUS_LABELS[s] }))}
                />
              </div>
            </div>
            {initial.orderId && (
              <p className="admin-form-hint">
                Terhubung ke order <strong>{initial.orderId.slice(-6).toUpperCase()}</strong>
              </p>
            )}
          </div>

          {/* ── Ditagihkan kepada ── */}
          <div className="admin-form-card" style={{ marginTop: '1rem' }}>
            <h3 className="admin-form-section-title">Ditagihkan Kepada</h3>

            {customers.length > 0 && (
              <div className="admin-form-group">
                <label>Pilih Pelanggan</label>
                <AdminSelect
                  value={selectedCustomer}
                  onChange={pickCustomer}
                  options={customerOptions}
                  placeholder="Pilih member / pembeli sebelumnya…"
                />
                <p className="admin-form-hint">
                  Memilih pelanggan mengisi kolom di bawah — semuanya masih bisa diubah manual.
                </p>
              </div>
            )}

            <div className="inv-form-row-3">
              <div className="admin-form-group">
                <label htmlFor="billName">Nama / Perusahaan</label>
                <input id="billName" name="billName" type="text" required maxLength={120}
                  value={billTo.name} onChange={e => setBillTo(b => ({ ...b, name: e.target.value }))}
                  className="admin-form-input" placeholder="PT Contoh Jaya" />
              </div>
              <div className="admin-form-group">
                <label htmlFor="billEmail">Email</label>
                <input id="billEmail" name="billEmail" type="email" maxLength={120}
                  value={billTo.email} onChange={e => setBillTo(b => ({ ...b, email: e.target.value }))}
                  className="admin-form-input" placeholder="billing@contoh.com" />
              </div>
              <div className="admin-form-group">
                <label htmlFor="billPhone">Telepon</label>
                <input id="billPhone" name="billPhone" type="text" maxLength={40}
                  value={billTo.phone} onChange={e => setBillTo(b => ({ ...b, phone: e.target.value }))}
                  className="admin-form-input" placeholder="08xxxxxxxxxx" />
              </div>
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="billAddress">Alamat</label>
              <textarea id="billAddress" name="billAddress" rows={2} maxLength={400}
                value={billTo.address} onChange={e => setBillTo(b => ({ ...b, address: e.target.value }))}
                className="admin-form-textarea" />
            </div>
          </div>

          {/* ── Item ── */}
          <div className="admin-form-card" style={{ marginTop: '1rem' }}>
            <h3 className="admin-form-section-title">Item Tagihan</h3>

            <div className="inv-items-editor">
              <div className="inv-item-row inv-item-row--head">
                <span>Deskripsi</span>
                <span>Qty</span>
                <span>Harga Satuan</span>
                <span>Jumlah</span>
                <span />
              </div>

              {items.map((item, i) => {
                const isManual = manualRows.has(i)
                return (
                  <div className="inv-item-row" key={i}>
                    <div className="inv-item-desc">
                      <AdminSelect
                        value={isManual ? CUSTOM : item.description}
                        onChange={v => pickProduct(i, v)}
                        options={productOptions}
                        placeholder="Pilih produk…"
                      />
                      {isManual && (
                        <input
                          type="text" maxLength={200}
                          value={item.description}
                          onChange={e => patchItem(i, { description: e.target.value })}
                          className="admin-form-input"
                          placeholder="Nama produk / jasa khusus"
                          aria-label="Deskripsi manual"
                        />
                      )}
                      {/* Deskripsi selalu dikirim lewat field ini, apa pun modenya. */}
                      <input type="hidden" name="itemDescription" value={item.description} />
                    </div>
                    <input
                      name="itemQuantity" type="number" min={1} step={1}
                      value={item.quantity}
                      onFocus={selectOnFocus}
                      onChange={e => patchItem(i, { quantity: Number(e.target.value) })}
                      className="admin-form-input"
                      aria-label="Jumlah"
                    />
                    <RupiahInput
                      name="itemUnitPrice"
                      value={item.unitPrice}
                      onChange={n => patchItem(i, { unitPrice: n })}
                    />
                    <span className="inv-item-amount">
                      {formatRupiah(item.quantity * item.unitPrice)}
                    </span>
                    <button
                      type="button" className="inv-item-remove"
                      onClick={() => removeItem(i)}
                      disabled={items.length === 1}
                      aria-label="Hapus item"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>

            <button
              type="button" className="btn-admin-secondary" style={{ marginTop: '0.85rem' }}
              onClick={() => setItems(prev => [...prev, { ...EMPTY_INVOICE_ITEM }])}
            >
              + Tambah Item
            </button>
          </div>

          {/* ── Catatan ── */}
          <div className="admin-form-card" style={{ marginTop: '1rem' }}>
            <h3 className="admin-form-section-title">Catatan</h3>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <textarea name="notes" rows={3} maxLength={600}
                defaultValue={initial.notes} className="admin-form-textarea"
                placeholder="Syarat pembayaran, instruksi transfer, terima kasih…" />
            </div>
          </div>
        </div>

        {/* ── Ringkasan ── */}
        <div>
          <div className="admin-form-card inv-summary-card">
            <h3 className="admin-form-section-title">Ringkasan</h3>

            <div className="admin-form-group">
              <label htmlFor="discount">Diskon</label>
              <RupiahInput id="discount" name="discount" value={discount} onChange={setDiscount} />
            </div>
            <div className="admin-form-group">
              <label htmlFor="taxPercent">Pajak</label>
              <div className="inv-money-input inv-money-input--suffix">
                <input id="taxPercent" name="taxPercent" type="number" min={0} max={100} step={0.5}
                  value={taxPercent} onFocus={selectOnFocus}
                  onChange={e => setTaxPercent(Number(e.target.value) || 0)}
                  className="admin-form-input" />
                <span className="inv-money-suffix">%</span>
              </div>
            </div>
            <div className="admin-form-group">
              <label htmlFor="shipping">Ongkir</label>
              <RupiahInput id="shipping" name="shipping" value={shipping} onChange={setShipping} />
            </div>
            <div className="admin-form-group">
              <label htmlFor="paidAmount">Sudah Dibayar / DP</label>
              <RupiahInput id="paidAmount" name="paidAmount" value={paidAmount} onChange={setPaidAmount} />
            </div>

            <div className="inv-totals">
              <div className="inv-total-row"><span>Subtotal</span><span>{formatRupiah(totals.subtotal)}</span></div>
              {totals.discount > 0 && (
                <div className="inv-total-row"><span>Diskon</span><span>− {formatRupiah(totals.discount)}</span></div>
              )}
              {totals.tax > 0 && (
                <div className="inv-total-row"><span>Pajak {taxPercent}%</span><span>{formatRupiah(totals.tax)}</span></div>
              )}
              {totals.shipping > 0 && (
                <div className="inv-total-row"><span>Ongkir</span><span>{formatRupiah(totals.shipping)}</span></div>
              )}
              <div className="inv-total-row inv-total-row--grand">
                <span>Total</span><span>{formatRupiah(totals.total)}</span>
              </div>
              {totals.paid > 0 && (
                <>
                  <div className="inv-total-row"><span>Dibayar</span><span>− {formatRupiah(totals.paid)}</span></div>
                  <div className="inv-total-row inv-total-row--due">
                    <span>Sisa Tagihan</span><span>{formatRupiah(totals.balance)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn-admin-primary" disabled={isPending}>
                {isPending ? 'Menyimpan…' : mode === 'create' ? 'Buat Invoice' : 'Simpan Perubahan'}
              </button>
              <Link href={cancelHref} className="btn-admin-secondary">Batal</Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
