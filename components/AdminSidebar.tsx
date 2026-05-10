'use client'
import { useState } from 'react'
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
      { label: 'Products', href: '/admin/products', icon: '◈', permission: 'products' },
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
      { label: 'Pricing', href: '/admin/pricing', icon: '◈', permission: 'pricing' },
    ],
  },
  {
    group: 'Transaksi',
    icon: '◷',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: '◷', permission: 'orders' },
      { label: 'Rekap',  href: '/admin/rekap',  icon: '◱', permission: 'rekap'  },
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

export default function AdminSidebar({ permissions, adminName, roleName }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

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

      <aside className={`admin-sidebar${mobileOpen ? ' admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-mark">EI</span>
          Erinnear System
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
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
            <div style={{ fontWeight: 600, color: '#666' }}>{adminName}</div>
            <div>{roleName}</div>
          </div>
          <form action={logout}>
            <button type="submit" className="admin-logout-btn">
              <span>↩</span> Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
