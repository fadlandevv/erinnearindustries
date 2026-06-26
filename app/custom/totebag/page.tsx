import type { Metadata } from 'next'
import Link from 'next/link'
import CustomDesignClient from '@/components/CustomDesignClient'
import { getPricingItems } from '@/lib/pricing'
import { getCustomProductOptions } from '@/lib/data'
import { getProductConfig } from '@/lib/product-config'
import { DEFAULT_BAHANS } from '@/lib/custom-defaults'

export const metadata: Metadata = {
  title: 'Custom Totebag — Erinnear Industries',
}

export default async function CustomTotebagPage() {
  const [pricingItems, opts, productConfig] = await Promise.all([
    getPricingItems(),
    getCustomProductOptions('totebag'),
    getProductConfig('totebag'),
  ])
  const sablonOptions = pricingItems.filter(i => i.type === 'sablon').map(i => ({ label: i.label, price: i.price }))
  const bahanOptions  = opts.bahans.length > 0 ? opts.bahans : (DEFAULT_BAHANS['totebag'] ?? [])

  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/custom" className="svc-detail-back">← Pilih Produk</Link>
        </div>
      </div>
      <CustomDesignClient
        bahanOptions={bahanOptions}
        sablonOptions={sablonOptions}
        productType="totebag"
        productConfig={productConfig}
      />
    </>
  )
}
