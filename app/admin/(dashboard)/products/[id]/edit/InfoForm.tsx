'use client'
import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateProductInfo } from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'
import type { Product } from '@/lib/data'

const tagOptions = ['New Arrival', 'Best Seller', 'Limited', 'Sale', 'Coming Soon']
const sizeOptions = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']

type Props = {
  product: Product
  sizechartData: Record<string, { panjang?: number; lebar?: number }>
}

export default function InfoForm({ product, sizechartData }: Props) {
  const { toast } = useAdminToast()
  const router = useRouter()
  const [state, action, isPending] = useActionState(
    updateProductInfo.bind(null, product.id),
    null
  )

  useEffect(() => {
    if (!state) return
    if (state.ok) {
      toast('Informasi produk berhasil disimpan')
      router.refresh()
    } else if (state.error) {
      toast(state.error, 'error')
    }
  }, [state])

  return (
    <div className="admin-form-card">
      <form action={action}>
        <p className="admin-form-section-title">Informasi Produk</p>

        <div className="admin-form-group">
          <label htmlFor="title">Nama Produk *</label>
          <input id="title" name="title" type="text" className="admin-form-input"
            defaultValue={product.title} required />
        </div>

        <div className="admin-form-group">
          <label htmlFor="tag">Tag *</label>
          <select id="tag" name="tag" className="admin-form-select" defaultValue={product.tag} required>
            {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="admin-form-group">
          <label>Ukuran Tersedia *</label>
          <div className="admin-size-checkboxes">
            {sizeOptions.map(size => (
              <label key={size} className="admin-size-check">
                <input type="checkbox" name="sizes" value={size}
                  defaultChecked={product.sizes.includes(size)} />
                <span>{size}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="admin-form-group">
          <label htmlFor="colors">Pilihan Warna</label>
          <input id="colors" name="colors" type="text" className="admin-form-input"
            defaultValue={product.colors?.join(', ') ?? product.bg}
            placeholder="cth. #0d0d0d, #f5f2ec, #1a3a5c" />
          <p className="admin-form-hint">Hex warna dipisah koma</p>
        </div>

        <div className="admin-form-group">
          <label htmlFor="description">Deskripsi Produk *</label>
          <textarea id="description" name="description" className="admin-form-textarea"
            defaultValue={product.description} required />
        </div>

        <div className="admin-form-divider" />
        <p className="admin-form-section-title">Detail Produk</p>

        <div className="admin-form-group">
          <label htmlFor="material">Material *</label>
          <textarea
            id="material" name="material" className="admin-form-textarea" rows={3}
            defaultValue={Array.isArray(product.material) ? product.material.join('\n') : product.material}
            placeholder={'cth.\n100% Cotton Oxford\nBreathable & Lightweight'}
            required
          />
          <p className="admin-form-hint">Satu baris = satu poin material</p>
        </div>

        <div className="admin-form-group">
          <label>Harga Reseller (Rp)</label>
          <input
            name="price_reseller"
            type="number"
            min={0}
            className="admin-form-input"
            defaultValue={product.priceReseller ?? ''}
            placeholder="cth. 85000"
          />
          <p className="admin-form-hint">Harga khusus untuk reseller (kosongkan jika belum diset)</p>
        </div>

        <div className="admin-form-group">
          <label>Size Chart</label>
          <div className="admin-sizechart-table-wrap">
            <table className="admin-sizechart-table">
              <thead>
                <tr>
                  <th>Ukuran</th>
                  <th>Panjang (cm)</th>
                  <th>Lebar (cm)</th>
                </tr>
              </thead>
              <tbody>
                {sizeOptions.map(size => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td><input name={`sc_p_${size}`} type="number" min={0} className="admin-sizechart-input" defaultValue={sizechartData[size]?.panjang ?? ''} placeholder="—" /></td>
                    <td><input name={`sc_l_${size}`} type="number" min={0} className="admin-sizechart-input" defaultValue={sizechartData[size]?.lebar ?? ''} placeholder="—" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-form-divider" />
        <div className="admin-form-actions">
          <button type="submit" className="btn-admin-primary" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
          <Link href="/admin/products" className="btn-admin-secondary">Batal</Link>
        </div>
      </form>
    </div>
  )
}
