'use client'
import { useActionState } from 'react'
import { resellerLogin } from '@/lib/actions'
import PasswordInput from '@/components/PasswordInput'

export default function ResellerLoginPage() {
  const [state, formAction, isPending] = useActionState(resellerLogin, {})

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="admin-login-logo-mark" style={{ background: '#16a34a' }}>RS</span>
          Reseller Portal
        </div>
        <h1>Selamat datang</h1>
        <p>Masuk ke portal reseller untuk mengelola pesanan dan penghasilan.</p>

        {state.error && <div className="admin-error">{state.error}</div>}

        <form action={formAction}>
          <div className="admin-form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="admin-form-input"
              placeholder="Username reseller"
              autoComplete="username"
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              name="password"
              inputClassName="admin-form-input"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-admin-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: '#16a34a',
            }}
            disabled={isPending}
          >
            {isPending ? 'Memproses...' : 'Masuk →'}
          </button>
        </form>
      </div>
    </div>
  )
}
