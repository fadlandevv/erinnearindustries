import { getPricingItems } from '@/lib/pricing'
import PricingClient from './PricingClient'

export default async function PricingPage() {
  const items = await getPricingItems()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pricing Custom Order</h1>
          <p className="admin-page-sub">Kelola harga bahan dan sablon yang tampil di halaman custom design.</p>
        </div>
      </div>
      <PricingClient items={items} />
    </>
  )
}
