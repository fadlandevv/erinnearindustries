'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getAdminNotificationsAction } from '@/lib/actions'
import type { AdminNotification, NotifKind } from '@/lib/notifications'

const POLL_MS = 30_000
/** Kunci penanda "sudah dilihat" — per browser, tidak perlu kolom database. */
const SEEN_KEY = 'ei-admin-notif-seen'

const KIND_LABEL: Record<NotifKind, string> = {
  order: 'Pesanan',
  chat: 'Chat',
  contact: 'Pesan',
}

const KIND_ICON: Record<NotifKind, React.ReactNode> = {
  order: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 4.5h11l-1 8.5a1 1 0 0 1-1 .9H4.5a1 1 0 0 1-1-.9l-1-8.5z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5.8 6.6V4.3a2.2 2.2 0 0 1 4.4 0v2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  chat: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 3.2c0-.9.7-1.6 1.6-1.6h7.8c.9 0 1.6.7 1.6 1.6v6c0 .9-.7 1.6-1.6 1.6H6l-3.5 2.6V3.2z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
  contact: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.8" y="3.3" width="12.4" height="9.4" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2.4 4.3 8 8.4l5.6-4.1" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  return d < 7 ? `${d} hari lalu` : new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

export default function AdminNotifications() {
  const [items, setItems] = useState<AdminNotification[]>([])
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | NotifKind>('all')
  const [seenAt, setSeenAt] = useState<string>('')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try { setSeenAt(localStorage.getItem(SEEN_KEY) ?? '') } catch { /* mode privat */ }
  }, [])

  const load = useCallback(() => {
    getAdminNotificationsAction().then(setItems).catch(() => { /* jaringan putus, coba lagi nanti */ })
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, POLL_MS)
    // Muat ulang begitu tab kembali aktif — polling dihentikan browser saat tab
    // di latar, jadi tanpa ini datanya bisa basi begitu admin kembali.
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus) }
  }, [load])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown) }
  }, [open])

  const unread = items.filter(n => !seenAt || n.createdAt > seenAt)
  const shown = filter === 'all' ? items : items.filter(n => n.kind === filter)

  function markAllSeen() {
    const now = new Date().toISOString()
    setSeenAt(now)
    try { localStorage.setItem(SEEN_KEY, now) } catch { /* mode privat */ }
  }

  function toggle() {
    setOpen(o => {
      if (!o) load()
      return !o
    })
  }

  const counts: Record<NotifKind, number> = {
    order: items.filter(n => n.kind === 'order').length,
    chat: items.filter(n => n.kind === 'chat').length,
    contact: items.filter(n => n.kind === 'contact').length,
  }

  return (
    <div ref={panelRef} className="adm-notif">
      <button
        type="button"
        className={`adm-notif-btn${open ? ' adm-notif-btn--open' : ''}`}
        onClick={toggle}
        aria-label={`Notifikasi${unread.length ? `, ${unread.length} baru` : ''}`}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M10 2.5a5 5 0 0 0-5 5v3l-1.3 2.4a.6.6 0 0 0 .5.9h11.6a.6.6 0 0 0 .5-.9L15 10.5v-3a5 5 0 0 0-5-5z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8 16a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {unread.length > 0 && (
          <span className="adm-notif-badge">{unread.length > 99 ? '99+' : unread.length}</span>
        )}
      </button>

      {open && (
        <div className="adm-notif-panel" role="dialog" aria-label="Notifikasi">
          <div className="adm-notif-head">
            <span className="adm-notif-title">Notifikasi</span>
            {unread.length > 0 && (
              <button type="button" className="adm-notif-clear" onClick={markAllSeen}>
                Tandai terbaca
              </button>
            )}
          </div>

          <div className="adm-notif-tabs">
            {([['all', 'Semua'], ['order', KIND_LABEL.order], ['chat', KIND_LABEL.chat], ['contact', KIND_LABEL.contact]] as const)
              .map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`adm-notif-tab${filter === key ? ' adm-notif-tab--active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                  {key !== 'all' && counts[key] > 0 && <span className="adm-notif-tab-count">{counts[key]}</span>}
                </button>
              ))}
          </div>

          <div className="adm-notif-list">
            {shown.length === 0 ? (
              <p className="adm-notif-empty">
                {items.length === 0 ? 'Belum ada notifikasi' : 'Tidak ada di kategori ini'}
              </p>
            ) : (
              shown.map(n => {
                const isNew = !seenAt || n.createdAt > seenAt
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    className={`adm-notif-item${isNew ? ' adm-notif-item--new' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className={`adm-notif-icon adm-notif-icon--${n.kind}`}>{KIND_ICON[n.kind]}</span>
                    <span className="adm-notif-body">
                      <span className="adm-notif-item-title">{n.title}</span>
                      <span className="adm-notif-item-desc">{n.body}</span>
                      <span className="adm-notif-time">{timeAgo(n.createdAt)}</span>
                    </span>
                    {isNew && <span className="adm-notif-dot" aria-hidden />}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
