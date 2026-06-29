import { getOrders } from '@/lib/orders'
import { getUsers } from '@/lib/users'
import { getMessagesByOrderIds } from '@/lib/order-messages'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const orders = await getOrders()
  const [userMap, allMessages] = await Promise.all([
    getUsers().then(users => Object.fromEntries(users.map(u => [u.email.toLowerCase(), u.id]))),
    getMessagesByOrderIds(orders.map(o => o.id)),
  ])

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
          <p className="admin-page-subtitle">List of all incoming orders</p>
        </div>
      </div>

      <div className="admin-stats-grid admin-stats-4col">
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.total}</div>
          <div className="admin-stat-label">Total Orders</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.paid}</div>
          <div className="admin-stat-label">Paid</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.pending}</div>
          <div className="admin-stat-label">Pending</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num" style={{ fontSize: '1.25rem' }}>
            Rp {stats.revenue.toLocaleString('id-ID')}
          </div>
          <div className="admin-stat-label">Total Revenue</div>
        </div>
      </div>

      <OrdersClient orders={orders} userMap={userMap} allMessages={allMessages} />
    </>
  )
}
