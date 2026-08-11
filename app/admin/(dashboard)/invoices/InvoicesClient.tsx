'use client'
import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteInvoiceAction } from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'
import {
  computeInvoiceTotals, formatInvoiceDate, formatRupiah, isOverdue,
  INVOICE_STATUS_LABELS, type Invoice, type InvoiceStatus,
} from '@/lib/invoice-constants'

const statusBadge: Record<InvoiceStatus, string> = {
  draft: 'admin-badge-gray',
  sent: 'inv-badge-sent',
  paid: 'admin-badge-green',
  cancelled: 'admin-badge-red',
}

export default function InvoicesClient({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | InvoiceStatus>('all')
  const [pending, startTransition] = useTransition()
  const { toast } = useAdminToast()
  const router = useRouter()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return invoices.filter(inv => {
      if (status !== 'all' && inv.status !== status) return false
      if (!q) return true
      return (
        inv.number.toLowerCase().includes(q) ||
        inv.billTo.name.toLowerCase().includes(q) ||
        (inv.billTo.email ?? '').toLowerCase().includes(q)
      )
    })
  }, [invoices, search, status])

  function handleDelete(inv: Invoice) {
    if (!confirm(`Hapus invoice ${inv.number}? Tindakan ini tidak bisa dibatalkan.`)) return
    startTransition(async () => {
      const res = await deleteInvoiceAction(inv.id)
      if (res.error) toast(res.error, 'error')
      else { toast(`Invoice ${inv.number} dihapus.`); router.refresh() }
    })
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nomor invoice atau nama…"
          className="admin-search-input" style={{ flex: '1 1 220px', minWidth: 0 }}
        />
        <select
          value={status} onChange={e => setStatus(e.target.value as typeof status)}
          className="admin-select-inline"
        >
          <option value="all">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Terkirim</option>
          <option value="paid">Lunas</option>
          <option value="cancelled">Batal</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">
          {invoices.length === 0 ? 'Belum ada invoice' : 'Tidak ada invoice yang cocok'}
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Tanggal</th>
                <th>Ditagihkan Kepada</th>
                <th>Jatuh Tempo</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Sisa</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const totals = computeInvoiceTotals(inv)
                const overdue = isOverdue(inv)
                return (
                  <tr key={inv.id}>
                    <td>
                      <Link href={`/admin/invoices/${inv.id}`} className="admin-table-link"
                        style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit' }}>
                        {inv.number}
                      </Link>
                    </td>
                    <td>{formatInvoiceDate(inv.issueDate)}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{inv.billTo.name}</div>
                      {inv.billTo.email && (
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{inv.billTo.email}</div>
                      )}
                    </td>
                    <td>
                      {inv.dueDate ? formatInvoiceDate(inv.dueDate) : '—'}
                      {overdue && <span className="inv-overdue-tag">Lewat tempo</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(totals.total)}</td>
                    <td style={{ textAlign: 'right', fontWeight: totals.balance > 0 ? 600 : 400 }}>
                      {formatRupiah(totals.balance)}
                    </td>
                    <td>
                      <span className={`admin-badge ${statusBadge[inv.status]}`}>
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <Link href={`/admin/invoices/${inv.id}`} className="btn-admin-edit">Lihat</Link>
                        <button type="button" className="btn-admin-danger"
                          onClick={() => handleDelete(inv)} disabled={pending}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
