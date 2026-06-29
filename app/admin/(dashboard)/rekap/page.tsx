import { cookies } from 'next/headers'
import { getAdminById, getRoleById } from '@/lib/rbac'
import { computeRekap, getManualEntries } from '@/lib/rekap'
import RekapClient from './RekapClient'

export default async function RekapPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab: 'weekly' | 'monthly' | 'yearly' = tab === 'weekly' || tab === 'mingguan' ? 'weekly' : tab === 'yearly' || tab === 'tahunan' ? 'yearly' : 'monthly'

  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  const admin = adminId ? await getAdminById(adminId) : null

  const data = await computeRekap()
  const entries = await getManualEntries()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Revenue Recap</h1>
          <p className="admin-page-subtitle">Summary from web, marketplace, and offline</p>
        </div>
      </div>

      <RekapClient
        mingguan={data.mingguan}
        bulanan={data.bulanan}
        tahunan={data.tahunan}
        entries={entries}
        initialTab={initialTab}
        adminName={admin?.username ?? 'Admin'}
      />
    </>
  )
}
