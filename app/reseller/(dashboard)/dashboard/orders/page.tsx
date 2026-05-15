import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getResellerById, getResellerOrders } from '@/lib/resellers'
import { getMessagesByOrderIds } from '@/lib/order-messages'
import ResellerOrdersClient from './ResellerOrdersClient'

export default async function ResellerOrdersPage() {
  const jar = await cookies()
  const resellerId = jar.get('reseller-token')?.value
  const reseller = resellerId ? await getResellerById(resellerId) : null
  if (!reseller) redirect('/reseller/login')

  const orders = await getResellerOrders(reseller.id)
  const initialMessages = await getMessagesByOrderIds(orders.map(o => o.id))

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pesanan</h1>
          <p className="admin-page-subtitle">{orders.length} total pesanan</p>
        </div>
        <Link href="/reseller/dashboard/orders/new" className="btn-admin-primary" style={{ background: '#16a34a' }}>
          + Buat Pesanan Baru
        </Link>
      </div>

      <ResellerOrdersClient orders={orders} initialMessages={initialMessages} />
    </>
  )
}
