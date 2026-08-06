import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { computeRekap, getManualEntries } from '@/lib/rekap'
import RekapClient from './RekapClient'

export const metadata = { title: 'Rekap' }

export default async function RekapPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab: 'weekly' | 'monthly' | 'yearly' = tab === 'weekly' || tab === 'mingguan' ? 'weekly' : tab === 'yearly' || tab === 'tahunan' ? 'yearly' : 'monthly'

  const session = await getCurrentAdmin()
  if (!session) redirect('/admin/login')
  if (!session.role?.locked && !hasPermission(session.role, 'rekap')) redirect('/admin')
  const admin = session.admin

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
