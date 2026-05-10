import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Lupa Password — Erinnear Industries' }

export default function ForgotPasswordPage() {
  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">EI</span>
          Erinnear Industries
        </div>
        <h1 className="auth-title">Lupa Password?</h1>
        <p className="auth-sub" style={{ marginBottom: '1.5rem' }}>
          Reset password dilakukan oleh admin. Hubungi kami dan sebutkan email akunmu — kami akan kirimkan link reset.
        </p>

        <a
          href="https://wa.me/6281234567890?text=Halo%2C+saya+lupa+password+akun+Erinnear+Industries.+Email+saya%3A+"
          target="_blank"
          rel="noopener noreferrer"
          className="auth-btn"
          style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
        >
          Hubungi via WhatsApp
        </a>

        <p className="auth-switch" style={{ marginTop: '1rem' }}>
          <Link href="/login">← Kembali ke halaman masuk</Link>
        </p>
      </div>
    </section>
  )
}
