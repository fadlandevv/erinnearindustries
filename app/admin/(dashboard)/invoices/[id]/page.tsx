import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { getInvoiceById } from '@/lib/invoices'
import {
  computeInvoiceTotals, formatInvoiceDate, formatRupiah, isOverdue,
  INVOICE_ISSUER, INVOICE_STATUSES, INVOICE_STATUS_LABELS,
} from '@/lib/invoice-constants'
import { updateInvoiceStatusAction } from '@/lib/actions'
import AdminSelect from '@/components/AdminSelect'
import PrintButton from '../PrintButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoiceById(id)
  return { title: invoice ? invoice.number : 'Invoice' }
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentAdmin()
  if (!session) redirect('/admin/login')
  if (!session.role?.locked && !hasPermission(session.role, 'invoices')) redirect('/admin')

  const { id } = await params
  const invoice = await getInvoiceById(id)
  if (!invoice) notFound()

  const totals = computeInvoiceTotals(invoice)
  const overdue = isOverdue(invoice)

  return (
    <>
      <div className="admin-page-header inv-no-print">
        <div>
          <h1 className="admin-page-title">{invoice.number}</h1>
          <p className="admin-page-subtitle">
            {INVOICE_STATUS_LABELS[invoice.status]}
            {invoice.createdBy && ` · dibuat oleh ${invoice.createdBy}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link href="/admin/invoices" className="btn-admin-secondary">← Kembali</Link>
          <Link href={`/admin/invoices/${invoice.id}/edit`} className="btn-admin-secondary">Edit</Link>
          <PrintButton />
        </div>
      </div>

      <div className="inv-status-bar inv-no-print">
        <form action={updateInvoiceStatusAction} className="inv-status-form">
          <input type="hidden" name="id" value={invoice.id} />
          <span className="inv-status-form-label">Ubah status</span>
          <div className="inv-status-select">
            <AdminSelect
              name="status"
              defaultValue={invoice.status}
              options={INVOICE_STATUSES.map(s => ({ value: s, label: INVOICE_STATUS_LABELS[s] }))}
            />
          </div>
          <button type="submit" className="btn-admin-primary">Simpan</button>
        </form>
        {invoice.orderId && (
          <Link href="/admin/orders" className="inv-order-link">
            Order #{invoice.orderId.slice(-6).toUpperCase()}
          </Link>
        )}
      </div>

      {/* ── Dokumen yang tercetak ── */}
      <div className="inv-doc">
        <header className="inv-doc-head">
          <div>
            <h2 className="inv-doc-brand">{INVOICE_ISSUER.name}</h2>
            <p className="inv-doc-tagline">{INVOICE_ISSUER.tagline}</p>
            <p className="inv-doc-issuer-meta">
              {INVOICE_ISSUER.address}<br />
              {INVOICE_ISSUER.email} · {INVOICE_ISSUER.phone}
            </p>
          </div>
          <div className="inv-doc-head-right">
            <p className="inv-doc-label">Invoice</p>
            <p className="inv-doc-number">{invoice.number}</p>
            {invoice.status === 'paid' && <span className="inv-stamp inv-stamp--paid">LUNAS</span>}
            {invoice.status === 'cancelled' && <span className="inv-stamp inv-stamp--cancelled">DIBATALKAN</span>}
            {overdue && <span className="inv-stamp inv-stamp--overdue">LEWAT TEMPO</span>}
          </div>
        </header>

        <section className="inv-doc-meta">
          <div>
            <p className="inv-doc-meta-label">Ditagihkan Kepada</p>
            <p className="inv-doc-billto-name">{invoice.billTo.name}</p>
            {invoice.billTo.address && <p className="inv-doc-billto-line">{invoice.billTo.address}</p>}
            {invoice.billTo.email && <p className="inv-doc-billto-line">{invoice.billTo.email}</p>}
            {invoice.billTo.phone && <p className="inv-doc-billto-line">{invoice.billTo.phone}</p>}
          </div>
          <div className="inv-doc-dates">
            <div className="inv-doc-date-row">
              <span className="inv-doc-meta-label">Tanggal Invoice</span>
              <span>{formatInvoiceDate(invoice.issueDate)}</span>
            </div>
            <div className="inv-doc-date-row">
              <span className="inv-doc-meta-label">Jatuh Tempo</span>
              <span>{invoice.dueDate ? formatInvoiceDate(invoice.dueDate) : '—'}</span>
            </div>
            {invoice.orderId && (
              <div className="inv-doc-date-row">
                <span className="inv-doc-meta-label">No. Order</span>
                <span>{invoice.orderId.slice(-6).toUpperCase()}</span>
              </div>
            )}
          </div>
        </section>

        <table className="inv-doc-table">
          <thead>
            <tr>
              <th style={{ width: '48px' }}>No</th>
              <th>Deskripsi</th>
              <th style={{ textAlign: 'right', width: '70px' }}>Qty</th>
              <th style={{ textAlign: 'right', width: '140px' }}>Harga</th>
              <th style={{ textAlign: 'right', width: '150px' }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.description}</td>
                <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(item.unitPrice)}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="inv-doc-summary">
          <div className="inv-doc-notes">
            {invoice.notes && (
              <>
                <p className="inv-doc-meta-label">Catatan</p>
                <p className="inv-doc-notes-body">{invoice.notes}</p>
              </>
            )}
            <p className="inv-doc-meta-label" style={{ marginTop: '1rem' }}>Pembayaran</p>
            <p className="inv-doc-notes-body">
              {INVOICE_ISSUER.bankName} — {INVOICE_ISSUER.bankAccount}<br />
              a.n. {INVOICE_ISSUER.bankHolder}
            </p>
          </div>

          <div className="inv-doc-totals">
            <div className="inv-total-row"><span>Subtotal</span><span>{formatRupiah(totals.subtotal)}</span></div>
            {totals.discount > 0 && (
              <div className="inv-total-row"><span>Diskon</span><span>− {formatRupiah(totals.discount)}</span></div>
            )}
            {totals.tax > 0 && (
              <div className="inv-total-row"><span>Pajak {invoice.taxPercent}%</span><span>{formatRupiah(totals.tax)}</span></div>
            )}
            {totals.shipping > 0 && (
              <div className="inv-total-row"><span>Ongkir</span><span>{formatRupiah(totals.shipping)}</span></div>
            )}
            <div className="inv-total-row inv-total-row--grand">
              <span>Total</span><span>{formatRupiah(totals.total)}</span>
            </div>
            {totals.paid > 0 && (
              <>
                <div className="inv-total-row"><span>Sudah Dibayar</span><span>− {formatRupiah(totals.paid)}</span></div>
                <div className="inv-total-row inv-total-row--due">
                  <span>Sisa Tagihan</span><span>{formatRupiah(totals.balance)}</span>
                </div>
              </>
            )}
          </div>
        </section>

        <footer className="inv-doc-foot">
          Terima kasih atas kepercayaan Anda kepada {INVOICE_ISSUER.name}.
        </footer>
      </div>
    </>
  )
}
