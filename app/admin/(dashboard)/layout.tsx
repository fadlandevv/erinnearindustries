import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/AdminSidebar'
import { AdminToastProvider } from '@/context/AdminToastContext'
import AdminFlash from '@/components/AdminFlash'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentAdmin()
  if (!session) redirect('/admin/login')

  const { admin, role } = session
  const permissions = role?.permissions ?? []

  return (
    <AdminToastProvider>
      <AdminFlash />
      <div className="admin-layout-wrapper">
        <AdminSidebar permissions={permissions} adminName={admin.username} roleName={role?.name ?? ''} isSuperAdmin={role?.locked ?? false} />
        <div className="admin-content">
          <div className="admin-main">{children}</div>
        </div>
      </div>
    </AdminToastProvider>
  )
}
