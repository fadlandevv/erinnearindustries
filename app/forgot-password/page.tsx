'use client'
import { useState } from 'react'
import Link from 'next/link'

const ADMIN_WA = '6281283615836'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(
    `Halo, saya lupa password akun Erinnear Industries.\nEmail saya: ${email || '[email kamu]'}`
  )}`

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">EI</span>
          Erinnear Industries
        </div>
        <h1 className="auth-title">Lupa Password?</h1>
        <p className="auth-sub">
          Masukkan emailmu, lalu hubungi admin via WhatsApp — kami akan kirimkan link reset.
        </p>

        <div className="auth-form-group" style={{ marginTop: '1.25rem' }}>
          <label htmlFor="email">Email Akun</label>
          <input
            id="email"
            type="email"
            className="auth-input"
            placeholder="kamu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="auth-btn"
          style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}
        >
          Hubungi Admin via WhatsApp
        </a>

        <p className="auth-switch" style={{ marginTop: '1rem' }}>
          <Link href="/login">← Kembali ke halaman masuk</Link>
        </p>
      </div>
    </section>
  )
}
