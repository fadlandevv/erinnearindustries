import fs from 'fs'
import path from 'path'

export type OrderItem = {
  productId: string
  title: string
  price: string
  unitPrice: number
  size: string
  quantity: number
  bg: string
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

const FILE = path.join(process.cwd(), 'data', 'orders.json')

export function getOrders(): Order[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'))
  } catch {
    return []
  }
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id)
}

export function saveOrder(order: Order) {
  const orders = getOrders()
  const idx = orders.findIndex((o) => o.id === order.id)
  if (idx >= 0) orders[idx] = order
  else orders.unshift(order)
  fs.writeFileSync(FILE, JSON.stringify(orders, null, 2))
}

export function updateOrderStatus(id: string, status: Order['status']) {
  const orders = getOrders().map((o) =>
    o.id === id ? { ...o, status } : o
  )
  fs.writeFileSync(FILE, JSON.stringify(orders, null, 2))
}

export function getOrdersByEmail(email: string): Order[] {
  return getOrders().filter(
    (o) => o.customer.email.toLowerCase() === email.toLowerCase()
  )
}

export function deleteOrder(id: string) {
  fs.writeFileSync(FILE, JSON.stringify(getOrders().filter((o) => o.id !== id), null, 2))
}
