import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getResellerById, getResellerOrders } from '@/lib/resellers'

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Terkonfirmasi',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
}

export default async function ResellerOrdersPage() {
  const jar = await cookies()
  const resellerId = jar.get('reseller-token')?.value
  const reseller = resellerId ? await getResellerById(resellerId) : null
  if (!reseller) redirect('/reseller/login')

  const orders = await getResellerOrders(reseller.id)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pesanan</h1>
          <p className="admin-page-subtitle">{orders.length} total pesanan</p>
        </div>
        <Link href="/reseller/orders/new" className="btn-admin-primary" style={{ background: '#16a34a' }}>
          + Buat Pesanan Baru
        </Link>
      </div>

      <div className="admin-table-wrap">
        {orders.length === 0 ? (
          <div className="admin-empty">
            Belum ada pesanan.{' '}
            <Link href="/reseller/orders/new" style={{ color: '#16a34a' }}>Buat pesanan pertama →</Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Komisi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(order.createdAt)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                    {order.customerPhone && (
                      <div style={{ fontSize: '0.78rem', color: '#888' }}>{order.customerPhone}</div>
                    )}
                  </td>
                  <td>{order.items.length} item</td>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{IDR(order.totalPrice)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {order.commission > 0 ? (
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>{IDR(order.commission)}</span>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`admin-badge rs-order-status-${order.status}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
