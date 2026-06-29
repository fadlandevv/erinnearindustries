import type { Metadata } from 'next'
import { getProducts } from '@/lib/data'
import { getStockMap, getStockLog, getPriceMap } from '@/lib/warehouse'
import WarehouseClient from './WarehouseClient'

export const metadata: Metadata = { title: 'Warehouse — Erinnear CMS' }

export default async function WarehousePage() {
  const [products, stockMap, priceMap, logs] = await Promise.all([
    getProducts(),
    getStockMap(),
    getPriceMap(),
    getStockLog(),
  ])

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Warehouse</h1>
        <p className="admin-page-subtitle">Monitor and manage catalog stock</p>
      </div>
      <WarehouseClient products={products} stockMap={stockMap} priceMap={priceMap} logs={logs} />
    </div>
  )
}
