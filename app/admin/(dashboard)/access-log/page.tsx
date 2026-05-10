import { getAccessLog } from '@/lib/access-log'
import type { AccessAction } from '@/lib/access-log'

const ACTION_LABEL: Record<AccessAction, string> = {
  login:        'Login',
  logout:       'Logout',
  login_failed: 'Login Gagal',
}

const ACTION_BADGE: Record<AccessAction, string> = {
  login:        'admin-badge admin-badge-green',
  logout:       'admin-badge admin-badge-gray',
  login_failed: 'admin-badge admin-badge-red',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default async function AccessLogPage() {
  const logs = await getAccessLog(200)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Access Log</h1>
          <p className="admin-page-subtitle">Riwayat 200 aktivitas login & logout admin terbaru.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        {logs.length === 0 ? (
          <p className="admin-empty">Belum ada log aktivitas.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Aksi</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(entry => (
                <tr key={entry.id}>
                  <td style={{ whiteSpace: 'nowrap', color: '#888', fontSize: '0.82rem' }}>
                    {formatDate(entry.createdAt)}
                  </td>
                  <td style={{ fontWeight: 600 }}>{entry.username}</td>
                  <td>
                    <span className={ACTION_BADGE[entry.action]}>
                      {ACTION_LABEL[entry.action]}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#666' }}>
                    {entry.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
