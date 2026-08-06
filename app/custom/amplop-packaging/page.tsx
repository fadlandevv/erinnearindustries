import type { Metadata } from 'next'
import CustomDesignClient from '@/components/CustomDesignClient'
import { getPricingItems } from '@/lib/pricing'
import { getProductConfig } from '@/lib/product-config'

export const metadata: Metadata = {
  title: 'Custom Amplop Packaging',
}

export default async function CustomAmplopPage() {
  const [pricingItems, productConfig] = await Promise.all([
    getPricingItems(),
    getProductConfig('amplop-packaging'),
  ])
  const sablonOptions = pricingItems.filter(i => i.type === 'sablon').map(i => ({ label: i.label, price: i.price }))

  return (
    <>
      <CustomDesignClient
        bahanOptions={[]}
        sablonOptions={sablonOptions}
        productType="amplop-packaging"
        productConfig={productConfig}
      />
    </>
  )
}
