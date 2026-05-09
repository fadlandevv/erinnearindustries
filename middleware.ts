import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin auth — token is now the admin account ID (reject old 'authenticated' value)
  const adminToken = request.cookies.get('admin-token')
  const isAdminAuth = !!adminToken?.value
    && adminToken.value.length > 0
    && adminToken.value !== 'authenticated'

  if (pathname === '/admin/login') {
    if (isAdminAuth) return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.next()
  }
  if (pathname.startsWith('/admin')) {
    if (!isAdminAuth) return NextResponse.redirect(new URL('/admin/login', request.url))
    return NextResponse.next()
  }

  // Customer auth
  const userSession = request.cookies.get('user-session')
  const isUserAuth = !!userSession?.value

  if (pathname === '/login' || pathname === '/register') {
    if (isUserAuth) return NextResponse.redirect(new URL('/orders', request.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/orders') || pathname.startsWith('/profile')) {
    if (!isUserAuth) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*', '/profile/:path*', '/login', '/register'],
}
