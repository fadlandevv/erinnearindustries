import { db } from './db'

export type StockLogEntry = {
  id: string
  productId: string
  productTitle: string
  size: string
  quantityChange: number
  quantityAfter: number
  type: 'restock' | 'keluar' | 'koreksi'
  note: string
  adminUsername: string
  createdAt: string
}

export async function getStockMap(): Promise<Record<string, number>> {
  try {
    const { data } = await db.from('warehouse_stock').select('product_id,size,quantity')
    const map: Record<string, number> = {}
    for (const row of data ?? []) {
      map[`${row.product_id}:${row.size}`] = row.quantity
    }
    return map
  } catch { return {} }
}

export async function adjustStock(
  productId: string,
  productTitle: string,
  size: string,
  type: 'restock' | 'keluar' | 'koreksi',
  amount: number,
  note: string,
  adminUsername: string,
): Promise<{ error?: string }> {
  const { data: current } = await db
    .from('warehouse_stock')
    .select('quantity')
    .eq('product_id', productId)
    .eq('size', size)
    .maybeSingle()

  const currentQty: number = current?.quantity ?? 0
  let newQty: number
  let delta: number

  if (type === 'restock') {
    delta = amount
    newQty = currentQty + amount
  } else if (type === 'keluar') {
    delta = -amount
    newQty = currentQty - amount
  } else {
    delta = amount - currentQty
    newQty = amount
  }

  if (newQty < 0) return { error: 'Stok tidak bisa negatif.' }

  await db.from('warehouse_stock').upsert(
    { product_id: productId, size, quantity: newQty, updated_at: new Date().toISOString() },
    { onConflict: 'product_id,size' },
  )

  await db.from('warehouse_log').insert({
    product_id: productId,
    product_title: productTitle,
    size,
    quantity_change: delta,
    quantity_after: newQty,
    type,
    note: note || null,
    admin_username: adminUsername,
  })

  return {}
}

export async function getStockLog(limit = 150): Promise<StockLogEntry[]> {
  try {
    const { data } = await db
      .from('warehouse_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    return (data ?? []).map(r => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_title,
      size: r.size,
      quantityChange: r.quantity_change,
      quantityAfter: r.quantity_after,
      type: r.type as StockLogEntry['type'],
      note: r.note ?? '',
      adminUsername: r.admin_username,
      createdAt: r.created_at,
    }))
  } catch { return [] }
}
