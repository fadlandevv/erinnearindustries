import fs from 'fs'
import path from 'path'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import type { Role, AdminAccount, Permission } from './rbac-types'

export type { Role, AdminAccount, Permission }
export { ALL_PERMISSIONS, PERMISSION_LABELS } from './rbac-types'

const DATA_DIR = path.join(process.cwd(), 'data')

// ── Role CRUD ─────────────────────────────────────────────────
function readRoles(): Role[] {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'roles.json'), 'utf-8')) }
  catch { return [] }
}

function writeRoles(roles: Role[]) {
  fs.writeFileSync(path.join(DATA_DIR, 'roles.json'), JSON.stringify(roles, null, 2))
}

export function getRoles(): Role[] { return readRoles() }

export function getRoleById(id: string): Role | undefined {
  return readRoles().find(r => r.id === id)
}

export function saveRole(role: Role) {
  const roles = readRoles()
  const idx = roles.findIndex(r => r.id === role.id)
  if (idx >= 0) roles[idx] = role
  else roles.push(role)
  writeRoles(roles)
}

export function deleteRole(id: string) {
  writeRoles(readRoles().filter(r => r.id !== id))
}

// ── Admin CRUD ────────────────────────────────────────────────
function readAdmins(): AdminAccount[] {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'admins.json'), 'utf-8')) }
  catch { return [] }
}

function writeAdmins(admins: AdminAccount[]) {
  fs.writeFileSync(path.join(DATA_DIR, 'admins.json'), JSON.stringify(admins, null, 2))
}

export function getAdmins(): AdminAccount[] { return readAdmins() }

export function getAdminById(id: string): AdminAccount | undefined {
  return readAdmins().find(a => a.id === id)
}

export function getAdminByUsername(username: string): AdminAccount | undefined {
  return readAdmins().find(a => a.username.toLowerCase() === username.toLowerCase())
}

export function saveAdmin(admin: AdminAccount) {
  const admins = readAdmins()
  const idx = admins.findIndex(a => a.id === admin.id)
  if (idx >= 0) admins[idx] = admin
  else admins.push(admin)
  writeAdmins(admins)
}

export function deleteAdmin(id: string) {
  writeAdmins(readAdmins().filter(a => a.id !== id))
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
