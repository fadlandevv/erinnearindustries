'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { logoutUser } from '@/lib/actions'

type NavbarProps = {
  user?: { name: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems, openCart } = useCart()
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await logoutUser()
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.products, href: '/product' },
    { label: t.nav.services, href: '/service' },
    { label: t.nav.custom, href: '/custom' },
    { label: t.nav.reseller, href: '/reseller' },
    { label: t.nav.contact, href: '/contact' },
  ]

  const ThemeToggleBtn = ({ extraClass = '' }: { extraClass?: string }) => (
    <button
      className={`theme-toggle${theme === 'dark' ? ' theme-toggle--dark' : ''}${extraClass ? ` ${extraClass}` : ''}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-thumb" />
      <svg className="theme-toggle-icon theme-toggle-sun" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="4"/>
        <line x1="12" y1="20" x2="12" y2="22"/>
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
        <line x1="2" y1="12" x2="4" y2="12"/>
        <line x1="20" y1="12" x2="22" y2="12"/>
        <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/>
        <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>
      </svg>
      <svg className="theme-toggle-icon theme-toggle-moon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  )

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-mark">EI</span>
          <span className="nav-logo-text">Erinnear</span>
        </Link>

        <ul className="nav-links">
          {navLinks.map((link) => {
            const isCustom   = link.href === '/custom'
            const isReseller = link.href === '/reseller'
            const isActive   = isCustom
              ? pathname.startsWith('/custom')
              : pathname === link.href
            const base = isCustom ? 'nav-custom-link' : isReseller ? 'nav-reseller-link' : ''
            const cls = [
              base,
              isActive && !base ? 'nav-link-active' : '',
              isActive && base  ? `${base}--active`  : '',
            ].filter(Boolean).join(' ')
            return (
              <li key={link.href}>
                <Link href={link.href} className={cls || undefined}>
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="nav-actions">
          {/* Desktop only */}
          <div className="nav-switcher nav-desktop-only">
            <button className={`nav-switcher-btn${lang === 'id' ? ' nav-switcher-btn--active' : ''}`} onClick={() => setLang('id')}>ID</button>
            <button className={`nav-switcher-btn${lang === 'en' ? ' nav-switcher-btn--active' : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>

          {/* Cart — always visible */}
          <button className="nav-cart-btn" onClick={openCart} aria-label="Buka keranjang">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && <span className="nav-cart-badge">{totalItems}</span>}
          </button>

          {/* Desktop only */}
          {user ? (
            <div className="nav-user-menu nav-desktop-only" ref={userMenuRef}>
              <button
                type="button"
                className={`nav-user-btn${userMenuOpen ? ' nav-user-btn--open' : ''}`}
                onClick={() => setUserMenuOpen(v => !v)}
                aria-label="Menu profil"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </button>
              {userMenuOpen && (
                <div className="nav-user-dropdown">
                  <Link href="/profile" className="nav-user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    Profil Saya
                  </Link>
                  <Link href="/orders" className="nav-user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Riwayat Pesanan
                  </Link>
                  <div className="nav-user-dropdown-divider" />
                  <button type="button" className="nav-user-dropdown-item nav-user-dropdown-item--danger" onClick={handleLogout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="nav-login-btn nav-desktop-only" aria-label="Masuk">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>
          )}

          {/* Theme toggle — desktop only */}
          <ThemeToggleBtn extraClass="nav-desktop-only" />

          {/* Hamburger — mobile only */}
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-mobile">
          {/* Nav links */}
          {navLinks.map((link) => {
            const isCustom   = link.href === '/custom'
            const isReseller = link.href === '/reseller'
            const isActive   = isCustom
              ? pathname.startsWith('/custom')
              : pathname === link.href
            const base = isCustom ? 'nav-custom-link' : isReseller ? 'nav-reseller-link' : ''
            const cls = [
              base,
              isActive && !base ? 'nav-mobile-link-active' : '',
              isActive && base  ? `${base}--active`         : '',
            ].filter(Boolean).join(' ')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cls || undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            )
          })}

          <div className="nav-mobile-divider" />

          {/* Sign in / profile */}
          {user ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)}>{t.nav.profile}</Link>
              <Link href="/orders" onClick={() => setOpen(false)}>{t.nav.orders}</Link>
            </>
          ) : (
            <Link href="/login" className="nav-mobile-signin" onClick={() => setOpen(false)}>{t.nav.login}</Link>
          )}

          <div className="nav-mobile-divider" />

          {/* Controls: language + theme */}
          <div className="nav-mobile-controls">
            <div className="nav-switcher">
              <button className={`nav-switcher-btn${lang === 'id' ? ' nav-switcher-btn--active' : ''}`} onClick={() => setLang('id')}>ID</button>
              <button className={`nav-switcher-btn${lang === 'en' ? ' nav-switcher-btn--active' : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
            <ThemeToggleBtn />
          </div>
        </div>
      )}
    </nav>
  )
}
