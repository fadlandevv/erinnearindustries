import { db } from './db'

export type ProductConfig = Record<string, number>

// Defaults per product — matches hardcoded values in CustomDesignClient
export const PRODUCT_CONFIG_DEFAULTS: Record<string, ProductConfig> = {
  tshirt:            { logo_combo_price: 10000 },
  hoodie:            { logo_combo_price: 10000 },
  jersey:            { logo_combo_price: 10000 },
  'coach-jacket':    { logo_combo_price: 10000 },
  totebag:           { logo_combo_price: 10000, price_front: 30000, price_both: 45000, min_qty: 1 },
  'amplop-packaging':{ price_front: 1500, price_both: 2200, surcharge_a3: 1100, perekat_a4: 300, perekat_a3: 500, min_qty_a4: 100, min_qty_a3: 500 },
}

export async function getProductConfig(productType: string): Promise<ProductConfig> {
  const defaults = PRODUCT_CONFIG_DEFAULTS[productType] ?? {}
  try {
    const { data } = await db
      .from('custom_product_config')
      .select('key, value')
      .eq('product_type', productType)
    if (!data || data.length === 0) return defaults
    const dbMap = Object.fromEntries(data.map(r => [r.key as string, r.value as number]))
    return { ...defaults, ...dbMap }
  } catch {
    return defaults
  }
}

export async function upsertProductConfig(productType: string, key: string, value: number): Promise<void> {
  await db.from('custom_product_config').upsert(
    { product_type: productType, key, value },
    { onConflict: 'product_type,key' }
  )
}
