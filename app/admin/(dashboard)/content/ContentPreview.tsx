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

function PageBanner({ title, sub, accent = false }: { title: string; sub: string; accent?: boolean }) {
  return (
    <section style={{
      padding: '64px 32px',
      background: accent ? '#0d0d0d' : '#f8f7f5',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700,
        lineHeight: 1.1, letterSpacing: '-0.03em',
        margin: '0 0 14px',
        color: accent ? '#fff' : '#0d0d0d',
      }}>
        {renderTitle(title)}
      </h1>
      <p style={{ fontSize: 13, color: accent ? 'rgba(255,255,255,0.65)' : '#666', maxWidth: 420, margin: '0 auto', lineHeight: 1.65 }}>
        {sub}
      </p>
    </section>
  )
}

function Placeholder({ height = 160, radius = 12, label }: { height?: number; radius?: number; label?: string }) {
  return (
    <div style={{ height, borderRadius: radius, background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {label && <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>{label}</span>}
    </div>
  )
}

function HomepagePreview({ content, showcase }: { content: ContentData; showcase: ShowcaseItem[] }) {
  const c = content.id
  return (
    <>
      {/* Hero */}
      <section style={{ padding: '60px 32px', textAlign: 'center', borderBottom: '1px solid #f0ede8' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
          {renderTitle(c.hero?.title ?? '')}
        </h1>
        <p style={{ fontSize: 13, color: '#666', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.65 }}>
          {c.hero?.sub}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d0d0d', color: '#fff', padding: '10px 20px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
          <span>↗</span> Mulai Custom
        </div>
      </section>

      {/* Showcase */}
      <section style={{ padding: '40px 32px' }}>
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
        <section style={{ padding: '0 32px 40px' }}>
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
      <section style={{ padding: '0 32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            {renderTitle(c.featuredProducts?.title ?? '')}
          </h2>
          <div style={{ background: '#0d0d0d', color: '#fff', padding: '8px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            View All →
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[1,2,3].map(i => <Placeholder key={i} height={140} />)}
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '40px 32px', background: '#f8f7f5', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 8px' }}>
          {renderTitle(c.servicesSection?.title ?? '')}
        </h2>
        <p style={{ fontSize: 12, color: '#666', margin: '0 auto 16px', maxWidth: 360 }}>{c.servicesSection?.sub}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0d0d0d', color: '#fff', padding: '8px 16px', borderRadius: 100, fontSize: 11, fontWeight: 600, marginBottom: 20 }}>
          View All Services →
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px', textAlign: 'left' }}>
              <div style={{ width: 28, height: 28, background: '#f0ede8', borderRadius: 8, marginBottom: 10 }} />
              <div style={{ height: 9, background: '#e8e4de', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 7, background: '#f0ede8', borderRadius: 4, width: '70%' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section style={{ padding: '40px 32px' }}>
        <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ flexShrink: 0, width: 110, height: 75, background: '#f0ede8', borderRadius: 10 }} />)}
        </div>
      </section>
    </>
  )
}

function ProductsPreview({ content }: { content: ContentData }) {
  const c = content.id
  return (
    <>
      <PageBanner title={c.productPage?.title ?? ''} sub={c.productPage?.sub ?? ''} />
      <section style={{ padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
          {[1,2,3,4,5,6].map(i => <Placeholder key={i} height={180} label={`Product ${i}`} />)}
        </div>
      </section>
    </>
  )
}

function ServicesPreview({ content }: { content: ContentData }) {
  const c = content.id
  return (
    <>
      <PageBanner title={c.servicePage?.title ?? ''} sub={c.servicePage?.sub ?? ''} />
      <section style={{ padding: '40px 32px' }}>
        {c.servicePage?.processTitle && (
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 20px', textAlign: 'center' }}>
            {c.servicePage.processTitle}
          </h2>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(c.servicePage?.steps ?? []).map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px', background: '#f8f7f5', borderRadius: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d0d0d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {step.num ?? i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 24 }}>
          {[1,2,3,4].map(i => <Placeholder key={i} height={100} label={`Service ${i}`} />)}
        </div>
      </section>
    </>
  )
}

function ContactPreview({ content }: { content: ContentData }) {
  const c = content.id
  return (
    <>
      <PageBanner title={c.contact?.title ?? ''} sub={c.contact?.sub ?? ''} accent />
      <section style={{ padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Nama', 'Email', 'No. HP'].map(f => (
              <div key={f}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#555' }}>{f}</div>
                <div style={{ height: 38, background: '#f8f7f5', borderRadius: 10, border: '1px solid #e8e4de' }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#555' }}>Pesan</div>
              <div style={{ height: 90, background: '#f8f7f5', borderRadius: 10, border: '1px solid #e8e4de' }} />
            </div>
            <div style={{ height: 40, background: '#0d0d0d', borderRadius: 10 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Alamat', 'Email', 'Telepon', 'WhatsApp'].map(f => (
              <div key={f} style={{ padding: '14px 16px', background: '#f8f7f5', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8e4de', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>{f}</div>
                  <div style={{ height: 8, background: '#ddd', borderRadius: 4, width: 100 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default function ContentPreview({ content, showcase, tab }: { content: ContentData; showcase: ShowcaseItem[]; tab: string }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'none', background: '#fff', fontSize: 14, color: '#0d0d0d', fontFamily: 'inherit' }}>
      {tab === 'home-hero' && <HomepagePreview content={content} showcase={showcase} />}
      {tab === 'products'  && <ProductsPreview content={content} />}
      {tab === 'services'  && <ServicesPreview content={content} />}
      {tab === 'contact'   && <ContactPreview content={content} />}
    </div>
  )
}
