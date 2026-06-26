import type { Metadata } from 'next'
import Link from 'next/link'
import CustomDesignClient from '@/components/CustomDesignClient'
import { getPricingItems } from '@/lib/pricing'
import { getCustomProductOptions } from '@/lib/data'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'

export const metadata: Metadata = {
  title: 'Custom Kaos — Erinnear Industries',
  description: 'Upload desain depan dan belakang bajumu, pilih warna dan ukuran — kami produksi sesuai pesanan.',
}

export default async function CustomTshirtPage() {
  const [pricingItems, opts] = await Promise.all([getPricingItems(), getCustomProductOptions('tshirt')])
  const sablonOptions = pricingItems.filter(i => i.type === 'sablon').map(i => ({ label: i.label, price: i.price }))
  const colorOptions  = opts.colors.length > 0 ? opts.colors : DEFAULT_COLORS
  const bahanOptions  = opts.bahans.length > 0 ? opts.bahans : (DEFAULT_BAHANS['tshirt'] ?? [])
  const sizeOptions   = opts.sizes.length  > 0 ? opts.sizes.map(s => s.label) : (DEFAULT_SIZES['tshirt'] ?? [])

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
        productType="tshirt"
        colorOptions={colorOptions}
        sizeOptions={sizeOptions}
      />
    </>
  )
}
