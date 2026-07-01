'use client'
import { useState, useMemo } from 'react'
import type { AccessLogEntry, AccessAction } from '@/lib/access-log'

const ACTION_LABEL: Record<AccessAction, string> = {
  login:        'Login',
  logout:       'Logout',
  login_failed: 'Login Failed',
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

function toCSV(rows: AccessLogEntry[]): string {
  const header = ['Time', 'Admin', 'Action', 'IP Address']
  const lines = rows.map(r => [
    formatDate(r.createdAt),
    r.username,
    ACTION_LABEL[r.action],
    r.ip,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  return [header.join(','), ...lines].join('\r\n')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AccessLogClient({ logs }: { logs: AccessLogEntry[] }) {
  const [search, setSearch]           = useState('')
  const [filterAction, setFilterAction] = useState<AccessAction | 'all'>('all')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')

  const admins = useMemo(() => {
    const set = new Set(logs.map(l => l.username))
    return Array.from(set).sort()
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter(entry => {
      if (search && !entry.username.toLowerCase().includes(search.toLowerCase())) return false
      if (filterAction !== 'all' && entry.action !== filterAction) return false
      if (dateFrom) {
        const from = new Date(dateFrom)
        from.setHours(0, 0, 0, 0)
        if (new Date(entry.createdAt) < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (new Date(entry.createdAt) > to) return false
      }
      return true
    })
  }, [logs, search, filterAction, dateFrom, dateTo])

  function handleExport() {
    const date = new Date().toISOString().slice(0, 10)
    downloadCSV(toCSV(filtered), `access-log-${date}.csv`)
  }

  function clearFilters() {
    setSearch('')
    setFilterAction('all')
    setDateFrom('')
    setDateTo('')
  }

  const isFiltered = search || filterAction !== 'all' || dateFrom || dateTo

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Access Log</h1>
          <p className="admin-page-subtitle">
            {filtered.length} dari {logs.length} aktivitas login &amp; logout admin
          </p>
        </div>
        <button
          type="button"
          className="btn-admin-secondary"
          onClick={handleExport}
          disabled={filtered.length === 0}
          style={{ gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3 3 3-3M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="al-filter-bar">
        <div className="al-filter-group">
          <label className="al-filter-label">Admin</label>
          <input
            type="text"
            className="admin-form-input al-filter-input"
            placeholder="Cari username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            list="al-admin-list"
          />
          <datalist id="al-admin-list">
            {admins.map(a => <option key={a} value={a} />)}
          </datalist>
        </div>

        <div className="al-filter-group">
          <label className="al-filter-label">Action</label>
          <div className="al-action-tabs">
            {(['all', 'login', 'logout', 'login_failed'] as const).map(a => (
              <button
                key={a}
                type="button"
                className={`al-action-tab${filterAction === a ? ' active' : ''}`}
                onClick={() => setFilterAction(a)}
              >
                {a === 'all' ? 'All' : ACTION_LABEL[a]}
              </button>
            ))}
          </div>
        </div>

        <div className="al-filter-group">
          <label className="al-filter-label">Date Range</label>
          <div className="al-date-range">
            <input
              type="date"
              className="admin-form-input al-filter-input"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder="From"
            />
            <span className="al-date-sep">—</span>
            <input
              type="date"
              className="admin-form-input al-filter-input"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder="To"
            />
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            className="al-clear-btn"
            onClick={clearFilters}
          >
            ✕ Reset Filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        {filtered.length === 0 ? (
          <p className="admin-empty">Tidak ada data yang cocok dengan filter.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Action</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
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
