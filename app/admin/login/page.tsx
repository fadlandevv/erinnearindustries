'use client'
import { useActionState } from 'react'
import { login } from '@/lib/actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {})

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="admin-login-logo-mark">EI</span>
          Erinnear CMS
        </div>
        <h1>Selamat datang</h1>
        <p>Masuk ke panel admin untuk mengelola konten website.</p>

        {state.error && <div className="admin-error">{state.error}</div>}

        <form action={formAction}>
          <div className="admin-form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="admin-form-input"
              placeholder="Username admin"
              autoComplete="username"
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="admin-form-input"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-admin-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={isPending}
          >
            {isPending ? 'Memproses...' : 'Masuk →'}
          </button>
        </form>
      </div>
    </div>
  )
}
