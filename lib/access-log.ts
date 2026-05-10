import { db } from './db'

export type AccessAction = 'login' | 'logout' | 'login_failed'

export type AccessLogEntry = {
  id: string
  adminId: string
  username: string
  action: AccessAction
  ip: string
  createdAt: string
}

export async function logAdminAccess(
  entry: Omit<AccessLogEntry, 'id' | 'createdAt'>
): Promise<void> {
  try {
    await db.from('admin_access_log').insert({
      id: crypto.randomUUID(),
      admin_id: entry.adminId,
      username: entry.username,
      action: entry.action,
      ip: entry.ip,
      created_at: new Date().toISOString(),
    })
  } catch {
    // non-blocking — do not throw if log table doesn't exist yet
  }
}

export async function getAccessLog(limit = 200): Promise<AccessLogEntry[]> {
  try {
    const { data } = await db
      .from('admin_access_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []).map(row => ({
      id: row.id,
      adminId: row.admin_id ?? '',
      username: row.username,
      action: row.action as AccessAction,
      ip: row.ip ?? '—',
      createdAt: row.created_at,
    }))
  } catch {
    return []
  }
}
