import type { Metadata } from 'next'
import Link from 'next/link'
import CustomDesignClient from '@/components/CustomDesignClient'
import { getPricingItems } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'Custom Kaos — Erinnear Industries',
  description: 'Upload desain depan dan belakang bajumu, pilih warna dan ukuran — kami produksi sesuai pesanan.',
}

export default async function CustomTshirtPage() {
  const pricingItems = await getPricingItems()
  const bahanOptions  = pricingItems.filter(i => i.type === 'bahan').map(i => ({ label: i.label, price: i.price }))
  const sablonOptions = pricingItems.filter(i => i.type === 'sablon').map(i => ({ label: i.label, price: i.price }))

  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/custom" className="svc-detail-back">← Pilih Produk</Link>
        </div>
      </div>

      <CustomDesignClient bahanOptions={bahanOptions} sablonOptions={sablonOptions} productType="tshirt" />
    </>
  )
}
