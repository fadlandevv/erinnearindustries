import { getCurrentUserEmail } from '@/lib/auth'
import { getUserByEmail } from '@/lib/users'
import { getOrdersByEmail } from '@/lib/orders'
import { getMessagesByOrderIds, type OrderMessage } from '@/lib/order-messages'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import OrderList from '@/components/OrderList'

export const metadata = { title: 'Riwayat Pesanan' }
export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  // Middleware hanya gerbang pertama — halaman tetap wajib memverifikasi sendiri.
  const email = await getCurrentUserEmail()
  if (!email) redirect('/login?callbackUrl=/orders')
  const user = await getUserByEmail(email)
  const orders = await getOrdersByEmail(email)

  const allMessages = await getMessagesByOrderIds(orders.map(o => o.id))
  const messagesByOrder: Record<string, OrderMessage[]> = {}
  for (const msg of allMessages) {
    if (!messagesByOrder[msg.orderId]) messagesByOrder[msg.orderId] = []
    messagesByOrder[msg.orderId].push(msg)
  }

  return (
    <section className="orders-section">
      <div className="container">
        <div className="orders-page-header">
          <div>
            <h1 className="orders-page-title">Riwayat Pesanan</h1>
            <p className="orders-page-sub">
              Halo, <strong>{user?.name ?? email}</strong> — {orders.length} pesanan ditemukan
            </p>
          </div>
          <Link href="/profile" className="btn-outline oh-logout-btn">← Kembali ke Profil</Link>
        </div>

        <OrderList orders={orders} messagesByOrder={messagesByOrder} />
      </div>
    </section>
  )
}
