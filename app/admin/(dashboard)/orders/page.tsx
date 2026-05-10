import { getOrders } from '@/lib/orders'
import { getUsers } from '@/lib/users'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const orders = await getOrders()
  const userMap = Object.fromEntries(
    (await getUsers()).map(u => [u.email.toLowerCase(), u.id])
  )

  const stats = {
    total:   orders.length,
    paid:    orders.filter(o => o.status === 'paid').length,
    pending: orders.filter(o => o.status === 'pending').length,
    revenue: orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.totalPrice, 0),
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">Daftar semua pesanan masuk</p>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.total}</div>
          <div className="admin-stat-label">Total Pesanan</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.paid}</div>
          <div className="admin-stat-label">Dibayar</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.pending}</div>
          <div className="admin-stat-label">Menunggu</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num" style={{ fontSize: '1.25rem' }}>
            Rp {stats.revenue.toLocaleString('id-ID')}
          </div>
          <div className="admin-stat-label">Total Revenue</div>
        </div>
      </div>

      <OrdersClient orders={orders} userMap={userMap} />
    </>
  )
}
