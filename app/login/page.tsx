import LoginForm from '@/components/LoginForm'

export const metadata = { title: 'Masuk — Erinnear Industries' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams
  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">EI</span>
          Erinnear Industries
        </div>
        <h1 className="auth-title">Masuk</h1>
        <p className="auth-sub">Masuk untuk melihat riwayat pesananmu</p>
        <LoginForm callbackUrl={callbackUrl ?? '/orders'} />
      </div>
    </section>
  )
}
