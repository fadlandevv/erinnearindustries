'use client'
import { useState, useActionState } from 'react'
import { saveContentAction } from '@/lib/actions'
import type { ContentData, ShowcaseItem } from '@/lib/data'

type Tab = 'home-hero' | 'products' | 'services' | 'contact'

const TABS: { id: Tab; label: string }[] = [
  { id: 'home-hero', label: 'Homepage' },
  { id: 'products', label: 'Page Products' },
  { id: 'services', label: 'Page Services' },
  { id: 'contact', label: 'Contact' },
]

function CollapsibleCard({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="admin-form-card" style={{ marginTop: '1rem', padding: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{title}</span>
        <svg
          width="14" height="14" viewBox="0 0 10 10" fill="none"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 1.1rem 1rem', borderTop: '1px solid var(--border,#e8e4de)' }}>
          <div style={{ paddingTop: '1rem' }}>{children}</div>
        </div>
      )}
    </div>
  )
}

export default function ContentEditor({
  initialContent,
  initialShowcase,
}: {
  initialContent: ContentData
  initialShowcase: ShowcaseItem[]
}) {
  const [content, setContent] = useState<ContentData>(initialContent)
  const [showcase, setShowcase] = useState<ShowcaseItem[]>(initialShowcase)
  const [tab, setTab] = useState<Tab>('home-hero')
  const [state, formAction, pending] = useActionState(saveContentAction, null)

  function setShowcaseField(idx: number, field: keyof ShowcaseItem, value: string) {
    setShowcase(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function setField(lang: 'id' | 'en', section: keyof ContentData['id'], field: string, value: string) {
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [section]: {
          ...(prev[lang][section] as object ?? {}),
          [field]: value,
        },
      },
    }))
  }

  function setStepField(lang: 'id' | 'en', idx: number, field: 'title' | 'desc', value: string) {
    const steps = [...(content[lang].servicePage?.steps ?? [])]
    steps[idx] = { ...steps[idx], [field]: value }
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        servicePage: { ...prev[lang].servicePage, steps },
      },
    }))
  }

  function setStatItem(lang: 'id' | 'en', idx: number, field: 'num' | 'unit' | 'desc', value: string) {
    const items = [...(content[lang].stats?.items ?? [])]
    items[idx] = { ...items[idx], [field]: value }
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        stats: { ...prev[lang].stats, items },
      },
    }))
  }

  const inp = 'admin-form-input'
  const ta = 'admin-form-textarea'
  const grp = 'admin-form-group'

  function BiField({
    section, field, label, multiline = false,
  }: {
    section: keyof ContentData['id']
    field: string
    label: string
    multiline?: boolean
  }) {
    const idVal = ((content.id[section] as any)?.[field] ?? '') as string
    const enVal = ((content.en[section] as any)?.[field] ?? '') as string
    return (
      <div className="admin-form-group" style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>{label}</label>
        <div className="admin-2col-grid">
          <div>
            <span className="admin-form-hint" style={{ marginBottom: '0.25rem', display: 'block' }}>🇮🇩 Indonesia</span>
            {multiline
              ? <textarea className={ta} rows={3} value={idVal} onChange={e => setField('id', section, field, e.target.value)} />
              : <input className={inp} type="text" value={idVal} onChange={e => setField('id', section, field, e.target.value)} />}
          </div>
          <div>
            <span className="admin-form-hint" style={{ marginBottom: '0.25rem', display: 'block' }}>🇬🇧 English</span>
            {multiline
              ? <textarea className={ta} rows={3} value={enVal} onChange={e => setField('en', section, field, e.target.value)} />
              : <input className={inp} type="text" value={enVal} onChange={e => setField('en', section, field, e.target.value)} />}
          </div>
        </div>
      </div>
    )
  }

  const divider = <div style={{ borderTop: '1px solid var(--border,#e8e4de)', margin: '1.5rem 0' }} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Tab bar — fixed */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '1rem', flexShrink: 0 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'btn-admin-primary' : 'btn-admin-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Scrollable cards area */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

        {/* ── Homepage ── */}
        {tab === 'home-hero' && (<>
          <CollapsibleCard title="Banner">
            <p className="admin-form-hint" style={{ marginBottom: '1rem' }}>
              Use <code>*word*</code> for italic. Use a new line for line breaks in the title.
            </p>
            <BiField section="hero" field="title" label="Title (use *word* for italic, Enter = new line)" multiline />
            <BiField section="hero" field="sub" label="Subtitle" multiline />

          </CollapsibleCard>

          <CollapsibleCard title="Showcase Cards" defaultOpen={false}>
            {showcase.map((item, idx) => (
              <div key={item.id}>
                {idx > 0 && divider}
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Card {idx + 1}</p>
                <div className={grp}>
                  <label>Title</label>
                  <input type="text" className={inp} value={item.title} onChange={e => setShowcaseField(idx, 'title', e.target.value)} />
                </div>
                <div className={grp}>
                  <label>Description</label>
                  <textarea className={ta} value={item.desc} onChange={e => setShowcaseField(idx, 'desc', e.target.value)} />
                </div>
                <div className="admin-2col-grid">
                  <div className={grp}>
                    <label>Button Text</label>
                    <input type="text" className={inp} value={item.buttonText} onChange={e => setShowcaseField(idx, 'buttonText', e.target.value)} />
                  </div>
                  <div className={grp}>
                    <label>Button Link</label>
                    <input type="text" className={inp} value={item.buttonHref} onChange={e => setShowcaseField(idx, 'buttonHref', e.target.value)} placeholder="/product" />
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleCard>

          <CollapsibleCard title="Stats Section" defaultOpen={false}>
            <BiField section="stats" field="heading" label="Heading (Enter = new line)" multiline />
            <BiField section="stats" field="desc" label="Description" multiline />
            <div className="admin-form-section-title" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>Stat Items</div>
            {(content.id.stats?.items ?? []).map((_, idx) => (
              <div key={idx} className="admin-card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
                <p className="admin-form-hint" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
                  Item #{idx + 1} — Angka: {content.id.stats?.items?.[idx]?.num}
                </p>
                <div className="admin-2col-grid" style={{ marginBottom: '0.75rem' }}>
                  <div className={grp}>
                    <label>Angka</label>
                    <input className={inp} value={content.id.stats?.items?.[idx]?.num ?? ''} onChange={e => { setStatItem('id', idx, 'num', e.target.value); setStatItem('en', idx, 'num', e.target.value) }} />
                  </div>
                  <div className="admin-2col-grid" style={{ gap: '0.5rem' }}>
                    <div className={grp}>
                      <label>Unit 🇮🇩</label>
                      <input className={inp} value={content.id.stats?.items?.[idx]?.unit ?? ''} onChange={e => setStatItem('id', idx, 'unit', e.target.value)} />
                    </div>
                    <div className={grp}>
                      <label>Unit 🇬🇧</label>
                      <input className={inp} value={content.en.stats?.items?.[idx]?.unit ?? ''} onChange={e => setStatItem('en', idx, 'unit', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="admin-2col-grid">
                  <div className={grp}>
                    <label>Description 🇮🇩</label>
                    <textarea className={ta} rows={2} value={content.id.stats?.items?.[idx]?.desc ?? ''} onChange={e => setStatItem('id', idx, 'desc', e.target.value)} />
                  </div>
                  <div className={grp}>
                    <label>Description 🇬🇧</label>
                    <textarea className={ta} rows={2} value={content.en.stats?.items?.[idx]?.desc ?? ''} onChange={e => setStatItem('en', idx, 'desc', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleCard>

          <CollapsibleCard title="Featured Products & Services" defaultOpen={false}>
            <p className="admin-form-section-title">Featured Products Section</p>
            <BiField section="featuredProducts" field="title" label="Title (Enter = new line)" multiline />

            {divider}

            <p className="admin-form-section-title">Services Section</p>
            <BiField section="servicesSection" field="title" label="Title (Enter = new line)" multiline />
            <BiField section="servicesSection" field="sub" label="Subtitle" multiline />
          </CollapsibleCard>
        </>)}

        {/* ── Products Page ── */}
        {tab === 'products' && (
          <div className="admin-form-card">
            <p className="admin-form-section-title">Products Page — Banner</p>
            <BiField section="productPage" field="title" label="Title (Enter = new line)" multiline />
            <BiField section="productPage" field="sub" label="Subtitle" multiline />
          </div>
        )}

        {/* ── Services Page ── */}
        {tab === 'services' && (
          <div className="admin-form-card">
            <p className="admin-form-section-title">Services Page — Banner</p>
            <BiField section="servicePage" field="title" label="Title (Enter = new line)" multiline />
            <BiField section="servicePage" field="sub" label="Subtitle" multiline />

            {divider}

            <p className="admin-form-section-title">How We Work / Process Steps</p>
            <BiField section="servicePage" field="processTitle" label="Section Title" />

            {(content.id.servicePage?.steps ?? []).map((_, idx) => (
              <div key={idx} className="admin-card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
                <p className="admin-form-hint" style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                  Step {content.id.servicePage?.steps?.[idx]?.num ?? idx + 1}
                </p>
                <div className="admin-2col-grid" style={{ marginBottom: '0.75rem' }}>
                  <div className={grp}>
                    <label>Title 🇮🇩</label>
                    <input className={inp} value={content.id.servicePage?.steps?.[idx]?.title ?? ''} onChange={e => setStepField('id', idx, 'title', e.target.value)} />
                  </div>
                  <div className={grp}>
                    <label>Title 🇬🇧</label>
                    <input className={inp} value={content.en.servicePage?.steps?.[idx]?.title ?? ''} onChange={e => setStepField('en', idx, 'title', e.target.value)} />
                  </div>
                </div>
                <div className="admin-2col-grid">
                  <div className={grp}>
                    <label>Description 🇮🇩</label>
                    <textarea className={ta} rows={2} value={content.id.servicePage?.steps?.[idx]?.desc ?? ''} onChange={e => setStepField('id', idx, 'desc', e.target.value)} />
                  </div>
                  <div className={grp}>
                    <label>Description 🇬🇧</label>
                    <textarea className={ta} rows={2} value={content.en.servicePage?.steps?.[idx]?.desc ?? ''} onChange={e => setStepField('en', idx, 'desc', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Contact Page ── */}
        {tab === 'contact' && (
          <div className="admin-form-card">
            <p className="admin-form-section-title">Contact Page — Banner</p>
            <BiField section="contact" field="title" label="Title (Enter = new line)" multiline />
            <BiField section="contact" field="sub" label="Subtitle" multiline />
          </div>
        )}

      </div>{/* end scrollable */}

      {/* Save bar — fixed, only for page content (not showcase) */}
      <form action={formAction} style={{ flexShrink: 0 }}>
        <input type="hidden" name="content" value={JSON.stringify(content)} />
        <input type="hidden" name="showcase" value={JSON.stringify(showcase)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem' }}>
          <button type="submit" className="btn-admin-primary" disabled={pending}>
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
          {state?.ok && (
            <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.875rem' }}>
              ✓ Saved
            </span>
          )}
        </div>
      </form>

    </div>
  )
}
