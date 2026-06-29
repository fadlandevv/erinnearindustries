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
    <div className="admin-form-card">
      <div className="admin-showcase-preview">
        {savedImage ? (
          <img src={savedImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div className="admin-gallery-empty" style={{ flexDirection: 'column', gap: 8, border: '1.5px dashed rgba(255,255,255,0.15)', margin: 12, borderRadius: 8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
            </svg>
            <span>Belum ada foto</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 14 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
          {name} <span style={{ fontWeight: 400, color: '#888' }}>· {sub}</span>
        </div>
        <Link href={`/admin/custom-products/${id}`} className="btn-admin-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.82rem' }}>
          Edit Produk
        </Link>
      </div>
    </div>
  )
}
