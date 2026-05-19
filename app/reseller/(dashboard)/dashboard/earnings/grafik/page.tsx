import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getResellerById, getResellerOrders } from '@/lib/resellers'
import GrafikClient from './GrafikClient'
import type { MonthStat } from './GrafikClient'

export default async function EarningsGrafikPage() {
  const jar = await cookies()
  const resellerId = jar.get('reseller-token')?.value
  const reseller = resellerId ? await getResellerById(resellerId) : null
  if (!reseller) redirect('/reseller/login')

  const orders = await getResellerOrders(reseller.id)

  const delivered    = orders.filter(o => o.status === 'delivered')
  const nonCancelled = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered')

  const totalCommission   = delivered.reduce((s, o) => s + o.commission, 0)
  const pendingCommission = nonCancelled.reduce((s, o) => s + o.commission, 0)
  const totalOmset        = delivered.reduce((s, o) => s + o.totalPrice, 0)
  const totalDelivered    = delivered.length
  const avgCommission     = totalDelivered > 0 ? Math.round(totalCommission / totalDelivered) : 0

  const now = new Date()
  const monthly: MonthStat[] = []
  for (let i = 11; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year  = d.getFullYear()
    const month = d.getMonth()
    const key   = `${year}-${String(month + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    const monthOrders    = orders.filter(o => { const od = new Date(o.createdAt); return od.getFullYear() === year && od.getMonth() === month })
    const deliveredMonth = monthOrders.filter(o => o.status === 'delivered')
    const pendingMonth   = monthOrders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered')
    monthly.push({
      key, label,
      orders:     monthOrders.length,
      omset:      deliveredMonth.reduce((s, o) => s + o.totalPrice, 0),
      commission: deliveredMonth.reduce((s, o) => s + o.commission, 0),
      pending:    pendingMonth.reduce((s, o) => s + o.commission, 0),
    })
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Grafik</h1>
          <p className="admin-page-subtitle">Statistik dan riwayat komisi penjualan</p>
        </div>
      </div>
      <GrafikClient
        orders={orders}
        level={reseller.level}
        totalCommission={totalCommission}
        pendingCommission={pendingCommission}
        totalOmset={totalOmset}
        totalDelivered={totalDelivered}
        avgCommission={avgCommission}
        monthly={monthly}
      />
    </>
  )
}
