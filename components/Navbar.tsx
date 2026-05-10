'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

type NavbarProps = {
  user?: { name: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { totalItems, openCart } = useCart()
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

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
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? 'nav-link-active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
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
            <Link href="/profile" className="nav-user-btn nav-desktop-only">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              {user.name.split(' ')[0]}
            </Link>
          ) : (
            <Link href="/login" className="nav-login-btn nav-desktop-only">{t.nav.login}</Link>
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'nav-mobile-link-active' : ''}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

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
