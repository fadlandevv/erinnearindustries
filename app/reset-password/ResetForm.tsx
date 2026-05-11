'use client'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordAction } from '@/lib/actions'
import PasswordInput from '@/components/PasswordInput'

export default function ResetForm() {
  const token = useSearchParams().get('token') ?? ''
  const [state, action, pending] = useActionState(resetPasswordAction, {})

  if (state.success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✓</div>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Password berhasil diubah!</p>
        <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Silakan login dengan password baru kamu.
        </p>
        <Link href="/login" className="auth-btn" style={{ display: 'inline-block' }}>
          Masuk Sekarang
        </Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', color: '#ef4444' }}>
        Link reset tidak valid. Minta admin untuk generate ulang.
      </div>
    )
  }

  return (
    <form action={action} className="auth-form">
      <input type="hidden" name="token" value={token} />

      {state.error && <div className="auth-error">{state.error}</div>}

      <div className="auth-form-group">
        <label htmlFor="password">Password Baru</label>
        <PasswordInput
          id="password" name="password" required minLength={6}
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
        />
      </div>

      <div className="auth-form-group">
        <label htmlFor="confirm">Konfirmasi Password</label>
        <PasswordInput
          id="confirm" name="confirm" required minLength={6}
          placeholder="Ulangi password baru"
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="auth-btn" disabled={pending}>
        {pending ? 'Menyimpan…' : 'Simpan Password Baru'}
      </button>
    </form>
  )
}
