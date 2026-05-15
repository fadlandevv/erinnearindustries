import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getResellerById } from '@/lib/resellers'
import ResellerSidebar from '@/components/ResellerSidebar'
import { ResellerToastProvider } from '@/context/ResellerToastContext'
import '@/app/admin/admin.css'
import '../reseller.css'

export default async function ResellerDashboardLayout({ children }: { children: ReactNode }) {
  const jar = await cookies()
  const resellerId = jar.get('reseller-token')?.value
  const reseller = resellerId ? await getResellerById(resellerId) : null
  if (!reseller || !reseller.active) redirect('/reseller/login')

  return (
    <ResellerToastProvider>
      <div className="admin-overlay">
        <div className="admin-layout-wrapper">
          <ResellerSidebar resellerName={reseller.name} level={reseller.level} />
          <div className="admin-content">
            <div className="admin-main">{children}</div>
          </div>
        </div>
      </div>
    </ResellerToastProvider>
  )
}
