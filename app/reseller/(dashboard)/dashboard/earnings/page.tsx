import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

export default async function ResellerEarningsPage() {
  const jar = await cookies()
  const resellerId = jar.get('reseller-token')?.value
  const reseller = resellerId ? await getResellerById(resellerId) : null
  if (!reseller) redirect('/reseller/login')

  const orders = await getResellerOrders(reseller.id)
  const delivered = orders.filter(o => o.status === 'delivered')

  const totalCommission = delivered.reduce((s, o) => s + o.commission, 0)
  const totalDelivered = delivered.length
  const avgCommission = totalDelivered > 0 ? Math.round(totalCommission / totalDelivered) : 0

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Penghasilan</h1>
          <p className="admin-page-subtitle">Riwayat komisi dari semua pesanan yang selesai</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-num" style={{ fontSize: '1.3rem', color: '#16a34a' }}>{IDR(totalCommission)}</div>
          <div className="admin-stat-label">Total Komisi Terkonfirmasi</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{totalDelivered}</div>
          <div className="admin-stat-label">Pesanan Selesai</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num" style={{ fontSize: '1.3rem' }}>{avgCommission > 0 ? IDR(avgCommission) : '—'}</div>
          <div className="admin-stat-label">Rata-rata per Order</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        {orders.length === 0 ? (
          <div className="admin-empty">Belum ada riwayat pesanan.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Pesanan</th>
                <th>Komisi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(order.createdAt)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', color: '#555' }}>
                        {item.title} ({item.size}) ×{item.qty}
                      </div>
                    ))}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{IDR(order.totalPrice)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {order.commission > 0 ? (
                      <span style={{ fontWeight: 700, color: '#16a34a' }}>{IDR(order.commission)}</span>
                    ) : (
                      <span style={{ color: '#bbb' }}>—</span>
                    )}
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
