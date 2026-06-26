import type { Metadata } from 'next'
import Link from 'next/link'
import CustomDesignClient from '@/components/CustomDesignClient'
import { getPricingItems } from '@/lib/pricing'
import { getCustomProductOptions } from '@/lib/data'
import { getProductConfig } from '@/lib/product-config'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'

export const metadata: Metadata = {
  title: 'Custom Jersey — Erinnear Industries',
}

export default async function CustomJerseyPage() {
  const [pricingItems, opts, productConfig] = await Promise.all([
    getPricingItems(),
    getCustomProductOptions('jersey'),
    getProductConfig('jersey'),
  ])
  const sablonOptions = pricingItems.filter(i => i.type === 'sablon').map(i => ({ label: i.label, price: i.price }))
  const colorOptions  = opts.colors.length > 0 ? opts.colors : DEFAULT_COLORS
  const bahanOptions  = opts.bahans.length > 0 ? opts.bahans : (DEFAULT_BAHANS['jersey'] ?? [])
  const sizeOptions   = opts.sizes.length > 0 ? opts.sizes : (DEFAULT_SIZES['jersey'] ?? [])

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
        productType="jersey"
        colorOptions={colorOptions}
        sizeOptions={sizeOptions}
        productConfig={productConfig}
      />
    </>
  )
}
