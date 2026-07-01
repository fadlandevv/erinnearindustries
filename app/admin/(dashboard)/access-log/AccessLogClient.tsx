'use client'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
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

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function formatDisplay(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`
}

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

// ── Custom Date Picker ─────────────────────────────────────────
function DatePicker({ value, onChange, placeholder }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<{ year: number; month: number }>(() => {
    const base = value ? new Date(value) : new Date()
    return { year: base.getFullYear(), month: base.getMonth() }
  })
  const ref = useRef<HTMLDivElement>(null)
  const today = isoToday()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function openPicker() {
    const base = value ? new Date(value) : new Date()
    setView({ year: base.getFullYear(), month: base.getMonth() })
    setOpen(true)
  }

  function prevMonth() {
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 })
  }
  function nextMonth() {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 })
  }

  const cells = useMemo(() => {
    const firstDay = new Date(view.year, view.month, 1).getDay()
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const arr: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [view])

  function pick(day: number) {
    const m = String(view.month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${view.year}-${m}-${d}`)
    setOpen(false)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
  }

  const iso = (day: number) => {
    const m = String(view.month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${view.year}-${m}-${d}`
  }

  return (
    <div ref={ref} className="al-datepicker">
      <button type="button" className={`al-datepicker-trigger admin-form-input${open ? ' focused' : ''}`} onClick={openPicker}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="al-datepicker-icon">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M1 5.5h12M4.5 1v2.5M9.5 1v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span className={value ? '' : 'al-datepicker-placeholder'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && (
          <span className="al-datepicker-clear" onClick={clear}>×</span>
        )}
      </button>

      {open && (
        <div className="al-datepicker-panel">
          {/* Header */}
          <div className="al-cal-header">
            <button type="button" className="al-cal-nav" onClick={prevMonth}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="al-cal-title">{MONTHS[view.month]} {view.year}</span>
            <button type="button" className="al-cal-nav" onClick={nextMonth}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="al-cal-grid">
            {DAYS.map(d => <div key={d} className="al-cal-day-label">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} />
              const cellIso = iso(day)
              const isSelected = cellIso === value
              const isToday = cellIso === today
              return (
                <button
                  key={cellIso}
                  type="button"
                  className={`al-cal-day${isSelected ? ' selected' : ''}${isToday && !isSelected ? ' today' : ''}`}
                  onClick={() => pick(day)}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Today shortcut */}
          <div className="al-cal-footer">
            <button type="button" className="al-cal-today-btn" onClick={() => { onChange(today); setOpen(false) }}>
              Hari ini
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Export helpers ─────────────────────────────────────────────
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
  triggerDownload(new Blob([[HEADERS.join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8;' }), filename)
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
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;font-size:11px;padding:24px;color:#111}h1{font-size:15px;font-weight:700;margin-bottom:4px}p{color:#888;font-size:10px;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{background:#f5f5f5;text-align:left;padding:7px 10px;border:1px solid #ddd;font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#666;font-weight:700}td{padding:7px 10px;border:1px solid #eee}tr:nth-child(even) td{background:#fafafa}</style></head><body><h1>Access Log</h1><p>Diekspor pada ${new Date().toLocaleString('id-ID')} · ${rows.length} entri</p><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html); win.document.close(); win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

// ── Export dropdown ────────────────────────────────────────────
function ExportDropdown({ onExport, disabled }: { onExport: (fmt: 'csv' | 'excel' | 'pdf') => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className="btn-admin-secondary" onClick={() => setOpen(o => !o)} disabled={disabled} style={{ gap: 6 }}>
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
          {(['csv', 'excel', 'pdf'] as const).map(k => (
            <button key={k} type="button" className="al-export-item" onClick={() => { onExport(k); setOpen(false) }}>
              <span className="al-export-label">{k === 'csv' ? 'CSV' : k === 'excel' ? 'Excel' : 'PDF'}</span>
              <span className="al-export-ext">{k === 'csv' ? '.csv' : k === 'excel' ? '.xls' : '.pdf'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function AccessLogClient({ logs }: { logs: AccessLogEntry[] }) {
  const [search, setSearch]             = useState('')
  const [filterAction, setFilterAction] = useState<AccessAction | 'all'>('all')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')

  const admins = useMemo(() => Array.from(new Set(logs.map(l => l.username))).sort(), [logs])

  const filtered = useMemo(() => logs.filter(entry => {
    if (search && !entry.username.toLowerCase().includes(search.toLowerCase())) return false
    if (filterAction !== 'all' && entry.action !== filterAction) return false
    if (dateFrom) { const f = new Date(dateFrom); f.setHours(0,0,0,0); if (new Date(entry.createdAt) < f) return false }
    if (dateTo)   { const t = new Date(dateTo);   t.setHours(23,59,59,999); if (new Date(entry.createdAt) > t) return false }
    return true
  }), [logs, search, filterAction, dateFrom, dateTo])

  function handleExport(fmt: 'csv' | 'excel' | 'pdf') {
    const date = new Date().toISOString().slice(0, 10)
    const base = `access-log-${date}`
    if (fmt === 'csv')   exportCSV(filtered, `${base}.csv`)
    if (fmt === 'excel') exportExcel(filtered, `${base}.xls`)
    if (fmt === 'pdf')   exportPDF(filtered, `Access Log ${date}`)
  }

  function clearFilters() {
    setSearch(''); setFilterAction('all'); setDateFrom(''); setDateTo('')
  }

  const isFiltered = search || filterAction !== 'all' || dateFrom || dateTo

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Access Log</h1>
          <p className="admin-page-subtitle">{filtered.length} dari {logs.length} aktivitas login &amp; logout admin</p>
        </div>
        <ExportDropdown onExport={handleExport} disabled={filtered.length === 0} />
      </div>

      {/* Filter */}
      <div className="admin-form-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label>Admin</label>
            <input
              type="text" className="admin-form-input"
              placeholder="Cari username..." value={search}
              onChange={e => setSearch(e.target.value)}
              list="al-admin-list"
            />
            <datalist id="al-admin-list">{admins.map(a => <option key={a} value={a} />)}</datalist>
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label>Action</label>
            <select className="admin-form-select" value={filterAction} onChange={e => setFilterAction(e.target.value as typeof filterAction)}>
              <option value="all">Semua</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="login_failed">Login Failed</option>
            </select>
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label>Dari Tanggal</label>
            <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Pilih tanggal" />
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label>Sampai Tanggal</label>
            <DatePicker value={dateTo} onChange={setDateTo} placeholder="Pilih tanggal" />
          </div>
        </div>

        {isFiltered && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>
              Menampilkan <strong style={{ color: '#0d0d0d' }}>{filtered.length}</strong> dari {logs.length} data
            </span>
            <button type="button" className="al-clear-btn" onClick={clearFilters}>✕ Reset Filter</button>
          </div>
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
                <th>Waktu</th><th>Admin</th><th>Action</th><th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  <td style={{ whiteSpace: 'nowrap', color: '#888', fontSize: '0.82rem' }}>{formatDate(entry.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{entry.username}</td>
                  <td><span className={ACTION_BADGE[entry.action]}>{ACTION_LABEL[entry.action]}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#666' }}>{entry.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
