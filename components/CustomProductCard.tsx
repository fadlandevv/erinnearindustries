'use client'
import Link from 'next/link'

type Props = {
  id: string
  name: string
  sub: string
  savedImage?: string
}

export default function CustomProductCard({ id, name, sub, savedImage }: Props) {
  return (
    <div className="admin-form-card" style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f0ede8', border: '1px solid #e8e4de' }}>
          {savedImage ? (
            <img src={savedImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>{name}</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>{sub}</div>
        </div>

        <Link href={`/admin/custom-products/${id}`} className="btn-admin-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.82rem' }}>
          Edit Produk
        </Link>
      </div>
    </div>
  )
}
