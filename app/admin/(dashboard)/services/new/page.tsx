import Link from 'next/link'
import { createService } from '@/lib/actions'

export default function NewServicePage() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Add Service</h1>
          <p className="admin-page-subtitle">Add a new service</p>
        </div>
        <Link href="/admin/services" className="btn-admin-secondary">← Back</Link>
      </div>

      <div className="admin-form-card">
        <form action={createService} encType="multipart/form-data">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="title">Service Name *</label>
              <input id="title" name="title" type="text" className="admin-form-input"
                placeholder="cth. Brand Identity" required />
            </div>
            <div className="admin-form-group">
              <label>Icon</label>
              <input type="file" name="icon" accept="image/svg+xml,image/png,image/webp" className="admin-gallery-file-input" />
              <p className="admin-form-hint">SVG, PNG, atau WebP — disarankan ukuran 48×48px</p>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="desc">Short Description *</label>
            <textarea id="desc" name="desc" className="admin-form-textarea"
              placeholder="One or two sentence summary of the service..." required />
            <p className="admin-form-hint">Displayed on the service card</p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="longDesc">Full Description <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <textarea id="longDesc" name="longDesc" className="admin-form-textarea" rows={5}
              placeholder="Detailed explanation of the service for the detail page..." />
          </div>

          <div className="admin-form-group">
            <label htmlFor="features">What&apos;s Included <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <textarea id="features" name="features" className="admin-form-textarea" rows={5}
              placeholder={'One item per line:\nLogo design\nBrand guidelines\nColor palette'} />
            <p className="admin-form-hint">One item per line — displayed as a list on the detail page</p>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn-admin-primary">Save Service</button>
            <Link href="/admin/services" className="btn-admin-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
