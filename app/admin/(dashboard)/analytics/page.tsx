import AnalyticsClient from './AnalyticsClient'

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

const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID
const isConnected = !!GA_PROPERTY_ID

export default async function AnalyticsPage() {
  const days = DEMO_DAYS
  const totalVisitors = days.slice(-7).reduce((s, d) => s + d.visitors, 0)
  const totalPageviews = days.slice(-7).reduce((s, d) => s + d.pageviews, 0)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">Website traffic & visitor insights</p>
        </div>
      </div>

      <AnalyticsClient
        days={days}
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
