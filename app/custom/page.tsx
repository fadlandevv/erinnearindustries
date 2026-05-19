import type { Metadata } from 'next'
import Link from 'next/link'
import CustomDesignClient from '@/components/CustomDesignClient'
import { getPricingItems } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'Custom Design — Erinnear Industries',
  description: 'Upload desain depan dan belakang bajumu, pilih warna dan ukuran — kami produksi sesuai pesanan.',
}

export default async function CustomPage() {
  const pricingItems = await getPricingItems()
  const bahanOptions = pricingItems.filter(i => i.type === 'bahan').map(i => ({ label: i.label, price: i.price }))
  const sablonOptions = pricingItems.filter(i => i.type === 'sablon').map(i => ({ label: i.label, price: i.price }))

  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/" className="svc-detail-back">← Beranda</Link>
        </div>
      </div>

      <CustomDesignClient bahanOptions={bahanOptions} sablonOptions={sablonOptions} />
    </>
  )
}
