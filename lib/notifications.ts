import { db } from './db'
import type { Permission } from './rbac-types'

export type NotifKind = 'order' | 'chat' | 'contact'

export type AdminNotification = {
  id: string
  kind: NotifKind
  title: string
  body: string
  href: string
  createdAt: string
  /** Permission yang harus dimiliki role untuk melihat notifikasi ini. */
  permission: Permission
  /** Sudah ditandai terbaca di database (khusus chat). */
  read: boolean
}

/** Ambil hanya yang baru; panel notifikasi tidak perlu riwayat penuh. */
const RECENT_DAYS = 14
const MAX_PER_KIND = 20

const sinceIso = () => new Date(Date.now() - RECENT_DAYS * 86400_000).toISOString()

const trim = (s: string, n = 90) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s)

/**
 * Kumpulan notifikasi untuk panel admin, digabung dari tiga sumber:
 * pesanan masuk, chat pelanggan yang belum dibaca, dan pesan kontak baru.
 *
 * Difilter berdasarkan permission role — admin yang tidak punya akses Orders
 * tidak boleh melihat bocoran isi pesanan lewat notifikasi.
 */
export async function getAdminNotifications(
  permissions: Permission[],
  isSuperAdmin = false,
): Promise<AdminNotification[]> {
  const can = (p: Permission) => isSuperAdmin || permissions.includes(p)
  const since = sinceIso()
  const out: AdminNotification[] = []

  const [orders, chats, contacts] = await Promise.all([
    can('orders')
      ? db.from('orders').select('id,created_at,status,customer,total_price')
          .gte('created_at', since).order('created_at', { ascending: false }).limit(MAX_PER_KIND)
      : Promise.resolve({ data: null }),
    can('orders')
      ? db.from('order_messages').select('id,order_id,sender,sender_name,message,is_read,created_at')
          .eq('sender', 'customer').eq('is_read', false)
          .order('created_at', { ascending: false }).limit(MAX_PER_KIND)
      : Promise.resolve({ data: null }),
    can('messages')
      ? db.from('contact_messages').select('id,name,message,status,created_at')
          .eq('status', 'new').order('created_at', { ascending: false }).limit(MAX_PER_KIND)
      : Promise.resolve({ data: null }),
  ])

  for (const o of orders.data ?? []) {
    const customer = o.customer as { name?: string } | null
    out.push({
      id: `order-${o.id}`,
      kind: 'order',
      title: `Pesanan baru #${String(o.id).slice(-6).toUpperCase()}`,
      body: `${customer?.name ?? 'Pelanggan'} — Rp ${Number(o.total_price ?? 0).toLocaleString('id-ID')}`,
      href: '/admin/orders',
      createdAt: o.created_at as string,
      permission: 'orders',
      read: false,
    })
  }

  for (const m of chats.data ?? []) {
    out.push({
      id: `chat-${m.id}`,
      kind: 'chat',
      title: `Chat dari ${m.sender_name ?? 'pelanggan'}`,
      body: trim(String(m.message ?? '')),
      href: '/admin/orders',
      createdAt: m.created_at as string,
      permission: 'orders',
      read: false,
    })
  }

  for (const c of contacts.data ?? []) {
    out.push({
      id: `contact-${c.id}`,
      kind: 'contact',
      title: `Pesan dari ${c.name ?? 'pengunjung'}`,
      body: trim(String(c.message ?? '')),
      href: '/admin/messages',
      createdAt: c.created_at as string,
      permission: 'messages',
      read: false,
    })
  }

  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}
