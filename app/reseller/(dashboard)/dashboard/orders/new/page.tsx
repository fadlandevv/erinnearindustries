import { getProducts } from '@/lib/data'
import NewOrderClient from './NewOrderClient'

export default async function NewResellerOrderPage() {
  const products = await getProducts()
  return <NewOrderClient products={products} />
}
