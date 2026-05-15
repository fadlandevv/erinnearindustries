'use client'
import { useState, useActionState, useEffect } from 'react'
import {
  createResellerAction,
  deleteResellerAction,
  updateResellerOrderStatusAction,
} from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'
import type { Reseller, ResellerOrder, ResellerOrderStatus } from '@/lib/resellers'

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_OPTIONS: { value: ResellerOrderStatus; label: string }[] = [
  { value: 'pending',     label: 'Menunggu' },
  { value: 'confirmed',   label: 'Terkonfirmasi' },
  { value: 'processing',  label: 'Diproses' },
  { value: 'shipped',     label: 'Dikirim' },
  { value: 'delivered',   label: 'Selesai' },
  { value: 'cancelled',   label: 'Dibatalkan' },
]

type Props = {
  resellers: Reseller[]
  orders: ResellerOrder[]
}

function LevelBadge({ level }: { level: string }) {
  return (
    <span className={`rs-level-badge rs-level-badge--${level}`}>{level}</span>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`admin-badge rs-order-status-${status}`}>
      {STATUS_OPTIONS.find(s => s.value === status)?.label ?? status}
    </span>
  )
}

function OrderRow({ order }: { order: ResellerOrder }) {
  const { toast } = useAdminToast()
  const [status, setStatus] = useState<ResellerOrderStatus>(order.status)
  const [commission, setCommission] = useState(order.commission.toString())
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const fd = new FormData()
    fd.append('id', order.id)
    fd.append('status', status)
    fd.append('commission', commission)
    const result = await updateResellerOrderStatusAction({}, fd)
    setSaving(false)
    if (result?.error) toast(result.error, 'error')
    else toast('Status pesanan diperbarui')
  }

  return (
    <tr>
      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(order.createdAt)}</td>
      <td>
        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{order.resellerUsername}</div>
      </td>
      <td>
        <div style={{ fontWeight: 600 }}>{order.customerName}</div>
        {order.customerPhone && <div style={{ fontSize: '0.78rem', color: '#888' }}>{order.customerPhone}</div>}
      </td>
      <td>
        {order.items.map((item, i) => (
          <div key={i} style={{ fontSize: '0.8rem', color: '#555' }}>
            {item.title} ({item.size}) ×{item.qty}
          </div>
        ))}
      </td>
      <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{IDR(order.totalPrice)}</td>
      <td>
        <input
          type="number"
          min={0}
          value={commission}
          onChange={e => setCommission(e.target.value)}
          className="admin-form-input"
          style={{ width: 120, padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}
          placeholder="0"
        />
      </td>
      <td>
        <div className="admin-order-status-form">
          <select
            value={status}
            onChange={e => setStatus(e.target.value as ResellerOrderStatus)}
            className="admin-order-status-select"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="admin-order-status-btn"
            onClick={handleSave}
            disabled={saving}
            title="Simpan"
          >
            {saving ? '…' : '✓'}
          </button>
        </div>
      </td>
    </tr>
  )
}

function CreateResellerForm({ onCreated }: { onCreated: () => void }) {
  const { toast } = useAdminToast()
  const [state, action, isPending] = useActionState(createResellerAction, {})

  useEffect(() => {
    if (state.ok) {
      toast('Akun reseller berhasil dibuat')
      onCreated()
    } else if (state.error) {
      toast(state.error, 'error')
    }
  }, [state])

  return (
    <form action={action} className="admin-form-card" style={{ marginTop: '1.5rem' }}>
      <p className="admin-form-section-title">Tambah Akun Reseller</p>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label>Username *</label>
          <input name="username" type="text" className="admin-form-input" placeholder="username" required />
        </div>
        <div className="admin-form-group">
          <label>Password *</label>
          <input name="password" type="password" className="admin-form-input" placeholder="min. 6 karakter" required />
        </div>
        <div className="admin-form-group">
          <label>Nama *</label>
          <input name="name" type="text" className="admin-form-input" placeholder="Nama reseller" required />
        </div>
        <div className="admin-form-group">
          <label>No. HP</label>
          <input name="phone" type="text" className="admin-form-input" placeholder="08xxxxxxxxxx" />
        </div>
        <div className="admin-form-group">
          <label>Level</label>
          <select name="level" className="admin-form-select" defaultValue="bronze">
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </select>
        </div>
      </div>
      <div className="admin-form-actions">
        <button type="submit" className="btn-admin-primary" disabled={isPending}>
          {isPending ? 'Menyimpan...' : '+ Tambah Reseller'}
        </button>
      </div>
    </form>
  )
}

export default function ResellerAdminClient({ resellers, orders }: Props) {
  const { toast } = useAdminToast()
  const [tab, setTab] = useState<'akun' | 'pesanan'>('akun')
  const [showAddForm, setShowAddForm] = useState(false)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus akun reseller "${name}"? Pesanan tidak akan terhapus.`)) return
    await deleteResellerAction(id)
    toast(`Akun "${name}" dihapus`)
  }

  return (
    <>
      {/* Tabs */}
      <div className="wh-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`wh-tab${tab === 'akun' ? ' active' : ''}`}
          onClick={() => setTab('akun')}
        >
          Akun Reseller ({resellers.length})
        </button>
        <button
          type="button"
          className={`wh-tab${tab === 'pesanan' ? ' active' : ''}`}
          onClick={() => setTab('pesanan')}
        >
          Pesanan Reseller ({orders.length})
        </button>
      </div>

      {/* Tab: Akun */}
      {tab === 'akun' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <button
              type="button"
              className="btn-admin-primary"
              onClick={() => setShowAddForm(f => !f)}
            >
              {showAddForm ? 'Tutup Form' : '+ Tambah Reseller'}
            </button>
          </div>

          {showAddForm && (
            <CreateResellerForm onCreated={() => setShowAddForm(false)} />
          )}

          <div className="admin-table-wrap" style={{ marginTop: showAddForm ? '1.25rem' : 0 }}>
            {resellers.length === 0 ? (
              <div className="admin-empty">Belum ada akun reseller. Tambahkan akun pertama di atas.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Level</th>
                    <th>No. HP</th>
                    <th>Status</th>
                    <th>Dibuat</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {resellers.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.username}</td>
                      <td><LevelBadge level={r.level} /></td>
                      <td>{r.phone || '—'}</td>
                      <td>
                        {r.active
                          ? <span className="admin-badge admin-badge-green">Aktif</span>
                          : <span className="admin-badge admin-badge-red">Nonaktif</span>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.createdAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="btn-admin-danger"
                            onClick={() => handleDelete(r.id, r.name)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Tab: Pesanan */}
      {tab === 'pesanan' && (
        <div className="admin-table-wrap">
          {orders.length === 0 ? (
            <div className="admin-empty">Belum ada pesanan dari reseller.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Reseller</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Komisi (Rp)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  )
}
