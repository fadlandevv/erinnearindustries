'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteProduct, duplicateProduct, reorderProducts } from '@/lib/actions'
import RelativeTime from '@/components/RelativeTime'
import type { Product } from '@/lib/data'

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const [items, setItems] = useState(products)
  const dragIdx = useRef<number | null>(null)
  const [saving, setSaving] = useState(false)

  function onDragStart(i: number) {
    dragIdx.current = i
  }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === i) return
    const next = [...items]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(i, 0, moved)
    dragIdx.current = i
    setItems(next)
  }

  async function onDrop() {
    if (saving) return
    setSaving(true)
    await reorderProducts(items.map(p => p.id))
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="admin-table-wrap">
      {saving && <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: 8 }}>Menyimpan urutan...</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: 28 }}></th>
            <th>Warna</th>
            <th>Nama Produk</th>
            <th>Tag</th>
            <th>Diperbarui</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="admin-empty">Belum ada produk. Tambahkan produk pertama.</td>
            </tr>
          )}
          {items.map((p, i) => {
            const deleteAction = deleteProduct.bind(null, p.id)
            const duplicateAction = duplicateProduct.bind(null, p.id)
            return (
              <tr key={p.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDrop={onDrop}
                style={{ cursor: 'grab' }}>
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
