import { getPricingItems } from '@/lib/pricing'
import PricingClient from './PricingClient'

export default async function PricingPage() {
  const items = await getPricingItems()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pricing Custom Order</h1>
          <p className="admin-page-sub">Manage material and screen print prices shown on the custom design page.</p>
        </div>
      </div>
      <PricingClient items={items} />
    </>
  )
}
