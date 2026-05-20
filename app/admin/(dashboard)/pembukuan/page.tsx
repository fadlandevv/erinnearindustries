import { cookies } from 'next/headers'
import { getAdminById } from '@/lib/rbac'
import { getPembukuanByMonth, getPembukuanByYear } from '@/lib/pembukuan'
import PembukuanClient from './PembukuanClient'

export default async function PembukuanPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; mode?: string }>
}) {
  const { year: yearParam, month: monthParam, mode: modeParam } = await searchParams
  const now = new Date()
  const year = parseInt(yearParam ?? '') || now.getFullYear()
  const month = parseInt(monthParam ?? '') || now.getMonth() + 1
  const mode = modeParam === 'yearly' ? 'yearly' : 'monthly'

  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  const admin = adminId ? await getAdminById(adminId) : null

  const entries = mode === 'yearly'
    ? await getPembukuanByYear(year)
    : await getPembukuanByMonth(year, month)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pembukuan</h1>
          <p className="admin-page-subtitle">Pencatatan pemasukan & pengeluaran per bulan</p>
        </div>
      </div>

      <PembukuanClient
        entries={entries}
        year={year}
        month={month}
        mode={mode}
        adminName={admin?.username ?? 'Admin'}
      />
    </>
  )
}
