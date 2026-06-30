'use client'
import type { ContentData, ShowcaseItem } from '@/lib/data'

function renderTitle(title: string) {
  return (title ?? '').split('\n').map((line, li, arr) => (
    <span key={li}>
      {line.split(/(\*[^*]+\*)/g).map((part, pi) =>
        part.startsWith('*') && part.endsWith('*')
          ? <em key={pi} style={{ fontStyle: 'italic', fontWeight: 300 }}>{part.slice(1, -1)}</em>
          : part
      )}
      {li < arr.length - 1 && <br />}
    </span>
  ))
}

export default function ContentPreview({ content, showcase }: { content: ContentData; showcase: ShowcaseItem[] }) {
  const c = content.id

  return (
    <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none', background: '#fff', fontSize: 14, color: '#0d0d0d', fontFamily: 'inherit' }}>

      {/* Hero */}
      <section style={{ padding: '60px 24px', textAlign: 'center', borderBottom: '1px solid #f0ede8' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
          {renderTitle(c.hero?.title ?? '')}
        </h1>
        <p style={{ fontSize: 13, color: '#666', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.65 }}>
          {c.hero?.sub}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d0d0d', color: '#fff', padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
          <span>↗</span> Mulai Custom
        </div>
      </section>

      {/* Showcase */}
      <section style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {showcase.map((item) => (
            <div key={item.id} style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '4/5', background: '#111', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {item.image
                ? <img src={item.image} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1c1c1c,#0d0d0d)' }} />
              }
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.18) 55%,transparent 100%)' }} />
              <div style={{ position: 'relative', zIndex: 2, padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>{item.title}</h3>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', textDecoration: 'underline' }}>{item.buttonText} →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      {c.stats && (
        <section style={{ padding: '0 24px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f47c2f', borderRadius: 16, padding: '28px 24px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 10px' }}>
                {(c.stats.heading ?? '').split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>{c.stats.desc}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(c.stats.items ?? []).map((s, i) => (
                <div key={i} style={{ background: '#f8f7f5', borderRadius: 12, padding: '16px 14px' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {s.num}<span style={{ fontSize: 12, fontWeight: 500, color: '#666' }}> {s.unit}</span>
                  </div>
                  <p style={{ fontSize: 10, color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section style={{ padding: '0 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div style={{ maxWidth: 360 }}>
            <h2 style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 8px' }}>
              {renderTitle(c.featuredProducts?.title ?? '')}
            </h2>
          </div>
          <div style={{ background: '#0d0d0d', color: '#fff', padding: '8px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            View All Products →
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#f8f7f5', borderRadius: 12, aspectRatio: '3/4' }} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '40px 24px', background: '#f8f7f5', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 8px' }}>
          {renderTitle(c.servicesSection?.title ?? '')}
        </h2>
        <p style={{ fontSize: 12, color: '#666', margin: '0 auto 16px', maxWidth: 360 }}>
          {c.servicesSection?.sub}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0d0d0d', color: '#fff', padding: '8px 16px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
          View All Services →
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px', textAlign: 'left' }}>
              <div style={{ width: 28, height: 28, background: '#f0ede8', borderRadius: 8, marginBottom: 10 }} />
              <div style={{ height: 10, background: '#e8e4de', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 8, background: '#f0ede8', borderRadius: 4, width: '70%' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Gallery placeholder */}
      <section style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 10, overflowX: 'hidden' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ flexShrink: 0, width: 120, height: 80, background: '#f0ede8', borderRadius: 12 }} />
          ))}
        </div>
      </section>

    </div>
  )
}
