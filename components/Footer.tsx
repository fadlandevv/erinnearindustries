'use client'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const linkDefs = {
  Company: [
    { key: 'Home', href: '/' },
    { key: 'Product', href: '/product' },
    { key: 'Service', href: '/service' },
  ],
  Support: [
    { key: 'Contact Us', href: '/contact' },
    { key: 'Cek Pesanan', href: '/orders' },
  ],
}

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">Erinnear.</Link>
          {t.footer.tagline.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          <p className="footer-email">hello@erinnear.com</p>
        </div>
        <div className="footer-links">
          {(Object.entries(linkDefs) as [keyof typeof linkDefs, typeof linkDefs[keyof typeof linkDefs]][]).map(([group, items]) => (
            <div key={group} className="footer-col">
              <h5>{t.footer.groups[group]}</h5>
              <ul>
                {items.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href}>{t.footer.links[item.key as keyof typeof t.footer.links]}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t.footer.copyright}</p>
      </div>
    </footer>
  )
}
