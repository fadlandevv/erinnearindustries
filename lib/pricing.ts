import { db } from './db'

export type PricingItem = {
  id: string
  type: 'bahan' | 'sablon'
  label: string
  price: number
  updatedAt: string
}

export const PRICING_DEFAULTS: Omit<PricingItem, 'updatedAt'>[] = [
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

export async function getPricingItems(): Promise<PricingItem[]> {
  try {
    const { data } = await db
      .from('custom_pricing')
      .select('*')
      .order('type', { ascending: false })
      .order('label')
    if (!data || data.length === 0) throw new Error('empty')
    return data.map(row => ({
      id: row.id,
      type: row.type as 'bahan' | 'sablon',
      label: row.label,
      price: row.price,
      updatedAt: row.updated_at,
    }))
  } catch {
    return PRICING_DEFAULTS.map(d => ({ ...d, updatedAt: new Date().toISOString() }))
  }
}

export async function upsertPricingItem(id: string, price: number): Promise<void> {
  const def = PRICING_DEFAULTS.find(d => d.id === id)
  if (!def) return
  await db.from('custom_pricing').upsert({
    id,
    type: def.type,
    label: def.label,
    price,
    updated_at: new Date().toISOString(),
  })
}
