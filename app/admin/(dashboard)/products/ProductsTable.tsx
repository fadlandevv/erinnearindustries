'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteProduct, duplicateProduct, reorderProducts } from '@/lib/actions'
import RelativeTime from '@/components/RelativeTime'
import type { Product } from '@/lib/data'

type SortKey = 'title' | 'tag' | 'updatedAt'
type SortDir = 'asc' | 'desc'

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const [items, setItems] = useState(products)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const dragIdx = useRef<number | null>(null)
  const [saving, setSaving] = useState(false)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const displayed = sortKey
    ? [...items].sort((a, b) => {
        const av = sortKey === 'updatedAt' ? (a.updatedAt ?? '') : ((a[sortKey] ?? '') as string).toLowerCase()
        const bv = sortKey === 'updatedAt' ? (b.updatedAt ?? '') : ((b[sortKey] ?? '') as string).toLowerCase()
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    : items

  function onDragStart(i: number) { dragIdx.current = i }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === i) return
    const next = [...items]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(i, 0, moved)
    dragIdx.current = i
    setSortKey(null)
    setItems(next)
  }

  async function onDrop() {
    if (saving) return
    setSaving(true)
    await reorderProducts(items.map(p => p.id))
    setSaving(false)
    router.refresh()
  }

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
      {saving && <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: 8 }}>Saving order...</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: 28 }}></th>
            <th>Color</th>
            <SortTh label="Product Name" k="title" />
            <SortTh label="Tag" k="tag" />
            <SortTh label="Updated" k="updatedAt" />
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayed.length === 0 && (
            <tr>
              <td colSpan={6} className="admin-empty">No products yet. Add your first product.</td>
            </tr>
          )}
          {displayed.map((p, i) => {
            const deleteAction = deleteProduct.bind(null, p.id)
            const duplicateAction = duplicateProduct.bind(null, p.id)
            return (
              <tr key={p.id}
                draggable={!sortKey}
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDrop={onDrop}
                style={{ cursor: sortKey ? 'default' : 'grab' }}>
                <td style={{ color: '#ccc', fontSize: '0.9rem', textAlign: 'center' }}>⠿</td>
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
                      <button type="submit" className="btn-admin-secondary">Duplicate</button>
                    </form>
                    <form action={deleteAction}>
                      <button type="submit" className="btn-admin-danger">Delete</button>
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
