'use client'
import { useState, useTransition, Fragment } from 'react'
import type { ContactMessage, MessageStatus } from '@/lib/contact-messages'
import { adminUpdateMessageStatus, adminDeleteMessage } from '@/lib/actions'

const STATUS_LABELS: Record<MessageStatus, string> = {
  new: 'Baru',
  read: 'Dibaca',
  replied: 'Dibalas',
  closed: 'Ditutup',
}

const STATUS_COLORS: Record<MessageStatus, string> = {
  new: '#f47c2f',
  read: '#3b82f6',
  replied: '#22c55e',
  closed: '#9ca3af',
}

function parseInterest(raw?: string) {
  if (!raw) return null
  const [type, ...rest] = raw.split(':')
  return { type, id: rest.join(':') }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

type FilterStatus = 'all' | MessageStatus

export default function MessagesClient({ messages }: { messages: ContactMessage[] }) {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = messages.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.message.toLowerCase().includes(q)
    }
    return true
  })

  const counts = {
    all: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    closed: messages.filter(m => m.status === 'closed').length,
  }

  function handleExpand(id: string, currentStatus: MessageStatus) {
    setExpanded(prev => (prev === id ? null : id))
    if (currentStatus === 'new') {
      startTransition(() => adminUpdateMessageStatus(id, 'read'))
    }
  }

  function handleStatus(id: string, status: MessageStatus) {
    startTransition(() => adminUpdateMessageStatus(id, status))
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus pesan ini?')) return
    startTransition(() => adminDeleteMessage(id))
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Messages & Claims</h1>
          <p className="admin-page-subtitle">Pesan masuk dari form Contact Us</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="msg-filter-tabs">
        {(['all', 'new', 'read', 'replied', 'closed'] as const).map(s => (
          <button
            key={s}
            type="button"
            className={`msg-tab${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Semua' : STATUS_LABELS[s]}
            <span className="msg-tab-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="admin-form-card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <input
          type="text"
          className="admin-form-input"
          placeholder="Cari nama, email, atau isi pesan..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ margin: 0 }}
        />
      </div>

      {/* Table */}
      <div className="admin-form-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
            Tidak ada pesan ditemukan.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pengirim</th>
                  <th>Minat</th>
                  <th>Pesan</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(msg => {
                  const interest = parseInterest(msg.interest)
                  const isOpen = expanded === msg.id
                  return (
                    <Fragment key={msg.id}>
                      <tr
                        className={`msg-row${msg.status === 'new' ? ' msg-row--new' : ''}${isOpen ? ' msg-row--open' : ''}`}
                        onClick={() => handleExpand(msg.id, msg.status)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div className="msg-sender">
                            <span className="msg-name">{msg.name}</span>
                            <span className="msg-email">{msg.email}</span>
                            {msg.phone && <span className="msg-phone">{msg.phone}</span>}
                          </div>
                        </td>
                        <td>
                          {interest ? (
                            <span className="msg-interest-tag" data-type={interest.type}>
                              {interest.type === 'service' ? 'Service' : 'Product'}
                            </span>
                          ) : (
                            <span style={{ color: '#bbb', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className="msg-preview">
                            {isOpen ? msg.message : msg.message.slice(0, 80) + (msg.message.length > 80 ? '…' : '')}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#777' }}>
                          {formatDate(msg.createdAt)}
                        </td>
                        <td>
                          <span className="msg-status-badge" style={{ background: STATUS_COLORS[msg.status] + '22', color: STATUS_COLORS[msg.status] }}>
                            {STATUS_LABELS[msg.status]}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="msg-actions">
                            {msg.status !== 'replied' && (
                              <button className="msg-btn msg-btn--reply" onClick={() => handleStatus(msg.id, 'replied')} disabled={isPending}>
                                Balas
                              </button>
                            )}
                            {msg.status !== 'closed' && (
                              <button className="msg-btn msg-btn--close" onClick={() => handleStatus(msg.id, 'closed')} disabled={isPending}>
                                Tutup
                              </button>
                            )}
                            <button className="msg-btn msg-btn--delete" onClick={() => handleDelete(msg.id)} disabled={isPending}>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="msg-detail-row">
                          <td colSpan={6}>
                            <div className="msg-detail">
                              {interest && (
                                <div className="msg-detail-interest">
                                  <strong>Tertarik pada:</strong> {interest.type === 'service' ? 'Service' : 'Product'} — ID: {interest.id}
                                </div>
                              )}
                              <div className="msg-detail-body">{msg.message}</div>
                              <div className="msg-detail-meta">
                                Dikirim: {formatDate(msg.createdAt)} &nbsp;·&nbsp; Email: <a href={`mailto:${msg.email}`}>{msg.email}</a>
                                {msg.phone && <> &nbsp;·&nbsp; HP: <a href={`tel:${msg.phone}`}>{msg.phone}</a></>}
                              </div>
                              <div className="msg-detail-status-row">
                                <span style={{ fontSize: '12px', color: '#777' }}>Ubah status:</span>
                                {(['new', 'read', 'replied', 'closed'] as MessageStatus[]).map(s => (
                                  <button
                                    key={s}
                                    className={`msg-btn${msg.status === s ? ' msg-btn--active' : ''}`}
                                    onClick={() => handleStatus(msg.id, s)}
                                    disabled={isPending || msg.status === s}
                                  >
                                    {STATUS_LABELS[s]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
