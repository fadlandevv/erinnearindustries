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
  const initialTab = (tab === 'mingguan' || tab === 'tahunan') ? tab : 'bulanan'

  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  const admin = adminId ? getAdminById(adminId) : null

  const data = computeRekap()
  const entries = getManualEntries()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Rekap Pemasukan</h1>
          <p className="admin-page-subtitle">Ringkasan dari web, marketplace, dan offline</p>
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
