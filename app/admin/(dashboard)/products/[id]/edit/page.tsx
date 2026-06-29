import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/data'
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
        <Link href="/admin/products" className="btn-admin-secondary">← Back</Link>
      </div>

      <InfoForm product={product} sizechartData={sizechartData} />

      <PhotosForm
        productId={product.id}
        image={product.image}
        images={product.images}
      />
    </>
  )
}
