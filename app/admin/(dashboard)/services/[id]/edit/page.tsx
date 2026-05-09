import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServiceById } from '@/lib/data'
import { updateService } from '@/lib/actions'

const iconOptions = ['✦', '◈', '◎', '⊕', '◐', '⊞', '◇', '○', '△', '□']

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = getServiceById(id)
  if (!service) notFound()

  const updateAction = updateService.bind(null, service.id)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Service</h1>
          <p className="admin-page-subtitle">{service.title}</p>
        </div>
        <Link href="/admin/services" className="btn-admin-secondary">← Kembali</Link>
      </div>

      <div className="admin-form-card">
        <form action={updateAction}>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="title">Nama Layanan *</label>
              <input id="title" name="title" type="text" className="admin-form-input"
                defaultValue={service.title} required />
            </div>
            <div className="admin-form-group">
              <label htmlFor="icon">Icon *</label>
              <select id="icon" name="icon" className="admin-form-select" defaultValue={service.icon} required>
                {iconOptions.map((i) => (
                  <option key={i} value={i}>{i} — {i}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="desc">Deskripsi Singkat *</label>
            <textarea id="desc" name="desc" className="admin-form-textarea"
              defaultValue={service.desc} required />
            <p className="admin-form-hint">Ditampilkan di kartu layanan</p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="longDesc">Deskripsi Lengkap <span style={{ color: '#aaa', fontWeight: 400 }}>(opsional)</span></label>
            <textarea id="longDesc" name="longDesc" className="admin-form-textarea" rows={5}
              defaultValue={service.longDesc ?? ''} />
          </div>

          <div className="admin-form-group">
            <label htmlFor="features">Yang Termasuk <span style={{ color: '#aaa', fontWeight: 400 }}>(opsional)</span></label>
            <textarea id="features" name="features" className="admin-form-textarea" rows={5}
              defaultValue={service.features?.join('\n') ?? ''} />
            <p className="admin-form-hint">Satu item per baris</p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="tag">Badge <span style={{ color: '#aaa', fontWeight: 400 }}>(opsional)</span></label>
            <input id="tag" name="tag" type="text" className="admin-form-input"
              defaultValue={service.tag ?? ''} placeholder="cth. Most Popular atau B2B" />
            <p className="admin-form-hint">Kosongkan jika tidak ingin menampilkan badge</p>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn-admin-primary">Simpan Perubahan</button>
            <Link href="/admin/services" className="btn-admin-secondary">Batal</Link>
          </div>
        </form>
      </div>
    </>
  )
}
