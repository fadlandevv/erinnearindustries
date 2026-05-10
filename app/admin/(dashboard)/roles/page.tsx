import { getRoles, getAdmins } from '@/lib/rbac'
import RolesClient from './RolesClient'

export default async function RolesPage() {
  const roles = await getRoles()
  const admins = await getAdmins()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Role Access</h1>
          <p className="admin-page-subtitle">Kelola role dan hak akses halaman CMS</p>
        </div>
      </div>
      <RolesClient roles={roles} admins={admins} />
    </>
  )
}
