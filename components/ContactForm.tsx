'use client'
import { useState, useRef, useEffect } from 'react'
import type { ServiceItem, Product } from '@/lib/data'

type Props = {
  services: ServiceItem[]
  products: Product[]
  defaultService?: string
  defaultProduct?: string
  defaultName?: string
  defaultEmail?: string
  defaultPhone?: string
}

function getDefaultInterest(services: ServiceItem[], products: Product[], defaultService?: string, defaultProduct?: string) {
  if (defaultService) {
    const s = services.find(s => s.id === defaultService)
    if (s) return { value: `service:${s.id}`, label: s.title, group: 'Service' }
  }
  if (defaultProduct) {
    const p = products.find(p => p.id === defaultProduct)
    if (p) return { value: `product:${p.id}`, label: p.title, group: 'Product' }
  }
  return null
}

function InterestDropdown({
  services,
  products,
  selected,
  onSelect,
}: {
  services: ServiceItem[]
  products: Product[]
  selected: { value: string; label: string; group: string } | null
  onSelect: (item: { value: string; label: string; group: string } | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function toggleGroup(group: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      next.has(group) ? next.delete(group) : next.add(group)
      return next
    })
  }

  return (
    <div ref={ref} className="cf-dropdown-wrap">
      <button
        type="button"
        className={`cf-dropdown-trigger${open ? ' open' : ''}${selected ? ' has-value' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="cf-dropdown-value">
          {selected ? (
            <>
              <span className="cf-dropdown-group-tag">{selected.group}</span>
              {selected.label}
            </>
          ) : (
            <span className="cf-dropdown-placeholder">Interested in…</span>
          )}
        </span>
        <svg className={`cf-dropdown-chevron${open ? ' rotated' : ''}`} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="cf-dropdown-panel" role="listbox">
          <button
            type="button"
            className={`cf-dropdown-item cf-dropdown-clear${!selected ? ' selected' : ''}`}
            onClick={() => { onSelect(null); setOpen(false) }}
          >
            No preference
          </button>

          {services.length > 0 && (
            <>
              <button
                type="button"
                className="cf-dropdown-group-header"
                onClick={() => toggleGroup('services')}
              >
                <span>Services</span>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: collapsedGroups.has('services') ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {!collapsedGroups.has('services') && services.map(s => {
                const val = `service:${s.id}`
                const isSelected = selected?.value === val
                return (
                  <button
                    key={s.id} type="button" role="option" aria-selected={isSelected}
                    className={`cf-dropdown-item${isSelected ? ' selected' : ''}`}
                    onClick={() => { onSelect({ value: val, label: s.title, group: 'Service' }); setOpen(false) }}
                  >
                    {s.title}
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </>
          )}

          {products.length > 0 && (
            <>
              <button
                type="button"
                className="cf-dropdown-group-header"
                onClick={() => toggleGroup('products')}
              >
                <span>Products</span>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: collapsedGroups.has('products') ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {!collapsedGroups.has('products') && products.map(p => {
                const val = `product:${p.id}`
                const isSelected = selected?.value === val
                return (
                  <button
                    key={p.id} type="button" role="option" aria-selected={isSelected}
                    className={`cf-dropdown-item${isSelected ? ' selected' : ''}`}
                    onClick={() => { onSelect({ value: val, label: p.title, group: 'Product' }); setOpen(false) }}
                  >
                    {p.title}
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function ContactForm({ services, products, defaultService, defaultProduct, defaultName, defaultEmail, defaultPhone }: Props) {
  const [sent, setSent] = useState(false)
  const [interest, setInterest] = useState<{ value: string; label: string; group: string } | null>(null)
  const [form, setForm] = useState({
    name: defaultName ?? '',
    email: defaultEmail ?? '',
    phone: defaultPhone ?? '',
    message: '',
  })

  useEffect(() => {
    const initial = getDefaultInterest(services, products, defaultService, defaultProduct)
    if (initial) setInterest(initial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="contact-form-card">
        <div className="form-success">
          <div className="form-success-icon">✓</div>
          <h4>Message sent!</h4>
          <p>Thank you for reaching out. We&apos;ll get back to you within 1–2 business days.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-form-card">
      <h3>Send us a message</h3>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="interest" value={interest?.value ?? ''} />

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cf-name">Full Name</label>
            <input
              id="cf-name" name="name" type="text" className="form-input"
              placeholder="Your name" value={form.name} onChange={handleChange} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cf-phone">
              Phone Number <span className="form-label-opt">(optional)</span>
            </label>
            <input
              id="cf-phone" name="phone" type="tel" className="form-input"
              placeholder="+62 8xx xxxx xxxx" value={form.phone} onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cf-email">Email Address</label>
          <input
            id="cf-email" name="email" type="email" className="form-input"
            placeholder="you@example.com" value={form.email} onChange={handleChange} required
          />
        </div>

        <div className="form-group">
          <label>I&apos;m interested in <span className="form-label-opt">(optional)</span></label>
          <InterestDropdown
            services={services}
            products={products}
            selected={interest}
            onSelect={setInterest}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cf-message">Message</label>
          <textarea
            id="cf-message" name="message" className="form-textarea"
            placeholder="Tell us about your project..."
            value={form.message} onChange={handleChange} required
          />
        </div>
        <button type="submit" className="form-submit">Send Message →</button>
      </form>
    </div>
  )
}
