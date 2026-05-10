import { Suspense } from 'react'
import type { Metadata } from 'next'
import ResetForm from './ResetForm'

export const metadata: Metadata = { title: 'Reset Password — Erinnear Industries' }

export default function ResetPasswordPage() {
  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">EI</span>
          Erinnear Industries
        </div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-sub">Masukkan password baru untuk akunmu</p>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </section>
  )
}
