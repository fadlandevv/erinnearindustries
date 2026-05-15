import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/data'
import { getProductSizeEntries } from '@/lib/warehouse'
import StockPricingTable from './StockPricingTable'
import InfoForm from './InfoForm'
import PhotosForm from './PhotosForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const entries = await getProductSizeEntries(id, product.sizes)

  let sizechartData: Record<string, { panjang?: number; lebar?: number }> = {}
  try {
    if (product.sizechart) sizechartData = JSON.parse(product.sizechart)
  } catch {}

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Product</h1>
          <p className="admin-page-subtitle">{product.title}</p>
        </div>
        <Link href="/admin/products" className="btn-admin-secondary">← Kembali</Link>
      </div>

      <InfoForm product={product} sizechartData={sizechartData} />

      <StockPricingTable
        productId={product.id}
        productTitle={product.title}
        entries={entries}
      />

      <PhotosForm
        productId={product.id}
        image={product.image}
        images={product.images}
      />
    </>
  )
}
