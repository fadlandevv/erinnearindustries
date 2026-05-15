import { db } from './db'

export type OrderMessage = {
  id: string
  orderId: string
  sender: 'customer' | 'admin'
  senderName: string
  message: string
  createdAt: string
}

function toMsg(row: Record<string, unknown>): OrderMessage {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    sender: row.sender as 'customer' | 'admin',
    senderName: row.sender_name as string,
    message: row.message as string,
    createdAt: row.created_at as string,
  }
}

export async function getOrderMessages(orderId: string): Promise<OrderMessage[]> {
  const { data, error } = await db
    .from('order_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(toMsg)
}

export async function getMessagesByOrderIds(orderIds: string[]): Promise<OrderMessage[]> {
  if (!orderIds.length) return []
  const { data, error } = await db
    .from('order_messages')
    .select('*')
    .in('order_id', orderIds)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(toMsg)
}

export async function sendOrderMessage(msg: Omit<OrderMessage, 'createdAt'>): Promise<void> {
  const { error } = await db.from('order_messages').insert({
    id: msg.id,
    order_id: msg.orderId,
    sender: msg.sender,
    sender_name: msg.senderName,
    message: msg.message,
  })
  if (error) throw new Error(error.message)
}
