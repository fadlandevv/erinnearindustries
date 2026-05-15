import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getResellerById } from '@/lib/resellers'
import { getResellerOrders } from '@/lib/resellers'

const IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Terkonfirmasi',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
}

export default async function ResellerDashboardPage() {
  const jar = await cookies()
  const resellerId = jar.get('reseller-token')?.value
  const reseller = resellerId ? await getResellerById(resellerId) : null
  if (!reseller) redirect('/reseller/login')

  const orders = await getResellerOrders(reseller.id)
  const recent = orders.slice(0, 5)

  const totalOrders = orders.length
  const pending = orders.filter(o => o.status === 'pending').length
  const confirmed = orders.filter(o => o.status === 'confirmed' || o.status === 'processing' || o.status === 'shipped').length
  const totalCommission = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.commission, 0)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Halo, {reseller.name}! Selamat datang di portal reseller.</p>
        </div>
        <Link href="/reseller/orders/new" className="btn-admin-primary" style={{ background: '#16a34a' }}>
          + Buat Pesanan
        </Link>
      </div>

      <div className="admin-stats-grid admin-stats-4col">
        <div className="admin-stat-card">
          <div className="admin-stat-num">{totalOrders}</div>
          <div className="admin-stat-label">Total Pesanan</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{pending}</div>
          <div className="admin-stat-label">Menunggu</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{confirmed}</div>
          <div className="admin-stat-label">Diproses</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num" style={{ fontSize: '1.25rem' }}>{IDR(totalCommission)}</div>
          <div className="admin-stat-label">Total Komisi</div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Pesanan Terbaru</h2>
        <Link href="/reseller/orders" style={{ fontSize: '0.82rem', color: '#16a34a', textDecoration: 'none', fontWeight: 500 }}>
          Lihat semua →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-empty">Belum ada pesanan. <Link href="/reseller/orders/new" style={{ color: '#16a34a' }}>Buat pesanan pertama →</Link></div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Komisi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(order => (
                <tr key={order.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(order.createdAt)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.items.length} item</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{IDR(order.totalPrice)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{order.commission > 0 ? IDR(order.commission) : '—'}</td>
                  <td>
                    <span className={`admin-badge rs-order-status-${order.status}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
