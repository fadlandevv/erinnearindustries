import type { Metadata } from 'next'
import Link from 'next/link'
import CustomDesignClient from '@/components/CustomDesignClient'
import { getPricingItems } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'Custom Amplop Packaging — Erinnear Industries',
}

export default async function CustomAmplopPage() {
  const pricingItems  = await getPricingItems()
  const sablonOptions = pricingItems.filter(i => i.type === 'sablon').map(i => ({ label: i.label, price: i.price }))

  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/custom" className="svc-detail-back">← Pilih Produk</Link>
        </div>
      </div>
      <CustomDesignClient
        bahanOptions={[]}
        sablonOptions={sablonOptions}
        productType="amplop-packaging"
      />
    </>
  )
}
