import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { getInvoiceById, getInvoiceCustomerOptions } from '@/lib/invoices'
import { getProducts } from '@/lib/data'
import { draftFromInvoice, toProductOptions } from '@/lib/invoice-constants'
import InvoiceForm from '../../InvoiceForm'

export const metadata = { title: 'Edit Invoice' }

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentAdmin()
  if (!session) redirect('/admin/login')
  if (!session.role?.locked && !hasPermission(session.role, 'invoices')) redirect('/admin')

  const { id } = await params
  const invoice = await getInvoiceById(id)
  if (!invoice) notFound()

  const [catalog, customers] = await Promise.all([getProducts(), getInvoiceCustomerOptions()])
  const products = toProductOptions(catalog)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit {invoice.number}</h1>
          <p className="admin-page-subtitle">Nomor invoice tidak berubah saat disimpan</p>
        </div>
        <Link href={`/admin/invoices/${invoice.id}`} className="btn-admin-secondary">← Kembali</Link>
      </div>

      <InvoiceForm
        mode="edit"
        invoiceId={invoice.id}
        initial={draftFromInvoice(invoice)}
        cancelHref={`/admin/invoices/${invoice.id}`}
        products={products}
        customers={customers}
      />
    </>
  )
}
