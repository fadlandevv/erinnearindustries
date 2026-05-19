import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminById, getRoleById } from '@/lib/rbac'
import AdminSidebar from '@/components/AdminSidebar'
import { AdminToastProvider } from '@/context/AdminToastContext'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  const admin = adminId ? await getAdminById(adminId) : null
  if (!admin) redirect('/admin/login')

  const role = await getRoleById(admin.roleId)
  const permissions = role?.permissions ?? []

  return (
    <AdminToastProvider>
      <div className="admin-layout-wrapper">
        <AdminSidebar permissions={permissions} adminName={admin.username} roleName={role?.name ?? ''} isSuperAdmin={role?.locked ?? false} />
        <div className="admin-content">
          <div className="admin-main">{children}</div>
        </div>
      </div>
    </AdminToastProvider>
  )
}
