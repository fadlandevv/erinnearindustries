'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions'
import type { Permission } from '@/lib/rbac-types'

type NavChild = { label: string; href: string }
type NavItem = { label: string; href: string; icon: string; permission: Permission; children?: NavChild[] }
type NavGroup = { group: string; icon: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Overview',
    icon: '◉',
    items: [
      { label: 'Dashboard', href: '/admin', icon: '◉', permission: 'dashboard' },
    ],
  },
  {
    group: 'Konten',
    icon: '✎',
    items: [
      { label: 'Services', href: '/admin/services', icon: '✦', permission: 'services' },
      { label: 'Content',  href: '/admin/content',  icon: '✎', permission: 'content'  },
      { label: 'Showcase', href: '/admin/showcase', icon: '▣', permission: 'showcase' },
      { label: 'Gallery',  href: '/admin/gallery',  icon: '◧', permission: 'gallery'  },
    ],
  },
  {
    group: 'Custom Order',
    icon: '✦',
    items: [
      { label: 'Custom Products', href: '/admin/custom-products', icon: '◧', permission: 'custom_products' },
    ],
  },
  {
    group: 'Inventori',
    icon: '▦',
    items: [
      { label: 'Products', href: '/admin/products', icon: '◈', permission: 'products' },
      { label: 'Warehouse', href: '/admin/warehouse', icon: '▦', permission: 'warehouse' },
    ],
  },
  {
    group: 'Transaksi',
    icon: '◷',
    items: [
      { label: 'Orders',     href: '/admin/orders',     icon: '◷', permission: 'orders'     },
      { label: 'Rekap',      href: '/admin/rekap',      icon: '◱', permission: 'rekap'      },
      { label: 'Pembukuan',  href: '/admin/pembukuan',  icon: '◫', permission: 'pembukuan'  },
    ],
  },
  {
    group: 'Pengguna',
    icon: '◎',
    items: [
      { label: 'Account', href: '/admin/members', icon: '◎', permission: 'members' },
    ],
  },
  {
    group: 'Reseller',
    icon: '◈',
    items: [
      { label: 'Reseller', href: '/admin/reseller', icon: '◈', permission: 'reseller' },
    ],
  },
  {
    group: 'Sistem',
    icon: '⊞',
    items: [
      { label: 'Role Access', href: '/admin/roles',      icon: '⊞', permission: 'roles'      },
      { label: 'Access Log',  href: '/admin/access-log', icon: '◉', permission: 'access_log' },
    ],
  },
]

type Props = {
  permissions: Permission[]
  adminName: string
  roleName: string
  isSuperAdmin?: boolean
}

function ExpandableNavItem({
  item, pathname, onClose,
}: {
  item: NavItem
  pathname: string
  onClose: () => void
}) {
  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
  const [open, setOpen] = useState(isActive)

  return (
    <div>
      <button
        type="button"
        className={`admin-nav-item admin-nav-item-sub admin-nav-item-expandable${isActive ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="admin-nav-item-dot" />
        <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
        <svg
          className={`admin-nav-group-chevron${open ? ' open' : ''}`}
          width="9" height="9" viewBox="0 0 10 10" fill="none"
          style={{ marginRight: '0.2rem' }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && item.children && (
        <div className="admin-nav-nested">
          {item.children.map(child => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className={`admin-nav-item admin-nav-item-nested${childActive ? ' active' : ''}`}
              >
                <span className="admin-nav-item-dash">—</span>
                {child.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NavGroupSection({
  group, permissions, pathname, onClose,
}: {
  group: NavGroup
  permissions: Permission[]
  pathname: string
  onClose: () => void
}) {
  const visibleItems = group.items.filter(item => permissions.includes(item.permission))
  if (visibleItems.length === 0) return null

  const isGroupActive = visibleItems.some(item => {
    if (item.children) return item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'))
    return pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
  })
  const [open, setOpen] = useState(isGroupActive || group.group === 'Overview')

  return (
    <div className="admin-nav-group">
      <button
        type="button"
        className={`admin-nav-group-btn${isGroupActive ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="admin-nav-group-icon">{group.icon}</span>
        <span className="admin-nav-group-label">{group.group}</span>
        <svg
          className={`admin-nav-group-chevron${open ? ' open' : ''}`}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="admin-nav-group-items">
          {visibleItems.map(item =>
            item.children ? (
              <ExpandableNavItem key={item.href} item={item} pathname={pathname} onClose={onClose} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`admin-nav-item admin-nav-item-sub${
                  pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)) ? ' active' : ''
                }`}
              >
                <span className="admin-nav-item-dot" />
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminSidebar({ permissions, adminName, roleName, isSuperAdmin }: Props) {
  const pathname = usePathname()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [collapsed,   setCollapsed]   = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  function toggle() {
    setCollapsed(c => {
      localStorage.setItem('admin-sidebar-collapsed', String(!c))
      return !c
    })
  }

  function close() { setMobileOpen(false) }

  return (
    <>
      {/* Mobile top header */}
      <div className="admin-mobile-header">
        <div className="admin-mobile-brand">
          <span className="admin-sidebar-brand-mark">EI</span>
          Erinnear System
        </div>
        <button className="admin-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          ☰
        </button>
      </div>

      {mobileOpen && <div className="admin-sidebar-overlay" onClick={close} />}

      <aside className={`admin-sidebar${mobileOpen ? ' admin-sidebar-open' : ''}${collapsed ? ' admin-sidebar--collapsed' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-mark admin-sidebar-brand-toggle" onClick={toggle}>EI</span>
          <span className="admin-sidebar-brand-text">Erinnear System</span>
          <button className="admin-sidebar-collapse-btn" onClick={toggle} aria-label="Toggle sidebar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="admin-sidebar-close" onClick={close} aria-label="Close menu">✕</button>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_GROUPS.map(group => (
            <NavGroupSection
              key={group.group}
              group={group}
              permissions={permissions}
              pathname={pathname}
              onClose={close}
            />
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className={`admin-sidebar-footer-item${isSuperAdmin ? ' admin-footer-super' : ''}`}>
            <svg className="admin-nav-group-icon" width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="admin-footer-info">
              <div className="admin-footer-name">{adminName}</div>
              <div className="admin-footer-role">{roleName}</div>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="admin-logout-btn">
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
