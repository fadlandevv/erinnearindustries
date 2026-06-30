import Link from 'next/link'
import { getProducts, getServices } from '@/lib/data'
import AnalyticsClient from './analytics/AnalyticsClient'

function mockDays(n: number) {
  const days = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const base = 80 + Math.floor(Math.random() * 120)
    days.push({
      date: d.toISOString().slice(0, 10),
      visitors: base,
      pageviews: Math.floor(base * (1.4 + Math.random() * 0.8)),
    })
  }
  return days
}

const DEMO_DAYS = mockDays(28)

const DEMO_TOP_PAGES = [
  { path: '/', views: 1240, pct: 100 },
  { path: '/product', views: 860, pct: 69 },
  { path: '/custom', views: 540, pct: 44 },
  { path: '/service', views: 310, pct: 25 },
  { path: '/berita', views: 180, pct: 15 },
]

const DEMO_SOURCES = [
  { name: 'Organic Search', sessions: 820, pct: 48, color: '#3b82f6' },
  { name: 'Direct', sessions: 510, pct: 30, color: '#f47c2f' },
  { name: 'Social Media', sessions: 260, pct: 15, color: '#8b5cf6' },
  { name: 'Referral', sessions: 120, pct: 7, color: '#10b981' },
]

const DEMO_DEVICES = [
  { name: 'Mobile', pct: 62, color: '#f47c2f' },
  { name: 'Desktop', pct: 32, color: '#3b82f6' },
  { name: 'Tablet', pct: 6, color: '#10b981' },
]

const isConnected = !!process.env.GA_PROPERTY_ID

export default async function AdminDashboard() {
  const products = await getProducts()
  const services = await getServices()

  const totalVisitors = DEMO_DAYS.slice(-7).reduce((s, d) => s + d.visitors, 0)
  const totalPageviews = DEMO_DAYS.slice(-7).reduce((s, d) => s + d.pageviews, 0)

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

      <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '2rem 0 1rem', letterSpacing: '-0.02em' }}>
        Website Analytics
      </h2>
      <AnalyticsClient
        days={DEMO_DAYS}
        topPages={DEMO_TOP_PAGES}
        sources={DEMO_SOURCES}
        devices={DEMO_DEVICES}
        totalVisitors={totalVisitors}
        totalPageviews={totalPageviews}
        avgDuration="2m 14s"
        bounceRate="41%"
        isConnected={isConnected}
      />
    </>
  )
}
