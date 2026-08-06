import { getCurrentUserEmail } from '@/lib/auth'
import { getUserByEmail } from '@/lib/users'
import CheckoutForm from '@/components/CheckoutForm'

export const metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const email = await getCurrentUserEmail()
  const user = email ? await getUserByEmail(email) : null
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
