'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { resellerLogout } from '@/lib/actions'

type NavChild = { label: string; href: string }
type NavItem  = { label: string; href: string; icon: string; children?: NavChild[] }

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    href: '/reseller/dashboard',          icon: '◉' },
  { label: 'Produk',       href: '/reseller/dashboard/products', icon: '◈' },
  { label: 'Pesanan',      href: '/reseller/dashboard/orders',   icon: '◷' },
  {
    label: 'Penghasilan',
    href:  '/reseller/dashboard/earnings',
    icon:  '◱',
    children: [
      { label: 'Grafik',   href: '/reseller/dashboard/earnings/grafik'   },
      { label: 'Insentif', href: '/reseller/dashboard/earnings/insentif' },
    ],
  },
  { label: 'Materi Promo', href: '/reseller/dashboard/promo',    icon: '◧' },
]

type Props = {
  resellerName: string
  level: string
}

export default function ResellerSidebar({ resellerName, level }: Props) {
  const pathname    = usePathname()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [collapsed,   setCollapsed]   = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('reseller-sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  function close() { setMobileOpen(false) }

  function toggle() {
    setCollapsed(c => {
      localStorage.setItem('reseller-sidebar-collapsed', String(!c))
      return !c
    })
  }

  function isActive(href: string) {
    if (href === '/reseller/dashboard') return pathname === '/reseller/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      <div className="admin-mobile-header">
        <div className="admin-mobile-brand">
          <span className="admin-sidebar-brand-mark" style={{ background: '#16a34a', color: '#fff' }}>RS</span>
          Reseller Portal
        </div>
        <button className="admin-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
      </div>

      {mobileOpen && <div className="admin-sidebar-overlay" onClick={close} />}

      <aside className={`admin-sidebar${mobileOpen ? ' admin-sidebar-open' : ''}${collapsed ? ' admin-sidebar--collapsed' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-mark admin-sidebar-brand-toggle" style={{ background: '#16a34a', color: '#fff' }} onClick={toggle}>RS</span>
          <span className="admin-sidebar-brand-text">Reseller Portal</span>
          <button className="admin-sidebar-collapse-btn" onClick={toggle} aria-label="Toggle sidebar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="admin-sidebar-close" onClick={close} aria-label="Close menu">✕</button>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map(item =>
            item.children ? (
              <ResellerNavGroup key={item.href} item={item} pathname={pathname} onClose={close} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`admin-nav-item${isActive(item.href) ? ' rs-nav-item active' : ''}`}
              >
                <span style={{ fontSize: '0.9rem', opacity: isActive(item.href) ? 1 : 0.6 }}>{item.icon}</span>
                <span className="admin-sidebar-brand-text">{item.label}</span>
              </Link>
            )
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-footer-item">
            <svg className="admin-nav-group-icon" width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="admin-footer-info">
              <div className="admin-footer-name">{resellerName}</div>
              <div className="admin-footer-role">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
            </div>
          </div>
          <form action={resellerLogout}>
            <button type="submit" className="admin-logout-btn rs-logout-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="admin-sidebar-brand-text">Logout</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

function ResellerNavGroup({
  item, pathname, onClose,
}: {
  item: NavItem
  pathname: string
  onClose: () => void
}) {
  const isGroupActive = pathname.startsWith(item.href)
  const [open, setOpen] = useState(isGroupActive)

  return (
    <div className="admin-nav-group">
      <button
        type="button"
        className={`admin-nav-group-btn${isGroupActive ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="admin-nav-group-icon" style={{ opacity: isGroupActive ? 1 : 0.6 }}>{item.icon}</span>
        <span className="admin-nav-group-label">{item.label}</span>
        <svg
          className={`admin-nav-group-chevron${open ? ' open' : ''}`}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && item.children && (
        <div className="admin-nav-group-items">
          {item.children.map(child => {
            const active = pathname === child.href || pathname.startsWith(child.href + '/')
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className={`admin-nav-item admin-nav-item-sub rs-nav-item${active ? ' active' : ''}`}
              >
                {child.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
