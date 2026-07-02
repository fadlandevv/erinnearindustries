import { Suspense } from 'react'
import LoginForm from '@/components/LoginForm'

export const metadata = { title: 'Masuk — Erinnear Industries' }

export default function LoginPage() {
  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">EI</span>
          Erinnear Industries
        </div>
        <h1 className="auth-title">Masuk</h1>
        <p className="auth-sub">Masuk untuk melihat riwayat pesananmu</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  )
}
