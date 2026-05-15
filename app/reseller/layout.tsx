import '@/app/admin/admin.css'
import './reseller.css'

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-overlay">{children}</div>
}
