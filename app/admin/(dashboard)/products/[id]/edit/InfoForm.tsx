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
      toast('Product information saved successfully')
      router.push('/admin/products')
    } else if (state.error) {
      toast(state.error, 'error')
    }
  }, [state])

  return (
    <div className="admin-form-card">
      <form action={action}>
        <p className="admin-form-section-title">Product Information</p>

        <div className="admin-form-group">
          <label htmlFor="title">Product Name *</label>
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
          <label>Available Sizes *</label>
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
          <label htmlFor="colors">Color Options</label>
          <input id="colors" name="colors" type="text" className="admin-form-input"
            defaultValue={product.colors?.join(', ') ?? product.bg}
            placeholder="e.g. #0d0d0d, #f5f2ec, #1a3a5c" />
          <p className="admin-form-hint">Hex colors separated by commas</p>
        </div>

        <div className="admin-form-group">
          <label htmlFor="description">Product Description *</label>
          <textarea id="description" name="description" className="admin-form-textarea"
            defaultValue={product.description} required />
        </div>

        <div className="admin-form-divider" />
        <p className="admin-form-section-title">Product Details</p>

        <div className="admin-form-group">
          <label htmlFor="material">Material *</label>
          <textarea
            id="material" name="material" className="admin-form-textarea" rows={3}
            defaultValue={Array.isArray(product.material) ? product.material.join('\n') : product.material}
            placeholder={'e.g.\n100% Cotton Oxford\nBreathable & Lightweight'}
            required
          />
          <p className="admin-form-hint">One line = one material point</p>
        </div>


        <div className="admin-form-group">
          <label>Size Chart</label>
          <div className="admin-sizechart-table-wrap">
            <table className="admin-sizechart-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Length (cm)</th>
                  <th>Width (cm)</th>
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
            {isPending ? 'Saving...' : 'Save'}
          </button>
          <Link href="/admin/products" className="btn-admin-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
