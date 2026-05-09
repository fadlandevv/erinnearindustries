import { cookies } from 'next/headers'
import { getUserByEmail } from '@/lib/users'
import CheckoutForm from '@/components/CheckoutForm'

export const metadata = { title: 'Checkout — Erinnear Industries' }

export default async function CheckoutPage() {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  const user = email ? getUserByEmail(email) : null
  const userInfo = user ? { name: user.name, email: user.email } : null

  return (
    <section className="checkout-section">
      <div className="container">
        <div className="checkout-page-header">
          <h1 className="checkout-page-title">Checkout</h1>
          <p className="checkout-page-sub">Lengkapi informasi pengiriman untuk melanjutkan pembayaran</p>
        </div>
        <CheckoutForm userInfo={userInfo} />
      </div>
    </section>
  )
}
