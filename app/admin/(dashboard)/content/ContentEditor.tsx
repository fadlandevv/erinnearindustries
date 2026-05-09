'use client'
import { useState, useActionState } from 'react'
import { saveContentAction } from '@/lib/actions'
import type { ContentData } from '@/lib/data'

type Tab = 'home-hero' | 'home-stats' | 'home-sections' | 'products' | 'services' | 'contact'

const TABS: { id: Tab; label: string }[] = [
  { id: 'home-hero', label: 'Home Hero' },
  { id: 'home-stats', label: 'Home Stats' },
  { id: 'home-sections', label: 'Home Sections' },
  { id: 'products', label: 'Produk' },
  { id: 'services', label: 'Layanan' },
  { id: 'contact', label: 'Kontak' },
]

export default function ContentEditor({ initialContent }: { initialContent: ContentData }) {
  const [content, setContent] = useState<ContentData>(initialContent)
  const [tab, setTab] = useState<Tab>('home-hero')
  const [state, formAction, pending] = useActionState(saveContentAction, null)

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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

  return (
    <form action={formAction}>
      <input type="hidden" name="content" value={JSON.stringify(content)} />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
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

      <div className="admin-form-card">

        {/* ── Home Hero ── */}
        {tab === 'home-hero' && (
          <div>
            <p className="admin-form-section-title">Home — Hero Banner</p>
            <p className="admin-form-hint" style={{ marginBottom: '1rem' }}>
              Gunakan <code>*kata*</code> untuk miring. Gunakan baris baru untuk jeda baris di judul.
            </p>
            <BiField section="hero" field="badge" label="Badge / Pill" />
            <BiField section="hero" field="title" label="Judul (gunakan *kata* untuk italik, Enter = baris baru)" multiline />
            <BiField section="hero" field="sub" label="Subtitle" multiline />
          </div>
        )}

        {/* ── Home Stats ── */}
        {tab === 'home-stats' && (
          <div>
            <p className="admin-form-section-title">Home — Stats Section</p>
            <BiField section="stats" field="heading" label="Heading (Enter = baris baru)" multiline />
            <BiField section="stats" field="desc" label="Deskripsi" multiline />
            <div className="admin-form-section-title" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>Stat Items</div>
            {(content.id.stats?.items ?? []).map((_, idx) => (
              <div key={idx} className="admin-card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
                <p className="admin-form-hint" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
                  Item #{idx + 1} — Angka: {content.id.stats?.items?.[idx]?.num}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className={grp}>
                    <label>Angka</label>
                    <input className={inp} value={content.id.stats?.items?.[idx]?.num ?? ''} onChange={e => { setStatItem('id', idx, 'num', e.target.value); setStatItem('en', idx, 'num', e.target.value) }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className={grp}>
                    <label>Deskripsi 🇮🇩</label>
                    <textarea className={ta} rows={2} value={content.id.stats?.items?.[idx]?.desc ?? ''} onChange={e => setStatItem('id', idx, 'desc', e.target.value)} />
                  </div>
                  <div className={grp}>
                    <label>Deskripsi 🇬🇧</label>
                    <textarea className={ta} rows={2} value={content.en.stats?.items?.[idx]?.desc ?? ''} onChange={e => setStatItem('en', idx, 'desc', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Home Sections ── */}
        {tab === 'home-sections' && (
          <div>
            <p className="admin-form-section-title">Home — Featured Products Section</p>
            <BiField section="featuredProducts" field="badge" label="Badge" />
            <BiField section="featuredProducts" field="title" label="Judul (Enter = baris baru)" multiline />

            <div style={{ borderTop: '1px solid var(--border,#e8e4de)', margin: '1.5rem 0' }} />

            <p className="admin-form-section-title">Home — Services Section</p>
            <BiField section="servicesSection" field="badge" label="Badge" />
            <BiField section="servicesSection" field="title" label="Judul (Enter = baris baru)" multiline />
            <BiField section="servicesSection" field="sub" label="Subtitle" multiline />
          </div>
        )}

        {/* ── Products Page ── */}
        {tab === 'products' && (
          <div>
            <p className="admin-form-section-title">Halaman Produk — Banner</p>
            <BiField section="productPage" field="badge" label="Badge" />
            <BiField section="productPage" field="title" label="Judul (Enter = baris baru)" multiline />
            <BiField section="productPage" field="sub" label="Subtitle" multiline />
          </div>
        )}

        {/* ── Services Page ── */}
        {tab === 'services' && (
          <div>
            <p className="admin-form-section-title">Halaman Layanan — Banner</p>
            <BiField section="servicePage" field="badge" label="Badge" />
            <BiField section="servicePage" field="title" label="Judul (Enter = baris baru)" multiline />
            <BiField section="servicePage" field="sub" label="Subtitle" multiline />

            <div style={{ borderTop: '1px solid var(--border,#e8e4de)', margin: '1.5rem 0' }} />

            <p className="admin-form-section-title">How We Work / Process Steps</p>
            <BiField section="servicePage" field="processTitle" label="Judul Section" />

            {(content.id.servicePage?.steps ?? []).map((_, idx) => (
              <div key={idx} className="admin-card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
                <p className="admin-form-hint" style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                  Step {content.id.servicePage?.steps?.[idx]?.num ?? idx + 1}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className={grp}>
                    <label>Judul 🇮🇩</label>
                    <input className={inp} value={content.id.servicePage?.steps?.[idx]?.title ?? ''} onChange={e => setStepField('id', idx, 'title', e.target.value)} />
                  </div>
                  <div className={grp}>
                    <label>Judul 🇬🇧</label>
                    <input className={inp} value={content.en.servicePage?.steps?.[idx]?.title ?? ''} onChange={e => setStepField('en', idx, 'title', e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className={grp}>
                    <label>Deskripsi 🇮🇩</label>
                    <textarea className={ta} rows={2} value={content.id.servicePage?.steps?.[idx]?.desc ?? ''} onChange={e => setStepField('id', idx, 'desc', e.target.value)} />
                  </div>
                  <div className={grp}>
                    <label>Deskripsi 🇬🇧</label>
                    <textarea className={ta} rows={2} value={content.en.servicePage?.steps?.[idx]?.desc ?? ''} onChange={e => setStepField('en', idx, 'desc', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Contact Page ── */}
        {tab === 'contact' && (
          <div>
            <p className="admin-form-section-title">Halaman Kontak — Banner</p>
            <BiField section="contact" field="badge" label="Badge" />
            <BiField section="contact" field="title" label="Judul (Enter = baris baru)" multiline />
            <BiField section="contact" field="sub" label="Subtitle" multiline />
          </div>
        )}
      </div>

      {/* Save bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-admin-primary" disabled={pending}>
          {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
        {state?.ok && (
          <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.875rem' }}>
            ✓ Tersimpan
          </span>
        )}
      </div>
    </form>
  )
}
