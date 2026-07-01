'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
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

const HEADERS = ['Waktu', 'Admin', 'Action', 'IP Address']

function rowValues(r: AccessLogEntry) {
  return [formatDate(r.createdAt), r.username, ACTION_LABEL[r.action], r.ip]
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function exportCSV(rows: AccessLogEntry[], filename: string) {
  const lines = rows.map(r => rowValues(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const content = [HEADERS.join(','), ...lines].join('\r\n')
  triggerDownload(new Blob([content], { type: 'text/csv;charset=utf-8;' }), filename)
}

function exportExcel(rows: AccessLogEntry[], filename: string) {
  const ths = HEADERS.map(h => `<th>${h}</th>`).join('')
  const trs = rows.map(r => `<tr>${rowValues(r).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`
  triggerDownload(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' }), filename)
}

function exportPDF(rows: AccessLogEntry[], title: string) {
  const ths = HEADERS.map(h => `<th>${h}</th>`).join('')
  const trs = rows.map(r => `<tr>${rowValues(r).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,sans-serif;font-size:11px;padding:24px;color:#111}
    h1{font-size:15px;font-weight:700;margin-bottom:4px}
    p{color:#888;font-size:10px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse}
    th{background:#f5f5f5;text-align:left;padding:7px 10px;border:1px solid #ddd;font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#666;font-weight:700}
    td{padding:7px 10px;border:1px solid #eee;vertical-align:top}
    tr:nth-child(even) td{background:#fafafa}
  </style></head><body>
    <h1>Access Log</h1>
    <p>Diekspor pada ${new Date().toLocaleString('id-ID')} · ${rows.length} entri</p>
    <table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>
  </body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

function ExportDropdown({ onExport, disabled }: { onExport: (fmt: 'csv' | 'excel' | 'pdf') => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const formats = [
    { key: 'csv'   as const, label: 'CSV',   ext: '.csv',  icon: '⊞' },
    { key: 'excel' as const, label: 'Excel',  ext: '.xls',  icon: '⊞' },
    { key: 'pdf'   as const, label: 'PDF',    ext: '.pdf',  icon: '⊟' },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn-admin-secondary"
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
        style={{ gap: 6 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v8M4 6l3 3 3-3M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Export
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 2 }}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="al-export-menu">
          {formats.map(f => (
            <button
              key={f.key}
              type="button"
              className="al-export-item"
              onClick={() => { onExport(f.key); setOpen(false) }}
            >
              <span className="al-export-label">{f.label}</span>
              <span className="al-export-ext">{f.ext}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
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

  function handleExport(fmt: 'csv' | 'excel' | 'pdf') {
    const date = new Date().toISOString().slice(0, 10)
    const base = `access-log-${date}`
    if (fmt === 'csv')   exportCSV(filtered, `${base}.csv`)
    if (fmt === 'excel') exportExcel(filtered, `${base}.xls`)
    if (fmt === 'pdf')   exportPDF(filtered, `Access Log ${date}`)
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
        <ExportDropdown onExport={handleExport} disabled={filtered.length === 0} />
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
