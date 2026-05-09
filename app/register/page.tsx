import RegisterForm from '@/components/RegisterForm'

export const metadata = { title: 'Daftar — Erinnear Industries' }

export default function RegisterPage() {
  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">EI</span>
          Erinnear Industries
        </div>
        <h1 className="auth-title">Buat Akun</h1>
        <p className="auth-sub">Daftar untuk melacak riwayat pesananmu</p>
        <RegisterForm />
      </div>
    </section>
  )
}
