import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentReseller } from '@/lib/auth'
import ResellerSidebar from '@/components/ResellerSidebar'
import { ResellerToastProvider } from '@/context/ResellerToastContext'
import '@/app/admin/admin.css'
import '../reseller.css'

export default async function ResellerDashboardLayout({ children }: { children: ReactNode }) {
  const reseller = await getCurrentReseller()
  if (!reseller) redirect('/reseller/login')

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
