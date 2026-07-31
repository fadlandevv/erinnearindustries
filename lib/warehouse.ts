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
  const { data: current, error: selectErr } = await db
    .from('warehouse_stock')
    .select('id,quantity')
    .eq('product_id', productId)
    .eq('size', size)
    .maybeSingle()

  if (selectErr) return { error: selectErr.message }

  const currentQty: number = current?.quantity ?? 0
  const delta = quantity - currentQty

  if (current) {
    const { error } = await db
      .from('warehouse_stock')
      .update({ quantity, harga, hpp, updated_at: new Date().toISOString() })
      .eq('id', current.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await db
      .from('warehouse_stock')
      .insert({ product_id: productId, size, quantity, harga, hpp })
    if (error) return { error: error.message }
  }

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

// ── Stok saat penjualan ───────────────────────────────────────
// Catatan: stok hanya ditegakkan untuk kombinasi product+size yang SUDAH punya
// baris di warehouse_stock. Produk yang belum didata gudang dianggap "tidak
// dilacak" dan tetap bisa dibeli — supaya toko tidak berhenti menjual hanya
// karena admin belum mengisi data gudang. Item custom (id `custom-*`) dilewati.

type StockLine = { productId: string; title: string; size: string; quantity: number }

function isTracked(productId: string): boolean {
  return !productId.startsWith('custom-')
}

/** Cek ketersediaan sebelum order dibuat. Mengembalikan daftar item yang kurang stok. */
export async function checkStockAvailability(
  lines: StockLine[],
): Promise<{ title: string; size: string; available: number }[]> {
  const tracked = lines.filter(l => isTracked(l.productId))
  if (tracked.length === 0) return []

  const stockMap = await getStockMap()
  const shortages: { title: string; size: string; available: number }[] = []

  // Gabungkan baris duplikat (produk+size sama) sebelum membandingkan.
  const needed = new Map<string, StockLine>()
  for (const l of tracked) {
    const key = `${l.productId}:${l.size}`
    const prev = needed.get(key)
    needed.set(key, prev ? { ...prev, quantity: prev.quantity + l.quantity } : { ...l })
  }

  for (const [key, line] of needed) {
    if (!(key in stockMap)) continue // tidak dilacak
    const available = stockMap[key]
    if (available < line.quantity) {
      shortages.push({ title: line.title, size: line.size, available })
    }
  }
  return shortages
}

/**
 * Kurangi stok setelah pembayaran sukses. Idempoten: bila order sudah pernah
 * diproses (ada di warehouse_log dengan note order yang sama), tidak dikurangi lagi
 * — penting karena Midtrans dapat mengirim webhook berkali-kali.
 */
export async function consumeStockForOrder(orderId: string): Promise<void> {
  const { data: order } = await db.from('orders').select('items').eq('id', orderId).maybeSingle()
  if (!order?.items) return

  const note = `Order ${orderId}`

  const { data: already } = await db
    .from('warehouse_log')
    .select('id')
    .eq('note', note)
    .limit(1)
  if (already && already.length > 0) return // sudah diproses

  const items = order.items as Array<{ productId: string; title: string; size: string; quantity: number }>

  for (const item of items) {
    if (!isTracked(item.productId)) continue

    // Update atomik lewat RPC — mencegah race condition saat dua pembeli
    // mengambil item terakhir bersamaan. Lihat supabase-schema.sql.
    const { data, error } = await db.rpc('consume_stock', {
      p_product_id: item.productId,
      p_size: item.size,
      p_qty: item.quantity,
    })

    if (error) {
      // RPC belum dibuat di Supabase → jangan gagalkan webhook, cukup catat.
      console.error(`[warehouse] consume_stock gagal untuk ${item.productId}:${item.size}:`, error.message)
      continue
    }

    const remaining = data as number | null
    if (remaining === null) continue // produk/size tidak dilacak

    await db.from('warehouse_log').insert({
      product_id: item.productId,
      product_title: item.title,
      size: item.size,
      quantity_change: -item.quantity,
      quantity_after: remaining,
      type: 'keluar',
      note,
      admin_username: 'system',
    })
  }
}

export async function getPriceMap(): Promise<Record<string, { harga: number | null; hpp: number | null }>> {
  try {
    const { data } = await db.from('warehouse_stock').select('product_id,size,harga,hpp')
    const map: Record<string, { harga: number | null; hpp: number | null }> = {}
    for (const row of data ?? []) {
      map[`${row.product_id}:${row.size}`] = { harga: row.harga ?? null, hpp: row.hpp ?? null }
    }
    return map
  } catch { return {} }
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
  const { data: current, error: selectErr } = await db
    .from('warehouse_stock')
    .select('id,quantity')
    .eq('product_id', productId)
    .eq('size', size)
    .maybeSingle()

  if (selectErr) return { error: selectErr.message }

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

  if (current) {
    const { error } = await db
      .from('warehouse_stock')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', current.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await db
      .from('warehouse_stock')
      .insert({ product_id: productId, size, quantity: newQty })
    if (error) return { error: error.message }
  }

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
