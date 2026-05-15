import { db } from './db'

export type SizeEntry = {
  size: string
  quantity: number
  harga: number | null
  hpp: number | null
}

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

export async function getProductSizeEntries(productId: string, sizes: string[]): Promise<SizeEntry[]> {
  const { data, error } = await db
    .from('warehouse_stock')
    .select('size,quantity,harga,hpp')
    .eq('product_id', productId)
  if (error) throw new Error(error.message)
  const map: Record<string, { quantity: number; harga: number | null; hpp: number | null }> = {}
  for (const row of data ?? []) {
    map[row.size] = { quantity: row.quantity, harga: row.harga ?? null, hpp: row.hpp ?? null }
  }
  const effectiveSizes = sizes.length > 0 ? sizes : ['-']
  return effectiveSizes.map(size => ({
    size,
    quantity: map[size]?.quantity ?? 0,
    harga: map[size]?.harga ?? null,
    hpp: map[size]?.hpp ?? null,
  }))
}

export async function upsertSizeEntry(
  productId: string,
  productTitle: string,
  size: string,
  quantity: number,
  harga: number | null,
  hpp: number | null,
  adminUsername: string,
): Promise<{ error?: string }> {
  const { data: current } = await db
    .from('warehouse_stock')
    .select('quantity')
    .eq('product_id', productId)
    .eq('size', size)
    .maybeSingle()

  const currentQty: number = current?.quantity ?? 0
  const delta = quantity - currentQty

  const { error: upsertErr } = await db.from('warehouse_stock').upsert(
    { product_id: productId, size, quantity, harga, hpp, updated_at: new Date().toISOString() },
    { onConflict: 'product_id,size' },
  )
  if (upsertErr) return { error: upsertErr.message }

  if (delta !== 0) {
    await db.from('warehouse_log').insert({
      product_id: productId,
      product_title: productTitle,
      size,
      quantity_change: delta,
      quantity_after: quantity,
      type: 'koreksi',
      note: 'Diperbarui dari halaman produk',
      admin_username: adminUsername,
    })
  }

  return {}
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

  const { error: upsertErr } = await db.from('warehouse_stock').upsert(
    { product_id: productId, size, quantity: newQty, updated_at: new Date().toISOString() },
    { onConflict: 'product_id,size' },
  )
  if (upsertErr) return { error: upsertErr.message }

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
