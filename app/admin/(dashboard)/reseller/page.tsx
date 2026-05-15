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
          <h1 className="admin-page-title">Manajemen Reseller</h1>
          <p className="admin-page-subtitle">Kelola akun reseller dan lihat/update status pesanan mereka.</p>
        </div>
      </div>

      <ResellerAdminClient resellers={resellers} orders={orders} />
    </>
  )
}
