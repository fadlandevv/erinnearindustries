'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { registerUser } from '@/lib/actions'
import PasswordInput from '@/components/PasswordInput'

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, {})

  return (
    <form action={action} className="auth-form">
      {state.error && <div className="auth-error">{state.error}</div>}

      <div className="auth-form-group">
        <label htmlFor="name">Nama Lengkap</label>
        <input
          id="name" name="name" type="text" required
          placeholder="Budi Santoso" className="auth-input"
          autoComplete="name"
        />
      </div>

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
        <PasswordInput
          id="password" name="password" required
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="auth-btn" disabled={pending}>
        {pending ? <span className="checkout-spinner" /> : null}
        {pending ? 'Memproses...' : 'Buat Akun'}
      </button>

      <p className="auth-switch">
        Sudah punya akun?{' '}
        <Link href="/login">Masuk</Link>
      </p>
    </form>
  )
}
