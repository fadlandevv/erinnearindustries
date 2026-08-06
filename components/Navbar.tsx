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

const ANNOUNCEMENTS = [
  { id: 1, title: 'Koleksi Summer 2025 sudah tersedia!', date: '20 Jun 2025', href: '/berita/koleksi-summer-2025' },
  { id: 2, title: 'Promo Custom Order — Diskon 15%', date: '15 Jun 2025', href: '/berita/promo-custom-juni' },
  { id: 3, title: 'Tips Merawat Pakaian Custom Anda', date: '8 Jun 2025', href: '/berita/tips-merawat-pakaian' },
]

const NAV_ICONS: Record<string, React.ReactNode> = {
  /* Material Symbols Outlined — border_color */
  '/custom': (
    <svg className="nav-link-icon" width="15" height="15" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
      <path d="M80 0v-160h800V0H80Zm160-320h56l312-311-29-29-28-28-311 312v56Zm-80 80v-170l448-447q11-11 25.5-17t30.5-6q16 0 31 6t27 18l55 56q12 11 17.5 26t5.5 31q0 15-5.5 29.5T777-687L330-240H160Zm560-504-56-56 56 56ZM608-631l-29-29-28-28 57 57Z"/>
    </svg>
  ),
  /* Material Symbols Outlined — storefront */
  '/reseller': (
    <svg className="nav-link-icon" width="15" height="15" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
      <path d="M841-518v318q0 33-23.5 56.5T761-120H201q-33 0-56.5-23.5T121-200v-318q-23-21-35.5-54t-.5-72l42-136q8-26 28.5-43t47.5-17h556q27 0 47 16.5t29 43.5l42 136q12 39-.5 71T841-518Zm-272-42q27 0 41-18.5t11-41.5l-22-140h-78v148q0 21 14 36.5t34 15.5Zm-180 0q23 0 37.5-15.5T441-612v-148h-78l-22 140q-4 24 10.5 42t37.5 18Zm-178 0q18 0 31.5-13t16.5-33l22-154h-78l-40 134q-6 20 6.5 43t41.5 23Zm540 0q29 0 42-23t6-43l-42-134h-76l22 154q3 20 16.5 33t31.5 13ZM201-200h560v-282q-5 2-6.5 2H751q-27 0-47.5-9T663-518q-18 18-41 28t-49 10q-27 0-50.5-10T481-518q-17 18-39.5 28T393-480q-29 0-52.5-10T299-518q-21 21-41.5 29.5T211-480h-4.5q-2.5 0-5.5-2v282Zm560 0H201h560Z"/>
    </svg>
  ),
}

export default function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [userHover, setUserHover] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const userHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleUserMouseEnter() {
    if (userHoverTimeout.current) clearTimeout(userHoverTimeout.current)
    setUserHover(true)
  }
  function handleUserMouseLeave() {
    userHoverTimeout.current = setTimeout(() => setUserHover(false), 200)
  }
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems, openCart } = useCart()
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    setUserHover(false)
    await logoutUser()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
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
          <svg className="nav-logo-mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M 8 45 Q 0 45 0 37 L 0 7 Q 0 0 7 0 L 60 0 Q 100 0 100 40 L 100 100 L 57 100 L 57 57 Q 57 45 45 45 Z" fill="currentColor"/>
          </svg>
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
                  {NAV_ICONS[link.href]}
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="nav-actions">
          {/* Notification bell — desktop only */}
          <div className="nav-notif nav-desktop-only" ref={notifRef}>
            <button
              className={`nav-notif-btn${notifOpen ? ' nav-notif-btn--open' : ''}`}
              onClick={() => setNotifOpen(v => !v)}
              aria-label="Notifikasi"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="nav-notif-dot" />
            </button>
            {notifOpen && (
              <div className="nav-notif-dropdown">
                <div className="nav-notif-header">Pengumuman</div>
                {ANNOUNCEMENTS.map(a => (
                  <Link
                    key={a.id}
                    href={a.href}
                    className="nav-notif-item"
                    onClick={() => setNotifOpen(false)}
                  >
                    <span className="nav-notif-item-title">{a.title}</span>
                    <span className="nav-notif-item-date">{a.date}</span>
                  </Link>
                ))}
                <div className="nav-notif-footer">
                  <Link href="/berita" onClick={() => setNotifOpen(false)}>Lihat semua berita →</Link>
                </div>
              </div>
            )}
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

          {/* Profile icon with hover dropdown — desktop only */}
          <div
            className="nav-user-menu nav-desktop-only"
            ref={userMenuRef}
            onMouseEnter={handleUserMouseEnter}
            onMouseLeave={handleUserMouseLeave}
          >
            <button
              type="button"
              className={`nav-user-btn${userHover ? ' nav-user-btn--open' : ''}`}
              aria-label="Menu profil"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </button>

            {userHover && (
              <div className="nav-user-dropdown">
                {/* Controls: theme + language */}
                <div className="nav-dropdown-controls">
                  <div className="nav-dropdown-row">
                    <span className="nav-dropdown-row-label">{theme === 'dark' ? (lang === 'en' ? 'Dark' : 'Gelap') : (lang === 'en' ? 'Light' : 'Terang')}</span>
                    <ThemeToggleBtn />
                  </div>
                  <div className="nav-dropdown-row">
                    <span className="nav-dropdown-row-label">{lang === 'en' ? 'Language' : 'Bahasa'}</span>
                    <div className="nav-dropdown-lang">
                      <button className={`nav-dropdown-lang-btn${lang === 'id' ? ' nav-dropdown-lang-btn--active' : ''}`} onClick={() => setLang('id')}>ID</button>
                      <button className={`nav-dropdown-lang-btn${lang === 'en' ? ' nav-dropdown-lang-btn--active' : ''}`} onClick={() => setLang('en')}>EN</button>
                    </div>
                  </div>
                </div>
                <div className="nav-user-dropdown-divider" />

                {user ? (
                  <>
                    <Link href="/profile" className="nav-user-dropdown-item" onClick={() => setUserHover(false)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                      </svg>
                      Profil Saya
                    </Link>
                    <Link href="/orders" className="nav-user-dropdown-item" onClick={() => setUserHover(false)}>
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
                  </>
                ) : (
                  <Link href="/login" className="nav-user-dropdown-item" onClick={() => setUserHover(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    Masuk
                  </Link>
                )}
              </div>
            )}
          </div>

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
                {NAV_ICONS[link.href]}
                {link.label}
              </Link>
            )
          })}

          <div className="nav-mobile-divider" />

          {user ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)}>{t.nav.profile}</Link>
              <Link href="/orders" onClick={() => setOpen(false)}>{t.nav.orders}</Link>
            </>
          ) : (
            <Link href="/login" className="nav-mobile-signin" onClick={() => setOpen(false)}>{t.nav.login}</Link>
          )}

          <div className="nav-mobile-divider" />

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
