import Link from 'next/link'
import { getServices } from '@/lib/data'
import { deleteService } from '@/lib/actions'
export default async function AdminServicesPage() {
  const services = await getServices()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Services</h1>
          <p className="admin-page-subtitle">{services.length} services registered</p>
        </div>
        <Link href="/admin/services/new" className="btn-admin-primary">
          + Add Service
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-empty">No services yet. Add your first service.</td>
              </tr>
            )}
            {services.map((s) => {
              const deleteAction = deleteService.bind(null, s.id)
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.title}</td>
                  <td style={{ color: '#777', maxWidth: '260px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.desc}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link href={`/admin/services/${s.id}/edit`} className="btn-admin-edit">
                        Edit
                      </Link>
                      <form action={deleteAction}>
                        <button type="submit" className="btn-admin-danger">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
