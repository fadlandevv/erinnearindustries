import { cookies } from 'next/headers'
import { getUserByEmail } from '@/lib/users'
import { getOrdersByEmail } from '@/lib/orders'
import Link from 'next/link'
import OrderList from '@/components/OrderList'

export const metadata = { title: 'Riwayat Pesanan — Erinnear Industries' }
export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const jar = await cookies()
  const email = jar.get('user-session')?.value ?? ''
  const user = getUserByEmail(email)
  const orders = getOrdersByEmail(email)

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

        <OrderList orders={orders} />
      </div>
    </section>
  )
}
