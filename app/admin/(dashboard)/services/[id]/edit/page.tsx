import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServiceById } from '@/lib/data'
import { updateService } from '@/lib/actions'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = await getServiceById(id)
  if (!service) notFound()

  const updateAction = updateService.bind(null, service.id)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Service</h1>
          <p className="admin-page-subtitle">{service.title}</p>
        </div>
        <Link href="/admin/services" className="btn-admin-secondary">← Back</Link>
      </div>

      <div className="admin-form-card">
        <form action={updateAction} encType="multipart/form-data">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="title">Service Name *</label>
              <input id="title" name="title" type="text" className="admin-form-input"
                defaultValue={service.title} required />
            </div>
            <div className="admin-form-group">
              <label>Icon</label>
              {service.icon && (
                <div style={{ width: 40, height: 40, marginBottom: 8 }}>
                  {service.icon.startsWith('http')
                    ? <img src={service.icon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span dangerouslySetInnerHTML={{ __html: service.icon }} />
                  }
                </div>
              )}
              <input type="file" name="icon" accept="image/svg+xml,image/png,image/webp" className="admin-gallery-file-input" />
              <p className="admin-form-hint">SVG, PNG, atau WebP — kosongkan jika tidak ingin mengubah icon</p>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="desc">Short Description *</label>
            <textarea id="desc" name="desc" className="admin-form-textarea"
              defaultValue={service.desc} required />
            <p className="admin-form-hint">Displayed on the service card</p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="longDesc">Full Description <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <textarea id="longDesc" name="longDesc" className="admin-form-textarea" rows={5}
              defaultValue={service.longDesc ?? ''} />
          </div>

          <div className="admin-form-group">
            <label htmlFor="features">What&apos;s Included <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <textarea id="features" name="features" className="admin-form-textarea" rows={5}
              defaultValue={service.features?.join('\n') ?? ''} />
            <p className="admin-form-hint">One item per line</p>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn-admin-primary">Save Changes</button>
            <Link href="/admin/services" className="btn-admin-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
