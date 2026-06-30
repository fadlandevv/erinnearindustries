'use client'
import { useState } from 'react'

type DayData = { date: string; visitors: number; pageviews: number }
type TopPage = { path: string; views: number; pct: number }
type Source = { name: string; sessions: number; pct: number; color: string }
type DeviceStat = { name: string; pct: number; color: string }

type Props = {
  days: DayData[]
  topPages: TopPage[]
  sources: Source[]
  devices: DeviceStat[]
  totalVisitors: number
  totalPageviews: number
  avgDuration: string
  bounceRate: string
  isConnected: boolean
}

function LineChart({ data, width = 680, height = 180 }: { data: { v: number; pv: number }[]; width?: number; height?: number }) {
  const pad = { t: 16, r: 8, b: 28, l: 44 }
  const W = width - pad.l - pad.r
  const H = height - pad.t - pad.b

  const maxV = Math.max(...data.map(d => d.v), 1)
  const maxPV = Math.max(...data.map(d => d.pv), 1)

  function pts(values: number[], max: number) {
    return values.map((v, i) => {
      const x = pad.l + (i / (values.length - 1)) * W
      const y = pad.t + H - (v / max) * H
      return `${x},${y}`
    }).join(' ')
  }

  function area(values: number[], max: number) {
    const p = values.map((v, i) => {
      const x = pad.l + (i / (values.length - 1)) * W
      const y = pad.t + H - (v / max) * H
      return `${x},${y}`
    })
    return `M${p[0]} ${p.slice(1).map(pt => `L${pt}`).join(' ')} L${pad.l + W},${pad.t + H} L${pad.l},${pad.t + H} Z`
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * maxV))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Y grid */}
      {yTicks.map((tick, i) => {
        const y = pad.t + H - (tick / maxV) * H
        return (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + W} y1={y} y2={y} stroke="#f0ede7" strokeWidth={1} />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#bbb">{tick.toLocaleString()}</text>
          </g>
        )
      })}

      {/* Area fills */}
      <path d={area(data.map(d => d.pv), maxPV)} fill="rgba(244,124,47,0.06)" />
      <path d={area(data.map(d => d.v), maxV)} fill="rgba(59,130,246,0.08)" />

      {/* Lines */}
      <polyline points={pts(data.map(d => d.pv), maxPV)} fill="none" stroke="#f47c2f" strokeWidth={2} strokeLinejoin="round" />
      <polyline points={pts(data.map(d => d.v), maxV)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />

      {/* Dots */}
      {data.map((d, i) => {
        const x = pad.l + (i / (data.length - 1)) * W
        const yV = pad.t + H - (d.v / maxV) * H
        const yPV = pad.t + H - (d.pv / maxPV) * H
        return (
          <g key={i}>
            <circle cx={x} cy={yV} r={3} fill="#3b82f6" />
            <circle cx={x} cy={yPV} r={3} fill="#f47c2f" />
          </g>
        )
      })}
    </svg>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="admin-stat-card" style={{ borderTop: `3px solid ${color ?? '#e5e1d8'}` }}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value" style={{ color: color ?? undefined }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function AnalyticsClient({ days, topPages, sources, devices, totalVisitors, totalPageviews, avgDuration, bounceRate, isConnected }: Props) {
  const [range, setRange] = useState<7 | 14 | 28>(7)

  const sliced = days.slice(-range)
  const chartData = sliced.map(d => ({ v: d.visitors, pv: d.pageviews }))

  const dateLabel = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {!isConnected && (
        <div style={{
          background: 'rgba(244,124,47,0.07)', border: '1px solid rgba(244,124,47,0.2)',
          borderRadius: 12, padding: '0.875rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontSize: '0.85rem', color: '#b45309',
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠</span>
          <div>
            <strong>GA4 not connected yet</strong> — showing demo data.
            Add <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4 }}>GA_PROPERTY_ID</code> and service account credentials to see real analytics.
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard label="Total Visitors" value={totalVisitors.toLocaleString()} sub={`last ${range} days`} color="#3b82f6" />
        <StatCard label="Pageviews" value={totalPageviews.toLocaleString()} sub={`last ${range} days`} color="#f47c2f" />
        <StatCard label="Avg. Duration" value={avgDuration} sub="per session" color="#10b981" />
        <StatCard label="Bounce Rate" value={bounceRate} sub="lower is better" color="#8b5cf6" />
      </div>

      {/* Chart */}
      <div className="admin-form-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Visitors & Pageviews</h2>
            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
              {dateLabel(sliced[0]?.date ?? '')} – {dateLabel(sliced[sliced.length - 1]?.date ?? '')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {([7, 14, 28] as const).map(r => (
              <button key={r} type="button" onClick={() => setRange(r)}
                style={{
                  padding: '0.3rem 0.7rem', borderRadius: 7, border: '1.5px solid',
                  borderColor: range === r ? '#f47c2f' : '#e5e5e5',
                  background: range === r ? 'rgba(244,124,47,0.08)' : 'transparent',
                  color: range === r ? '#f47c2f' : '#888',
                  fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
                }}>
                {r}d
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#555' }}>
            <div style={{ width: 20, height: 2, background: '#3b82f6', borderRadius: 2 }} />
            Visitors
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#555' }}>
            <div style={{ width: 20, height: 2, background: '#f47c2f', borderRadius: 2 }} />
            Pageviews
          </div>
        </div>

        <LineChart data={chartData} />

        {/* X-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 44, paddingRight: 8, marginTop: 4 }}>
          {sliced.filter((_, i) => i % Math.ceil(sliced.length / 6) === 0 || i === sliced.length - 1).map((d, i) => (
            <span key={i} style={{ fontSize: '0.68rem', color: '#bbb' }}>{dateLabel(d.date)}</span>
          ))}
        </div>
      </div>

      {/* Top Pages + Sources */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Top Pages */}
        <div className="admin-form-card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem' }}>Top Pages</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {topPages.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#333' }}>{p.path}</span>
                  <span style={{ fontSize: '0.78rem', color: '#888' }}>{p.views.toLocaleString()}</span>
                </div>
                <div style={{ height: 4, background: '#f0ede7', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: '#f47c2f', borderRadius: 99, transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources + Devices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="admin-form-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem' }}>Traffic Sources</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {sources.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', flex: 1, color: '#333' }}>{s.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#888', minWidth: 40, textAlign: 'right' }}>{s.sessions}</span>
                  <div style={{ width: 60, height: 4, background: '#f0ede7', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#bbb', minWidth: 32, textAlign: 'right' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-form-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem' }}>Devices</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {devices.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', flex: 1, color: '#333' }}>{d.name}</span>
                  <div style={{ width: 80, height: 4, background: '#f0ede7', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.pct}%`, background: d.color, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#bbb', minWidth: 36, textAlign: 'right' }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
