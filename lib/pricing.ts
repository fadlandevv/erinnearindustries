import { db } from './db'

export type PricingItem = {
  id: string
  type: 'bahan' | 'sablon'
  label: string
  price: number
  isDefault: boolean
  updatedAt: string
}

export const PRICING_DEFAULTS: Omit<PricingItem, 'updatedAt' | 'isDefault'>[] = [
  { id: 'bahan-cc30s',  type: 'bahan',  label: 'Cotton Combed 30s', price: 45000 },
  { id: 'bahan-cc24s',  type: 'bahan',  label: 'Cotton Combed 24s', price: 55000 },
  { id: 'bahan-bamboo', type: 'bahan',  label: 'Cotton Bamboo',      price: 65000 },
  { id: 'bahan-drifit', type: 'bahan',  label: 'Drifit Polyester',   price: 50000 },
  { id: 'bahan-linen',  type: 'bahan',  label: 'Linen',              price: 70000 },
  { id: 'bahan-fleece', type: 'bahan',  label: 'Fleece',             price: 80000 },
  { id: 'sablon-logo',  type: 'sablon', label: 'Logo',               price: 15000 },
  { id: 'sablon-a4',    type: 'sablon', label: 'A4 — 21×30 cm',      price: 35000 },
  { id: 'sablon-a3',    type: 'sablon', label: 'A3 — 30×42 cm',      price: 50000 },
]

const DEFAULT_IDS = new Set(PRICING_DEFAULTS.map(d => d.id))

function rowToItem(row: Record<string, unknown>): PricingItem {
  const id = row.id as string
  return {
    id,
    type: row.type as 'bahan' | 'sablon',
    label: row.label as string,
    price: row.price as number,
    isDefault: DEFAULT_IDS.has(id),
    updatedAt: row.updated_at as string,
  }
}

export async function getPricingItems(): Promise<PricingItem[]> {
  try {
    const { data } = await db.from('custom_pricing').select('*')
    const dbMap = new Map((data ?? []).map(row => [row.id as string, rowToItem(row)]))

    // Defaults first (with DB-overridden prices), then custom items
    const result: PricingItem[] = PRICING_DEFAULTS.map(def =>
      dbMap.has(def.id)
        ? dbMap.get(def.id)!
        : { ...def, isDefault: true, updatedAt: '' }
    )

    for (const [id, item] of dbMap) {
      if (!DEFAULT_IDS.has(id)) result.push(item)
    }

    return result
  } catch {
    return PRICING_DEFAULTS.map(d => ({ ...d, isDefault: true, updatedAt: '' }))
  }
}

export async function upsertPricingItem(
  item: Pick<PricingItem, 'id' | 'type' | 'label' | 'price'>
): Promise<void> {
  await db.from('custom_pricing').upsert({
    id: item.id,
    type: item.type,
    label: item.label,
    price: item.price,
    updated_at: new Date().toISOString(),
  })
}

export async function insertPricingItem(
  type: 'bahan' | 'sablon',
  label: string,
  price: number
): Promise<void> {
  const id = `${type}-custom-${Date.now()}`
  await db.from('custom_pricing').insert({
    id,
    type,
    label,
    price,
    updated_at: new Date().toISOString(),
  })
}

export async function deletePricingItem(id: string): Promise<void> {
  if (DEFAULT_IDS.has(id)) return // never delete defaults
  await db.from('custom_pricing').delete().eq('id', id)
}
