'use client'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, {})
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/orders'

  return (
    <form action={action} className="auth-form">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state.error && <div className="auth-error">{state.error}</div>}

      <div className="auth-form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email" name="email" type="email" required
          placeholder="kamu@email.com" className="auth-input"
          autoComplete="email"
        />
      </div>

      <div className="auth-form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password" name="password" type="password" required
          placeholder="••••••••" className="auth-input"
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="auth-btn" disabled={pending}>
        {pending ? <span className="checkout-spinner" /> : null}
        {pending ? 'Memproses...' : 'Masuk'}
      </button>

      <p className="auth-switch">
        Belum punya akun?{' '}
        <Link href="/register">Daftar sekarang</Link>
      </p>
      <p className="auth-switch" style={{ marginTop: '0.5rem' }}>
        Lupa password?{' '}
        <Link href="/forgot-password">Hubungi admin</Link>
      </p>
    </form>
  )
}
