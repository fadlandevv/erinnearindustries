import Link from 'next/link'
import { getUsers } from '@/lib/users'
import { getOrdersByEmail } from '@/lib/orders'
import DeleteMemberBtn from './DeleteMemberBtn'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function MembersPage() {
  const users = (await getUsers()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const orderCounts = await Promise.all(
    users.map(u => getOrdersByEmail(u.email).then(o => o.length))
  )

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const newThisMonth = users.filter(u => new Date(u.createdAt) >= startOfMonth).length

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Account Member</h1>
          <p className="admin-page-subtitle">Daftar member terdaftar</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(2,1fr)' }}>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Member</p>
          <p className="admin-stat-num">{users.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Baru Bulan Ini</p>
          <p className="admin-stat-num">{newThisMonth}</p>
        </div>
      </div>

      {/* Table */}
      <div className="admin-form-card">
        {users.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            Belum ada member terdaftar.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Total Pesanan</th>
                  <th>Tanggal Daftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                    <tr key={user.id}>
                      <td style={{ color: '#aaa', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td>
                        <Link
                          href={`/admin/members/${user.id}`}
                          style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit' }}
                          className="admin-table-link"
                        >
                          {user.name}
                        </Link>
                        <div style={{ fontSize: '0.72rem', color: '#aaa', fontFamily: 'monospace' }}>
                          #{user.id.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td style={{ color: '#666', fontSize: '0.875rem' }}>{user.email}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="admin-badge">{orderCounts[idx]} pesanan</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap' }}>
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <Link
                            href={`/admin/members/${user.id}`}
                            className="btn-admin-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                          >
                            Detail
                          </Link>
                          <DeleteMemberBtn id={user.id} name={user.name} />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
