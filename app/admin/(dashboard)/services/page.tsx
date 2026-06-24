import Link from 'next/link'
import { getServices } from '@/lib/data'
import { deleteService } from '@/lib/actions'
import AdminToastTrigger from '@/components/AdminToastTrigger'

type SP = Promise<{ toast?: string; toastType?: string }>

export default async function AdminServicesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const services = await getServices()

  return (
    <>
      {sp.toast && <AdminToastTrigger message={decodeURIComponent(sp.toast)} type={(sp.toastType ?? 'success') as 'success' | 'error'} />}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Services</h1>
          <p className="admin-page-subtitle">{services.length} layanan terdaftar</p>
        </div>
        <Link href="/admin/services/new" className="btn-admin-primary">
          + Tambah Service
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Nama Layanan</th>
              <th>Deskripsi</th>
              <th>Badge</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">Belum ada layanan. Tambahkan layanan pertama.</td>
              </tr>
            )}
            {services.map((s) => {
              const deleteAction = deleteService.bind(null, s.id)
              return (
                <tr key={s.id}>
                  <td style={{ fontSize: '1.1rem' }}>{s.icon}</td>
                  <td style={{ fontWeight: 500 }}>{s.title}</td>
                  <td style={{ color: '#777', maxWidth: '260px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.desc}
                    </span>
                  </td>
                  <td>
                    {s.tag ? <span className="admin-badge">{s.tag}</span> : <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link href={`/admin/services/${s.id}/edit`} className="btn-admin-edit">
                        Edit
                      </Link>
                      <form action={deleteAction}>
                        <button type="submit" className="btn-admin-danger">Hapus</button>
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
