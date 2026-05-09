import Link from 'next/link'
import { getProducts, getServices } from '@/lib/data'

export default function AdminDashboard() {
  const products = getProducts()
  const services = getServices()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Selamat datang di Erinnear CMS</p>
        </div>
        <Link href="/" target="_blank" className="btn-admin-secondary">
          ↗ Lihat Website
        </Link>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-num">{products.length}</div>
          <div className="admin-stat-label">Total Products</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{services.length}</div>
          <div className="admin-stat-label">Total Services</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">3</div>
          <div className="admin-stat-label">Active Pages</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
        Quick Actions
      </h2>
      <div className="admin-quick-links">
        <Link href="/admin/products" className="admin-quick-link">
          <div className="admin-quick-link-icon">◈</div>
          <h4>Manage Products</h4>
          <p>{products.length} produk terdaftar</p>
        </Link>
        <Link href="/admin/services" className="admin-quick-link">
          <div className="admin-quick-link-icon">✦</div>
          <h4>Manage Services</h4>
          <p>{services.length} layanan terdaftar</p>
        </Link>
        <Link href="/admin/products/new" className="admin-quick-link">
          <div className="admin-quick-link-icon">＋</div>
          <h4>Tambah Product Baru</h4>
          <p>Tambahkan produk ke katalog</p>
        </Link>
        <Link href="/admin/services/new" className="admin-quick-link">
          <div className="admin-quick-link-icon">＋</div>
          <h4>Tambah Service Baru</h4>
          <p>Tambahkan layanan baru</p>
        </Link>
      </div>
    </>
  )
}
