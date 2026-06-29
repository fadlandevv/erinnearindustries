'use client'
import { useState } from 'react'
import Link from 'next/link'
import { deleteProduct, duplicateProduct } from '@/lib/actions'
import RelativeTime from '@/components/RelativeTime'
import type { Product } from '@/lib/data'

type SortKey = 'title' | 'tag' | 'updatedAt'
type SortDir = 'asc' | 'desc'

export default function ProductsTable({ products }: { products: Product[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...products].sort((a, b) => {
    let av: string, bv: string
    if (sortKey === 'updatedAt') {
      av = a.updatedAt ?? ''
      bv = b.updatedAt ?? ''
    } else {
      av = (a[sortKey] ?? '').toLowerCase()
      bv = (b[sortKey] ?? '').toLowerCase()
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <th onClick={() => toggleSort(k)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}
      </th>
    )
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Warna</th>
            <SortTh label="Nama Produk" k="title" />
            <SortTh label="Tag" k="tag" />
            <SortTh label="Diperbarui" k="updatedAt" />
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="admin-empty">Belum ada produk. Tambahkan produk pertama.</td>
            </tr>
          )}
          {sorted.map((p) => {
            const deleteAction = deleteProduct.bind(null, p.id)
            const duplicateAction = duplicateProduct.bind(null, p.id)
            return (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {(p.colors ?? [p.bg]).slice(0, 3).map((c) => (
                      <span key={c} className="admin-color-swatch" style={{ background: c }} />
                    ))}
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{p.title}</td>
                <td><span className="admin-badge">{p.tag}</span></td>
                <td>
                  {p.updatedAt
                    ? <RelativeTime iso={p.updatedAt} />
                    : <span style={{ color: '#ccc', fontSize: '0.78rem' }}>—</span>}
                </td>
                <td>
                  <div className="admin-table-actions">
                    <Link href={`/admin/products/${p.id}/edit`} className="btn-admin-edit">Edit</Link>
                    <form action={duplicateAction}>
                      <button type="submit" className="btn-admin-secondary">Duplikat</button>
                    </form>
                    <form action={deleteAction}>
                      <button type="submit" className="btn-admin-danger">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
