import { getResellers, getAllResellerOrders } from '@/lib/resellers'
import ResellerAdminClient from './ResellerAdminClient'

export default async function AdminResellerPage() {
  const [resellers, orders] = await Promise.all([
    getResellers(),
    getAllResellerOrders(),
  ])

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reseller Management</h1>
          <p className="admin-page-subtitle">Manage reseller accounts and view/update their order status.</p>
        </div>
      </div>

      <ResellerAdminClient resellers={resellers} orders={orders} />
    </>
  )
}
