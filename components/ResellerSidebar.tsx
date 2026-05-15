'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { resellerLogout } from '@/lib/actions'

type NavItem = { label: string; href: string; icon: string }

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     href: '/reseller/dashboard',          icon: '◉' },
  { label: 'Produk',        href: '/reseller/dashboard/products', icon: '◈' },
  { label: 'Pesanan',       href: '/reseller/dashboard/orders',   icon: '◷' },
  { label: 'Penghasilan',   href: '/reseller/dashboard/earnings', icon: '◱' },
  { label: 'Materi Promo',  href: '/reseller/dashboard/promo',    icon: '◧' },
]

type Props = {
  resellerName: string
  level: string
}

export default function ResellerSidebar({ resellerName, level }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function close() { setMobileOpen(false) }

  function isActive(href: string) {
    if (href === '/reseller/dashboard') return pathname === '/reseller/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile top header */}
      <div className="admin-mobile-header">
        <div className="admin-mobile-brand">
          <span className="admin-sidebar-brand-mark" style={{ background: '#16a34a', color: '#fff' }}>RS</span>
          Reseller Portal
        </div>
        <button className="admin-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          ☰
        </button>
      </div>

      {mobileOpen && <div className="admin-sidebar-overlay" onClick={close} />}

      <aside className={`admin-sidebar${mobileOpen ? ' admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-mark" style={{ background: '#16a34a', color: '#fff' }}>RS</span>
          Reseller Portal
          <button className="admin-sidebar-close" onClick={close} aria-label="Close menu">✕</button>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`admin-nav-item${isActive(item.href) ? ' rs-nav-item active' : ''}`}
            >
              <span style={{ fontSize: '0.9rem', opacity: isActive(item.href) ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="rs-sidebar-user">
            <span className="rs-sidebar-user-name">{resellerName}</span>
            <span className={`rs-level-badge rs-level-badge--${level}`}>{level}</span>
          </div>
          <form action={resellerLogout}>
            <button type="submit" className="admin-logout-btn rs-logout-btn">
              <span>↩</span> Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
