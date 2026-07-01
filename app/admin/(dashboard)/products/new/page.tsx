import Link from 'next/link'
import { createProduct } from '@/lib/actions'
import ImageUploadField from '@/components/ImageUploadField'

const tagOptions = ['New Arrival', 'Best Seller', 'Limited', 'Sale', 'Coming Soon']
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

export default function NewProductPage() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Add Product</h1>
          <p className="admin-page-subtitle">Add a new product to the catalog</p>
        </div>
        <Link href="/admin/products" className="btn-admin-secondary">← Back</Link>
      </div>

      <div className="admin-form-card">
        <form action={createProduct}>
          <div className="admin-product-layout">

            {/* ── Left ── */}
            <div className="admin-product-info">

              {/* Section: Product Information */}
              <p className="admin-form-section-title">Product Information</p>

              <div className="admin-form-group">
                <label htmlFor="title">Product Name *</label>
                <input id="title" name="title" type="text" className="admin-form-input"
                  placeholder="cth. Classic Oxford Shirt" required />
              </div>

              <div className="admin-form-group">
                <label htmlFor="tag">Tag *</label>
                <select id="tag" name="tag" className="admin-form-select" required>
                  {tagOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Available Sizes *</label>
                <div className="admin-size-checkboxes">
                  {sizeOptions.map((size) => (
                    <label key={size} className="admin-size-check">
                      <input type="checkbox" name="sizes" value={size} />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="colors">Color Options</label>
                <input id="colors" name="colors" type="text" className="admin-form-input"
                  placeholder="e.g. #0d0d0d, #f5f2ec, #1a3a5c" />
                <p className="admin-form-hint">Hex colors separated by commas</p>
              </div>

              <div className="admin-form-group">
                <label htmlFor="description">Product Description *</label>
                <textarea id="description" name="description" className="admin-form-textarea"
                  placeholder="Briefly describe this product..." required />
              </div>

              {/* Section: Product Details */}
              <div className="admin-form-divider" />
              <p className="admin-form-section-title">Product Details</p>

              <div className="admin-form-group">
                <label htmlFor="material">Material *</label>
                <textarea
                  id="material" name="material" className="admin-form-textarea" rows={3}
                  placeholder={"e.g.\n100% Cotton Oxford\nBreathable & Lightweight"}
                  required
                />
                <p className="admin-form-hint">One line = one material point</p>
              </div>

              <div className="admin-form-group">
                <label>Size Chart</label>
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
                        <td><input name={`sc_p_${size}`} type="number" min={0} className="admin-sizechart-input" placeholder="—" /></td>
                        <td><input name={`sc_l_${size}`} type="number" min={0} className="admin-sizechart-input" placeholder="—" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Right: Product Photos ── */}
            <div className="admin-product-photos">
              <p className="admin-form-section-title">Product Photos</p>
              <p className="admin-form-hint" style={{ marginBottom: '0.75rem' }}>The first photo becomes the main product photo</p>
              <div className="admin-photos-5col">
                <ImageUploadField name="image" label="1 — Main" />
                {[0, 1, 2, 3].map((i) => (
                  <ImageUploadField key={i} name={`detail-${i}`} label={`${i + 2}`} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="admin-form-divider" />
          <div className="admin-form-actions">
            <button type="submit" className="btn-admin-primary">Save Product</button>
            <Link href="/admin/products" className="btn-admin-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
