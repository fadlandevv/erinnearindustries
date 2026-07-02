import { cookies } from 'next/headers'
import { getUserByEmail } from '@/lib/users'
import { getOrdersByEmail } from '@/lib/orders'
import { logoutUser } from '@/lib/actions'
import ProfileForm from '@/components/ProfileForm'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Profil — Erinnear Industries' }
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  if (!email) redirect('/login?callbackUrl=/profile')
  const user = await getUserByEmail(email)
  if (!user) redirect('/login?callbackUrl=/profile')
  const orders = await getOrdersByEmail(email)
  const paidOrders = orders.filter((o) => o.status === 'paid').length

  const joinDate = new Date(user.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <section className="profile-section">
      <div className="container">

        {/* Hero card */}
        <div className="profile-hero">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-since">Member sejak {joinDate}</p>
          </div>
          <div className="profile-hero-stats">
            <div className="profile-stat">
              <strong>{orders.length}</strong>
              <span>Total Pesanan</span>
            </div>
            <div className="profile-stat">
              <strong>{paidOrders}</strong>
              <span>Selesai</span>
            </div>
          </div>
          <div className="profile-hero-actions">
            <Link href="/orders" className="btn-outline profile-orders-link">
              Riwayat Pesanan
            </Link>
            <form action={logoutUser}>
              <button type="submit" className="profile-logout-btn">Keluar</button>
            </form>
          </div>
        </div>

        {/* Forms */}
        <ProfileForm currentName={user.name} currentPhone={user.phone} />

      </div>
    </section>
  )
}
