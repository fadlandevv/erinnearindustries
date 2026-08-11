'use client'
import { useState, useActionState } from 'react'
import Link from 'next/link'
import { createInvoiceAction, updateInvoiceAction } from '@/lib/actions'
import {
  computeInvoiceTotals, formatRupiah,
  INVOICE_STATUSES, INVOICE_STATUS_LABELS,
  type Invoice, type InvoiceItem, type InvoiceStatus,
} from '@/lib/invoice-constants'

export type InvoiceDraft = {
  orderId?: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  billTo: { name: string; email: string; phone: string; address: string }
  items: InvoiceItem[]
  discount: number
  shipping: number
  taxPercent: number
  paidAmount: number
  notes: string
}

const EMPTY_ITEM: InvoiceItem = { description: '', quantity: 1, unitPrice: 0 }

export function draftFromInvoice(inv: Invoice): InvoiceDraft {
  return {
    orderId: inv.orderId,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate ?? '',
    status: inv.status,
    billTo: inv.billTo,
    items: inv.items.length ? inv.items : [{ ...EMPTY_ITEM }],
    discount: inv.discount,
    shipping: inv.shipping,
    taxPercent: inv.taxPercent,
    paidAmount: inv.paidAmount,
    notes: inv.notes ?? '',
  }
}

type Props = {
  mode: 'create' | 'edit'
  invoiceId?: string
  initial: InvoiceDraft
  cancelHref: string
}

export default function InvoiceForm({ mode, invoiceId, initial, cancelHref }: Props) {
  const action = mode === 'create' ? createInvoiceAction : updateInvoiceAction
  const [state, formAction, isPending] = useActionState(action, null)

  const [items, setItems] = useState<InvoiceItem[]>(initial.items)
  const [discount, setDiscount] = useState(initial.discount)
  const [shipping, setShipping] = useState(initial.shipping)
  const [taxPercent, setTaxPercent] = useState(initial.taxPercent)
  const [paidAmount, setPaidAmount] = useState(initial.paidAmount)

  const totals = computeInvoiceTotals({ items, discount, shipping, taxPercent, paidAmount })

  const patchItem = (i: number, patch: Partial<InvoiceItem>) =>
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

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
            <div className="admin-form-grid">
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
            </div>
            <div className="admin-form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={initial.status} className="admin-form-select">
                {INVOICE_STATUSES.map(s => (
                  <option key={s} value={s}>{INVOICE_STATUS_LABELS[s]}</option>
                ))}
              </select>
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
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="billName">Nama / Perusahaan</label>
                <input id="billName" name="billName" type="text" required maxLength={120}
                  defaultValue={initial.billTo.name} className="admin-form-input" placeholder="PT Contoh Jaya" />
              </div>
              <div className="admin-form-group">
                <label htmlFor="billEmail">Email</label>
                <input id="billEmail" name="billEmail" type="email" maxLength={120}
                  defaultValue={initial.billTo.email} className="admin-form-input" placeholder="billing@contoh.com" />
              </div>
            </div>
            <div className="admin-form-group">
              <label htmlFor="billPhone">Telepon</label>
              <input id="billPhone" name="billPhone" type="text" maxLength={40}
                defaultValue={initial.billTo.phone} className="admin-form-input" placeholder="08xxxxxxxxxx" />
            </div>
            <div className="admin-form-group">
              <label htmlFor="billAddress">Alamat</label>
              <textarea id="billAddress" name="billAddress" rows={3} maxLength={400}
                defaultValue={initial.billTo.address} className="admin-form-textarea" />
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

              {items.map((item, i) => (
                <div className="inv-item-row" key={i}>
                  <input
                    name="itemDescription" type="text" maxLength={200}
                    value={item.description}
                    onChange={e => patchItem(i, { description: e.target.value })}
                    className="admin-form-input" placeholder="Kaos custom cotton combed 30s"
                  />
                  <input
                    name="itemQuantity" type="number" min={1} step={1}
                    value={item.quantity}
                    onChange={e => patchItem(i, { quantity: Number(e.target.value) })}
                    className="admin-form-input"
                  />
                  <input
                    name="itemUnitPrice" type="number" min={0} step={100}
                    value={item.unitPrice}
                    onChange={e => patchItem(i, { unitPrice: Number(e.target.value) })}
                    className="admin-form-input"
                  />
                  <span className="inv-item-amount">
                    {formatRupiah(item.quantity * item.unitPrice)}
                  </span>
                  <button
                    type="button" className="inv-item-remove"
                    onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                    disabled={items.length === 1}
                    aria-label="Hapus item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button" className="btn-admin-secondary" style={{ marginTop: '0.85rem' }}
              onClick={() => setItems(prev => [...prev, { ...EMPTY_ITEM }])}
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
              <label htmlFor="discount">Diskon (Rp)</label>
              <input id="discount" name="discount" type="number" min={0} step={100}
                value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)}
                className="admin-form-input" />
            </div>
            <div className="admin-form-group">
              <label htmlFor="taxPercent">Pajak (%)</label>
              <input id="taxPercent" name="taxPercent" type="number" min={0} max={100} step={0.5}
                value={taxPercent} onChange={e => setTaxPercent(Number(e.target.value) || 0)}
                className="admin-form-input" />
            </div>
            <div className="admin-form-group">
              <label htmlFor="shipping">Ongkir (Rp)</label>
              <input id="shipping" name="shipping" type="number" min={0} step={100}
                value={shipping} onChange={e => setShipping(Number(e.target.value) || 0)}
                className="admin-form-input" />
            </div>
            <div className="admin-form-group">
              <label htmlFor="paidAmount">Sudah Dibayar / DP (Rp)</label>
              <input id="paidAmount" name="paidAmount" type="number" min={0} step={100}
                value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value) || 0)}
                className="admin-form-input" />
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
