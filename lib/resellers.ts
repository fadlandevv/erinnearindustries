import { db } from './db'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

// ── Types ─────────────────────────────────────────────────────

export type ResellerLevel = 'bronze' | 'silver' | 'gold'

export type Reseller = {
  id: string
  username: string
  passwordHash: string
  name: string
  phone: string
  level: ResellerLevel
  active: boolean
  createdAt: string
}

export type ResellerOrderItem = {
  productId: string
  title: string
  size: string
  qty: number
  unitPrice: number
  subtotal: number
}

export type ResellerOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type ResellerOrder = {
  id: string
  resellerId: string
  resellerUsername: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: ResellerOrderItem[]
  totalPrice: number
  commission: number
  status: ResellerOrderStatus
  note: string
  createdAt: string
}

// ── Mappers ───────────────────────────────────────────────────

function toReseller(row: Record<string, unknown>): Reseller {
  return {
    id: row.id as string,
    username: row.username as string,
    passwordHash: row.password_hash as string,
    name: row.name as string,
    phone: (row.phone as string) ?? '',
    level: (row.level as ResellerLevel) ?? 'bronze',
    active: (row.active as boolean) ?? true,
    createdAt: row.created_at as string,
  }
}

function toResellerOrder(row: Record<string, unknown>): ResellerOrder {
  return {
    id: row.id as string,
    resellerId: row.reseller_id as string,
    resellerUsername: row.reseller_username as string,
    customerName: row.customer_name as string,
    customerPhone: (row.customer_phone as string) ?? '',
    customerAddress: (row.customer_address as string) ?? '',
    items: (row.items as ResellerOrderItem[]) ?? [],
    totalPrice: (row.total_price as number) ?? 0,
    commission: (row.commission as number) ?? 0,
    status: (row.status as ResellerOrderStatus) ?? 'pending',
    note: (row.note as string) ?? '',
    createdAt: row.created_at as string,
  }
}

// ── Password ──────────────────────────────────────────────────

export function hashResellerPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64)
  return `${salt}:${derived.toString('hex')}`
}

export function verifyResellerPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    const hashBuffer = Buffer.from(hash, 'hex')
    const derived = scryptSync(password, salt, 64)
    return timingSafeEqual(hashBuffer, derived)
  } catch { return false }
}

// ── Reseller CRUD ─────────────────────────────────────────────

export async function getResellerById(id: string): Promise<Reseller | undefined> {
  const { data } = await db.from('resellers').select('*').eq('id', id).maybeSingle()
  return data ? toReseller(data) : undefined
}

export async function getResellerByUsername(username: string): Promise<Reseller | undefined> {
  const { data } = await db.from('resellers').select('*').ilike('username', username).maybeSingle()
  return data ? toReseller(data) : undefined
}

export async function getResellers(): Promise<Reseller[]> {
  const { data } = await db.from('resellers').select('*').order('created_at', { ascending: true })
  return (data ?? []).map(toReseller)
}

export async function saveReseller(reseller: Reseller): Promise<void> {
  const { error } = await db.from('resellers').upsert({
    id: reseller.id,
    username: reseller.username,
    password_hash: reseller.passwordHash,
    name: reseller.name,
    phone: reseller.phone,
    level: reseller.level,
    active: reseller.active,
    created_at: reseller.createdAt,
  })
  if (error) throw new Error(error.message)
}

export async function deleteReseller(id: string): Promise<void> {
  await db.from('resellers').delete().eq('id', id)
}

// ── Reseller Orders CRUD ──────────────────────────────────────

export async function getResellerOrders(resellerId: string): Promise<ResellerOrder[]> {
  const { data } = await db
    .from('reseller_orders')
    .select('*')
    .eq('reseller_id', resellerId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(toResellerOrder)
}

export async function getAllResellerOrders(): Promise<ResellerOrder[]> {
  const { data } = await db
    .from('reseller_orders')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []).map(toResellerOrder)
}

export async function saveResellerOrder(order: ResellerOrder): Promise<void> {
  const { error } = await db.from('reseller_orders').upsert({
    id: order.id,
    reseller_id: order.resellerId,
    reseller_username: order.resellerUsername,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    items: order.items,
    total_price: order.totalPrice,
    commission: order.commission,
    status: order.status,
    note: order.note,
    created_at: order.createdAt,
  })
  if (error) throw new Error(error.message)
}

export async function updateResellerOrderStatus(
  id: string,
  status: ResellerOrderStatus,
  commission?: number,
): Promise<void> {
  const update: Record<string, unknown> = { status }
  if (commission !== undefined) update.commission = commission
  const { error } = await db.from('reseller_orders').update(update).eq('id', id)
  if (error) throw new Error(error.message)
}
