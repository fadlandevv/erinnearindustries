import { db } from './db'

export type OrderItem = {
  productId: string
  title: string
  price: string
  unitPrice: number
  size: string
  quantity: number
  bg: string
  customDesignDepan?: string
  customDesignBelakang?: string
}

export type OrderCustomer = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  notes: string
}

export type Order = {
  id: string
  createdAt: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'expired'
  customer: OrderCustomer
  items: OrderItem[]
  totalPrice: number
  snapToken: string
}

function toOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    status: row.status as Order['status'],
    customer: row.customer as OrderCustomer,
    items: row.items as OrderItem[],
    totalPrice: row.total_price as number,
    snapToken: (row.snap_token as string) ?? '',
  }
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await db.from('orders').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(toOrder)
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data } = await db.from('orders').select('*').eq('id', id).maybeSingle()
  return data ? toOrder(data) : undefined
}

export async function saveOrder(order: Order): Promise<void> {
  const { error } = await db.from('orders').upsert({
    id: order.id,
    created_at: order.createdAt,
    status: order.status,
    customer: order.customer,
    items: order.items,
    total_price: order.totalPrice,
    snap_token: order.snapToken,
  })
  if (error) throw new Error(error.message)
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { error } = await db.from('orders').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const { data } = await db.from('orders').select('*')
    .ilike('customer->>email', email)
    .order('created_at', { ascending: false })
  return (data ?? []).map(toOrder)
}

export async function deleteOrder(id: string): Promise<void> {
  await db.from('orders').delete().eq('id', id)
}
