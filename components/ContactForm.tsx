'use client'
import { useState } from 'react'
import type { ServiceItem, Product } from '@/lib/data'

type Props = {
  services: ServiceItem[]
  products: Product[]
  defaultService?: string
  defaultProduct?: string
}

export default function ContactForm({ services, products, defaultService, defaultProduct }: Props) {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    service: defaultService ?? '',
    product: defaultProduct ?? '',
    message: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
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
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="service">Service <span className="form-label-opt">(optional)</span></label>
            <select
              id="service"
              name="service"
              className="form-select"
              value={form.service}
              onChange={handleChange}
            >
              <option value="">— Select a service —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="product">Product <span className="form-label-opt">(optional)</span></label>
            <select
              id="product"
              name="product"
              className="form-select"
              value={form.product}
              onChange={handleChange}
            >
              <option value="">— Select a product —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            className="form-textarea"
            placeholder="Tell us about your project..."
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="form-submit">Send Message →</button>
      </form>
    </div>
  )
}
