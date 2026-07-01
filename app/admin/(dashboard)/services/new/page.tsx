import Link from 'next/link'
import { createService } from '@/lib/actions'
import ServiceIconPicker from '@/components/ServiceIconPicker'

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
        <form action={createService}>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="title">Service Name *</label>
              <input id="title" name="title" type="text" className="admin-form-input"
                placeholder="cth. Brand Identity" required />
            </div>
            <div className="admin-form-group">
              <label>Icon *</label>
              <ServiceIconPicker />
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

          <div className="admin-form-group">
            <label htmlFor="tag">Badge <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <input id="tag" name="tag" type="text" className="admin-form-input"
              placeholder="e.g. Most Popular or B2B" />
            <p className="admin-form-hint">Leave blank to hide the badge</p>
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
