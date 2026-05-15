import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUserById } from '@/lib/users'
import { getOrdersByEmail } from '@/lib/orders'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', paid: 'Dibayar', processing: 'Diproses',
  shipped: 'Dikirim', delivered: 'Selesai', failed: 'Gagal', expired: 'Kedaluwarsa',
}
const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b', paid: '#22c55e', processing: '#3b82f6',
  shipped: '#8b5cf6', delivered: '#10b981', failed: '#ef4444', expired: '#9ca3af',
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserById(id)
  if (!user) notFound()

  const orders = (await getOrdersByEmail(user.email)).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const totalSpent = orders
    .filter(o => o.status === 'paid' || o.status === 'delivered' || o.status === 'shipped' || o.status === 'processing')
    .reduce((sum, o) => sum + o.totalPrice, 0)

  const memberSince = new Date(user.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - memberSince.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Profil Member</h1>
          <p className="admin-page-subtitle">{user.email}</p>
        </div>
        <Link href="/admin/members" className="btn-admin-secondary">← Kembali</Link>
      </div>

      <div className="admin-member-layout">

        {/* ── Kiri: profil + timeline ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Avatar & info */}
          <div className="admin-form-card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#f47c2f', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.75rem', margin: '0 auto 1rem',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.15rem' }}>{user.name}</div>
            <div style={{ color: '#f47c2f', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600, marginBottom: '0.2rem' }}>
              #{user.id.slice(-8).toUpperCase()}
            </div>
            <div style={{ color: '#888', fontSize: '0.825rem', marginBottom: '1.25rem' }}>{user.email}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-muted,#f8f6f2)', borderRadius: 10, padding: '0.65rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{orders.length}</div>
                <div style={{ color: '#888', fontSize: '0.72rem', marginTop: 2 }}>Pesanan</div>
              </div>
              <div style={{ background: 'var(--bg-muted,#f8f6f2)', borderRadius: 10, padding: '0.65rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{diffDays}</div>
                <div style={{ color: '#888', fontSize: '0.72rem', marginTop: 2 }}>Hari bergabung</div>
              </div>
            </div>
          </div>

          {/* Registration timeline */}
          <div className="admin-form-card">
            <p className="admin-form-section-title" style={{ marginBottom: '1rem' }}>
              Timeline Pendaftaran
            </p>
            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
              {/* vertical line */}
              <div style={{
                position: 'absolute', left: 7, top: 8, bottom: 8,
                width: 2, background: 'var(--border,#e8e4de)', borderRadius: 2,
              }} />

              {/* Created account event */}
              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <div style={{
                  position: 'absolute', left: -22, top: 4,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#f47c2f', border: '2px solid #fff',
                  boxShadow: '0 0 0 2px #f47c2f',
                }} />
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Akun dibuat</div>
                <div style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                  {formatDateTime(user.createdAt)}
                </div>
              </div>

              {/* Order events */}
              {[...orders].reverse().map((order) => (
                <div key={order.id} style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  <div style={{
                    position: 'absolute', left: -22, top: 4,
                    width: 10, height: 10, borderRadius: '50%',
                    background: STATUS_COLOR[order.status] ?? '#ccc',
                    border: '2px solid #fff',
                    boxShadow: `0 0 0 2px ${STATUS_COLOR[order.status] ?? '#ccc'}`,
                  }} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Pesanan #{order.id.slice(-6).toUpperCase()}
                  </div>
                  <div style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                    {formatDateTime(order.createdAt)}
                  </div>
                  <div style={{
                    display: 'inline-block', marginTop: '0.25rem',
                    fontSize: '0.7rem', fontWeight: 600, padding: '1px 7px',
                    borderRadius: 99, color: '#fff',
                    background: STATUS_COLOR[order.status] ?? '#ccc',
                  }}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Kanan: pesanan ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Total spent */}
          <div className="admin-form-card">
            <p className="admin-form-section-title" style={{ marginBottom: '0.75rem' }}>Ringkasan</p>
            <div className="admin-3col-grid">
              <div style={{ background: 'var(--bg-muted,#f8f6f2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: 4 }}>Total Pesanan</div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{orders.length}</div>
              </div>
              <div style={{ background: 'var(--bg-muted,#f8f6f2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: 4 }}>Total Belanja</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{formatCurrency(totalSpent)}</div>
              </div>
              <div style={{ background: 'var(--bg-muted,#f8f6f2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: 4 }}>Bergabung</div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{formatDate(user.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Order history */}
          <div className="admin-form-card">
            <p className="admin-form-section-title" style={{ marginBottom: '1rem' }}>Riwayat Pesanan</p>
            {orders.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                Belum ada pesanan.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      border: '1px solid var(--border,#e8e4de)',
                      borderRadius: 12, padding: '0.9rem 1rem',
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        #{order.id.slice(-6).toUpperCase()}
                      </div>
                      <div style={{ color: '#888', fontSize: '0.78rem' }}>
                        {formatDateTime(order.createdAt)} · {order.items.length} item
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                        {formatCurrency(order.totalPrice)}
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
                        borderRadius: 99, color: '#fff',
                        background: STATUS_COLOR[order.status] ?? '#ccc',
                      }}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
