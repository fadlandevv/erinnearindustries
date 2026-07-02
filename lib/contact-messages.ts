import { db } from './db'

export type MessageStatus = 'new' | 'read' | 'replied' | 'closed'

export type ContactMessage = {
  id: string
  name: string
  email: string
  phone?: string
  interest?: string
  message: string
  status: MessageStatus
  createdAt: string
}

function toMessage(row: Record<string, string>): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    interest: row.interest ?? undefined,
    message: row.message,
    status: (row.status as MessageStatus) ?? 'new',
    createdAt: row.created_at,
  }
}

export async function getContactMessages(limit = 500): Promise<ContactMessage[]> {
  const { data } = await db
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map(toMessage)
}

export async function getContactMessageById(id: string): Promise<ContactMessage | undefined> {
  const { data } = await db.from('contact_messages').select('*').eq('id', id).maybeSingle()
  return data ? toMessage(data) : undefined
}

export async function saveContactMessage(msg: ContactMessage): Promise<void> {
  await db.from('contact_messages').insert({
    id: msg.id,
    name: msg.name,
    email: msg.email,
    phone: msg.phone ?? null,
    interest: msg.interest ?? null,
    message: msg.message,
    status: msg.status,
    created_at: msg.createdAt,
  })
}

export async function updateMessageStatus(id: string, status: MessageStatus): Promise<void> {
  await db.from('contact_messages').update({ status }).eq('id', id)
}

export async function deleteContactMessage(id: string): Promise<void> {
  await db.from('contact_messages').delete().eq('id', id)
}

export async function countNewMessages(): Promise<number> {
  const { count } = await db
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')
  return count ?? 0
}
