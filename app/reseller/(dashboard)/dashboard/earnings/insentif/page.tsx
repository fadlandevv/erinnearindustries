import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getResellerById, getResellerOrders } from '@/lib/resellers'
import InsentifClient from './InsentifClient'
import ExportPdfBtn from './ExportPdfBtn'

export default async function EarningsInsentifPage() {
  const jar = await cookies()
  const resellerId = jar.get('reseller-token')?.value
  const reseller = resellerId ? await getResellerById(resellerId) : null
  if (!reseller) redirect('/reseller/login')

  const orders = await getResellerOrders(reseller.id)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Insentif</h1>
          <p className="admin-page-subtitle">Level progress dan simulasi penghasilan kamu</p>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <ExportPdfBtn />
        </div>
      </div>
      <InsentifClient orders={orders} level={reseller.level} />
    </>
  )
}
