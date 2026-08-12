import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { getOrderById } from '@/lib/orders'
import { getProducts } from '@/lib/data'
import { getInvoiceCustomerOptions } from '@/lib/invoices'
import { joinAddress, toProductOptions, type InvoiceDraft } from '@/lib/invoice-constants'
import InvoiceForm from '../InvoiceForm'

export const metadata = { title: 'Buat Invoice' }

const todayYmd = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const plusDaysYmd = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const session = await getCurrentAdmin()
  if (!session) redirect('/admin/login')
  if (!session.role?.locked && !hasPermission(session.role, 'invoices')) redirect('/admin')

  const { orderId } = await searchParams

  const [catalog, customers] = await Promise.all([getProducts(), getInvoiceCustomerOptions()])
  const products = toProductOptions(catalog)

  const draft: InvoiceDraft = {
    issueDate: todayYmd(),
    dueDate: plusDaysYmd(14),
    status: 'draft',
    billTo: { name: '', email: '', phone: '', address: '' },
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    shipping: 0,
    taxPercent: 0,
    paidAmount: 0,
    notes: '',
  }

  // Dibuka dari halaman Orders → isi otomatis dari order tersebut.
  const order = orderId ? await getOrderById(orderId) : undefined
  if (order) {
    draft.orderId = order.id
    draft.billTo = {
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      address: joinAddress(order.customer.address, order.customer.city, order.customer.postalCode),
    }
    draft.items = order.items.map(it => ({
      description: `${it.title}${it.size ? ` — Size ${it.size}` : ''}`,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    }))
    draft.shipping = order.customer.kurir?.price ?? 0
    // Order yang sudah dibayar Midtrans → invoice langsung ditandai lunas.
    if (order.status !== 'pending' && order.status !== 'failed' && order.status !== 'expired') {
      draft.status = 'paid'
      draft.paidAmount = order.totalPrice
    }
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Buat Invoice</h1>
          <p className="admin-page-subtitle">
            {order
              ? `Dari order ${order.id.slice(-6).toUpperCase()} — ${order.customer.name}`
              : 'Nomor invoice dibuat otomatis saat disimpan'}
          </p>
        </div>
        <Link href="/admin/invoices" className="btn-admin-secondary">← Kembali</Link>
      </div>

      {orderId && !order && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: '1rem' }}>
          Order {orderId} tidak ditemukan — form dimulai dari kosong.
        </div>
      )}

      <InvoiceForm
        mode="create"
        initial={draft}
        cancelHref="/admin/invoices"
        products={products}
        customers={customers}
      />
    </>
  )
}
