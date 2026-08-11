import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { getInvoices } from '@/lib/invoices'
import { computeInvoiceTotals } from '@/lib/invoice-constants'
import InvoicesClient from './InvoicesClient'

export const metadata = { title: 'Invoice' }

export default async function InvoicesPage() {
  // Sidebar hanya menyembunyikan link — halaman wajib menegakkan permission sendiri,
  // kalau tidak role terbatas bisa membuka data tagihan lewat URL langsung.
  const session = await getCurrentAdmin()
  if (!session) redirect('/admin/login')
  if (!session.role?.locked && !hasPermission(session.role, 'invoices')) redirect('/admin')

  const invoices = await getInvoices()

  const stats = invoices.reduce(
    (acc, inv) => {
      const { total, balance } = computeInvoiceTotals(inv)
      acc.count++
      if (inv.status === 'paid') acc.paidValue += total
      else if (inv.status !== 'cancelled') acc.outstanding += balance
      if (inv.status === 'draft') acc.drafts++
      return acc
    },
    { count: 0, paidValue: 0, outstanding: 0, drafts: 0 },
  )

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Invoice</h1>
          <p className="admin-page-subtitle">Buat dan kelola tagihan pelanggan</p>
        </div>
        <Link href="/admin/invoices/new" className="btn-admin-primary">+ Buat Invoice</Link>
      </div>

      <div className="admin-stats-grid admin-stats-4col">
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.count}</div>
          <div className="admin-stat-label">Total Invoice</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.drafts}</div>
          <div className="admin-stat-label">Draft</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num" style={{ fontSize: '1.25rem' }}>
            Rp {stats.outstanding.toLocaleString('id-ID')}
          </div>
          <div className="admin-stat-label">Belum Dibayar</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num" style={{ fontSize: '1.25rem' }}>
            Rp {stats.paidValue.toLocaleString('id-ID')}
          </div>
          <div className="admin-stat-label">Sudah Lunas</div>
        </div>
      </div>

      <InvoicesClient invoices={invoices} />
    </>
  )
}
