import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/*
  Middleware WAJIB menilai "sudah login" dengan cara yang sama seperti server.

  Sebelumnya di sini cuma dicek "cookie-nya ada atau tidak", sementara
  getCurrentAdmin()/getCurrentReseller() di server memverifikasi tanda tangan
  HMAC-nya. Begitu seseorang memegang cookie basi (format lama tanpa tanda
  tangan, atau ditandatangani SESSION_SECRET yang sudah diganti) keduanya tidak
  sepakat dan terjadi redirect loop tak berujung:

    /admin/login → (middleware lihat cookie) → /admin
    /admin       → (layout gagal verifikasi) → /admin/login → ...

  Korbannya tidak pernah sampai ke form login. Jadi di sini tanda tangannya
  ikut diverifikasi, dan cookie yang tidak sah langsung dihapus dari respons
  supaya browser yang sudah terlanjur bermasalah sembuh sendiri.

  Edge runtime tidak punya `node:crypto`, jadi HMAC-nya lewat Web Crypto.
*/

const SECRET = process.env.SESSION_SECRET ?? ''

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Padanan unsignSession() di lib/auth.ts. Mengembalikan null bila tidak sah. */
async function unsign(cookieValue: string | undefined): Promise<string | null> {
  if (!cookieValue || !SECRET) return null
  const idx = cookieValue.lastIndexOf('.')
  if (idx <= 0) return null // format lama tanpa tanda tangan → tolak
  const value = cookieValue.slice(0, idx)
  const provided = cookieValue.slice(idx + 1)

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  const expected = toBase64Url(sig)

  if (expected.length !== provided.length) return null
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i)
  return diff === 0 ? value : null
}

/** Lanjutkan, tapi buang cookie basi supaya tidak memicu loop di request berikutnya. */
function clearStale(res: NextResponse, name: string, present: boolean): NextResponse {
  if (present) res.cookies.delete(name)
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin ───────────────────────────────────────────────────
  const adminToken = request.cookies.get('admin-token')?.value
  const isAdminAuth = (await unsign(adminToken)) !== null

  if (pathname === '/admin/login') {
    if (isAdminAuth) return NextResponse.redirect(new URL('/admin', request.url))
    return clearStale(NextResponse.next(), 'admin-token', !!adminToken)
  }
  if (pathname.startsWith('/admin')) {
    if (!isAdminAuth) {
      return clearStale(
        NextResponse.redirect(new URL('/admin/login', request.url)),
        'admin-token',
        !!adminToken,
      )
    }
    return NextResponse.next()
  }

  // ── Reseller ────────────────────────────────────────────────
  const resellerToken = request.cookies.get('reseller-token')?.value
  const isResellerAuth = (await unsign(resellerToken)) !== null

  if (pathname === '/reseller/login') {
    if (isResellerAuth) return NextResponse.redirect(new URL('/reseller/dashboard', request.url))
    return clearStale(NextResponse.next(), 'reseller-token', !!resellerToken)
  }
  if (pathname.startsWith('/reseller/')) {
    if (!isResellerAuth) {
      return clearStale(
        NextResponse.redirect(new URL('/reseller/login', request.url)),
        'reseller-token',
        !!resellerToken,
      )
    }
    return NextResponse.next()
  }

  // ── Pelanggan ───────────────────────────────────────────────
  const userSession = request.cookies.get('user-session')?.value
  const isUserAuth = (await unsign(userSession)) !== null

  if (pathname === '/login' || pathname === '/register') {
    if (isUserAuth) return NextResponse.redirect(new URL('/profile', request.url))
    return clearStale(NextResponse.next(), 'user-session', !!userSession)
  }

  if (pathname.startsWith('/orders') || pathname.startsWith('/profile')) {
    if (!isUserAuth) {
      return clearStale(
        NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)),
        'user-session',
        !!userSession,
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/reseller/:path*', '/orders', '/orders/:path*', '/profile', '/profile/:path*', '/login', '/register'],
}
