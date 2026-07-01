import { db } from './db'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  passwordHash: string
  createdAt: string
}

function toUser(row: Record<string, string>): User {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone ?? undefined, passwordHash: row.password_hash, createdAt: row.created_at }
}

export async function getUsers(): Promise<User[]> {
  const { data } = await db.from('users').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(toUser)
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data } = await db.from('users').select('*').eq('id', id).maybeSingle()
  return data ? toUser(data) : undefined
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data } = await db.from('users').select('*').ilike('email', email).maybeSingle()
  return data ? toUser(data) : undefined
}

export async function saveUser(user: User): Promise<void> {
  await db.from('users').upsert({ id: user.id, name: user.name, email: user.email, phone: user.phone ?? null, password_hash: user.passwordHash, created_at: user.createdAt })
}

export async function updateUser(user: User): Promise<void> {
  await db.from('users').update({ name: user.name, email: user.email, phone: user.phone ?? null, password_hash: user.passwordHash }).eq('id', user.id)
}

export async function deleteUser(id: string): Promise<void> {
  await db.from('users').delete().eq('id', id)
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64)
  return `${salt}:${derived.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const hashBuffer = Buffer.from(hash, 'hex')
  const derived = scryptSync(password, salt, 64)
  return timingSafeEqual(hashBuffer, derived)
}

export async function createResetToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await db.from('password_reset_tokens').insert({
    token, user_email: email, expires_at: expiresAt, used: false,
  })
  return token
}

export async function validateAndConsumeResetToken(token: string): Promise<string | null> {
  const { data } = await db
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()
  if (!data) return null
  await db.from('password_reset_tokens').update({ used: true }).eq('token', token)
  return data.user_email as string
}
