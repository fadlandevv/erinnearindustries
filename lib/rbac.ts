import { db } from './db'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import type { Role, AdminAccount, Permission } from './rbac-types'

export type { Role, AdminAccount, Permission }
export { ALL_PERMISSIONS, PERMISSION_LABELS } from './rbac-types'

// ── Role CRUD ─────────────────────────────────────────────────

export async function getRoles(): Promise<Role[]> {
  const { data } = await db.from('roles').select('*').order('name')
  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    permissions: row.permissions ?? [],
    locked: row.locked ?? false,
  }))
}

export async function getRoleById(id: string): Promise<Role | undefined> {
  const { data } = await db.from('roles').select('*').eq('id', id).maybeSingle()
  if (!data) return undefined
  return { id: data.id, name: data.name, permissions: data.permissions ?? [], locked: data.locked ?? false }
}

export async function saveRole(role: Role): Promise<void> {
  await db.from('roles').upsert({ id: role.id, name: role.name, permissions: role.permissions, locked: role.locked ?? false })
}

export async function deleteRole(id: string): Promise<void> {
  await db.from('roles').delete().eq('id', id)
}

// ── Admin CRUD ────────────────────────────────────────────────

function toAdmin(row: Record<string, string>): AdminAccount {
  return { id: row.id, username: row.username, passwordHash: row.password_hash, roleId: row.role_id, createdAt: row.created_at }
}

export async function getAdmins(): Promise<AdminAccount[]> {
  const { data } = await db.from('admins').select('*').order('created_at')
  return (data ?? []).map(toAdmin)
}

export async function getAdminById(id: string): Promise<AdminAccount | undefined> {
  const { data } = await db.from('admins').select('*').eq('id', id).maybeSingle()
  return data ? toAdmin(data) : undefined
}

export async function getAdminByUsername(username: string): Promise<AdminAccount | undefined> {
  const { data } = await db.from('admins').select('*').ilike('username', username).maybeSingle()
  return data ? toAdmin(data) : undefined
}

export async function saveAdmin(admin: AdminAccount): Promise<void> {
  await db.from('admins').upsert({ id: admin.id, username: admin.username, password_hash: admin.passwordHash, role_id: admin.roleId, created_at: admin.createdAt })
}

export async function deleteAdmin(id: string): Promise<void> {
  await db.from('admins').delete().eq('id', id)
}

// ── Password ──────────────────────────────────────────────────

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64)
  return `${salt}:${derived.toString('hex')}`
}

export function verifyAdminPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    const hashBuffer = Buffer.from(hash, 'hex')
    const derived = scryptSync(password, salt, 64)
    return timingSafeEqual(hashBuffer, derived)
  } catch { return false }
}

export function hasPermission(role: Role | undefined, page: Permission): boolean {
  return role?.permissions.includes(page) ?? false
}
