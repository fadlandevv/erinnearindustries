import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { getPricingItems } from '@/lib/pricing'
import { getAllCustomProductOptions } from '@/lib/data'
import { getProductConfig } from '@/lib/product-config'
import { getInvoiceCustomerOptions } from '@/lib/invoices'
import { DEFAULT_COLORS, DEFAULT_BAHANS, DEFAULT_SIZES } from '@/lib/custom-defaults'
import { CUSTOM_PRODUCT_LABELS } from '@/lib/custom-order'
import AdminCustomOrderClient, { type ProductSetup } from './AdminCustomOrderClient'

export const metadata = { title: 'Order Manual' }

const PRODUCT_TYPES = Object.keys(CUSTOM_PRODUCT_LABELS)

export default async function AdminCustomOrderPage() {
  const session = await getCurrentAdmin()
  if (!session) redirect('/admin/login')
  if (!session.role?.locked && !hasPermission(session.role, 'custom_order')) redirect('/admin')

  // Semua produk disiapkan sekaligus supaya admin bisa berpindah tab tanpa
  // memuat ulang halaman — satu order boleh mencampur kaos, hoodie, totebag, dll.
  const [pricingItems, allOptions, configs, customers] = await Promise.all([
    getPricingItems(),
    getAllCustomProductOptions(),
    Promise.all(PRODUCT_TYPES.map(t => getProductConfig(t))),
    getInvoiceCustomerOptions(),
  ])

  const sablonOptions = pricingItems
    .filter(i => i.type === 'sablon')
    .map(i => ({ label: i.label, price: i.price }))

  const products: Record<string, ProductSetup> = {}
  PRODUCT_TYPES.forEach((type, idx) => {
    const opts = allOptions[type] ?? { colors: [], bahans: [], sizes: [] }
    products[type] = {
      label:         CUSTOM_PRODUCT_LABELS[type],
      sablonOptions,
      colorOptions:  opts.colors.length ? opts.colors : DEFAULT_COLORS,
      bahanOptions:  opts.bahans.length ? opts.bahans : (DEFAULT_BAHANS[type] ?? []),
      sizeOptions:   opts.sizes.length  ? opts.sizes  : (DEFAULT_SIZES[type]  ?? []),
      productConfig: configs[idx],
    }
  })

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Order Manual</h1>
          <p className="admin-page-subtitle">
            Susun mockup seperti di halaman custom, simpan jadi order, lalu lanjut ke invoice
          </p>
        </div>
      </div>

      <AdminCustomOrderClient products={products} customers={customers} />
    </>
  )
}
