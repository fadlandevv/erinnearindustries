import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import { getAdminById, getRoleById, hasPermission, type Permission, type Role, type AdminAccount } from './rbac'
import { getResellerById, type Reseller } from './resellers'

/*
  Sesi bertanda tangan.

  Sebelumnya cookie menyimpan nilai mentah (`user-session` = email, `admin-token`
  = id admin) sehingga siapa pun bisa mengarangnya dan menyamar jadi orang lain.
  Sekarang setiap cookie berisi `<nilai>.<hmac>`; tanpa SESSION_SECRET tanda
  tangan tidak bisa dibuat, jadi cookie palsu langsung ditolak.

  Catatan deploy: SESSION_SECRET wajib diset di environment produksi (Vercel).
  Saat pertama kali dirilis semua sesi lama (format tanpa tanda tangan) menjadi
  tidak valid — pengguna dan admin perlu login ulang sekali. Itu memang tujuannya.
*/

const SECRET = process.env.SESSION_SECRET ?? ''

function sign(value: string): string {
  return createHmac('sha256', SECRET).update(value).digest('base64url')
}

/** Bungkus nilai jadi cookie bertanda tangan. */
export function signSession(value: string): string {
  if (!SECRET) throw new Error('SESSION_SECRET belum diset — sesi tidak bisa dibuat.')
  return `${value}.${sign(value)}`
}

/** Buka cookie bertanda tangan. Mengembalikan null bila rusak/palsu. */
export function unsignSession(cookieValue: string | undefined): string | null {
  if (!cookieValue || !SECRET) return null
  const idx = cookieValue.lastIndexOf('.')
  if (idx <= 0) return null // format lama tanpa tanda tangan → tolak
  const value = cookieValue.slice(0, idx)
  const provided = cookieValue.slice(idx + 1)
  const expected = sign(value)
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  return timingSafeEqual(a, b) ? value : null
}

/** Opsi cookie standar. `secure` aktif di produksi supaya tidak lewat HTTP polos. */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export const WEEK = 60 * 60 * 24 * 7
export const MONTH = 60 * 60 * 24 * 30

// ── Admin ─────────────────────────────────────────────────────

export type AdminSession = { admin: AdminAccount; role: Role | undefined }

/** Admin yang sedang login, atau null. Memvalidasi tanda tangan DAN keberadaan di DB. */
export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const jar = await cookies()
  const adminId = unsignSession(jar.get('admin-token')?.value)
  if (!adminId) return null
  const admin = await getAdminById(adminId)
  if (!admin) return null
  const role = await getRoleById(admin.roleId)
  return { admin, role }
}

export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Pagar untuk Server Action admin. Melempar AuthError bila belum login atau
 * role-nya tidak punya permission yang diminta.
 *
 * Server Action adalah endpoint HTTP publik — setiap action yang mengubah data
 * WAJIB melewati fungsi ini, bukan sekadar mengecek keberadaan cookie.
 */
export async function requireAdmin(permission?: Permission): Promise<AdminSession> {
  const session = await getCurrentAdmin()
  if (!session) throw new AuthError('Anda harus login sebagai admin.')
  if (permission && !session.role?.locked && !hasPermission(session.role, permission)) {
    throw new AuthError('Role Anda tidak memiliki akses ke fitur ini.')
  }
  return session
}

/** Versi yang mengembalikan objek error, untuk action yang sudah punya bentuk `{ error }`. */
export async function guardAdmin(
  permission?: Permission,
): Promise<{ session: AdminSession; error?: undefined } | { session?: undefined; error: string }> {
  try {
    return { session: await requireAdmin(permission) }
  } catch (e) {
    return { error: e instanceof AuthError ? e.message : 'Unauthorized' }
  }
}

// ── Pelanggan ─────────────────────────────────────────────────

/** Email pelanggan yang sedang login, atau null bila cookie tidak sah. */
export async function getCurrentUserEmail(): Promise<string | null> {
  const jar = await cookies()
  return unsignSession(jar.get('user-session')?.value)
}

export async function requireUserEmail(): Promise<string> {
  const email = await getCurrentUserEmail()
  if (!email) throw new AuthError('Anda harus login terlebih dahulu.')
  return email
}

// ── Reseller ──────────────────────────────────────────────────

export async function getCurrentReseller(): Promise<Reseller | null> {
  const jar = await cookies()
  const id = unsignSession(jar.get('reseller-token')?.value)
  if (!id) return null
  const reseller = await getResellerById(id)
  if (!reseller || !reseller.active) return null
  return reseller
}

export async function requireReseller(): Promise<Reseller> {
  const reseller = await getCurrentReseller()
  if (!reseller) throw new AuthError('Anda harus login sebagai reseller.')
  return reseller
}
