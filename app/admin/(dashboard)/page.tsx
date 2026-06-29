import Link from 'next/link'
import { getProducts, getServices } from '@/lib/data'

export default async function AdminDashboard() {
  const products = await getProducts()
  const services = await getServices()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome to Erinnear CMS</p>
        </div>
        <Link href="/" target="_blank" className="btn-admin-secondary">
          ↗ View Website
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
          <p>{products.length} products registered</p>
        </Link>
        <Link href="/admin/services" className="admin-quick-link">
          <div className="admin-quick-link-icon">✦</div>
          <h4>Manage Services</h4>
          <p>{services.length} services registered</p>
        </Link>
        <Link href="/admin/products/new" className="admin-quick-link">
          <div className="admin-quick-link-icon">＋</div>
          <h4>Add New Product</h4>
          <p>Add a product to the catalog</p>
        </Link>
        <Link href="/admin/services/new" className="admin-quick-link">
          <div className="admin-quick-link-icon">＋</div>
          <h4>Add New Service</h4>
          <p>Add a new service</p>
        </Link>
      </div>
    </>
  )
}
