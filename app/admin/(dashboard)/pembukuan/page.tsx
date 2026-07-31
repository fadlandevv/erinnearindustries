import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
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

  // Sidebar hanya menyembunyikan link — halaman wajib menegakkan permission sendiri,
  // kalau tidak role terbatas bisa membuka data keuangan lewat URL langsung.
  const session = await getCurrentAdmin()
  if (!session) redirect('/admin/login')
  if (!session.role?.locked && !hasPermission(session.role, 'pembukuan')) redirect('/admin')
  const admin = session.admin

  const entries = mode === 'yearly'
    ? await getPembukuanByYear(year)
    : await getPembukuanByMonth(year, month)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Bookkeeping</h1>
          <p className="admin-page-subtitle">Record income &amp; expenses per month</p>
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
