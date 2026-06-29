import Link from 'next/link'
import { getProducts } from '@/lib/data'
import ProductsTable from './ProductsTable'

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} products registered</p>
        </div>
        <Link href="/admin/products/new" className="btn-admin-primary">
          + Add Product
        </Link>
      </div>
      <ProductsTable products={products} />
    </>
  )
}
