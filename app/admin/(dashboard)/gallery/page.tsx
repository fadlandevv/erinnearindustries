import Image from 'next/image'
import { getGallery } from '@/lib/data'
import { updateGallerySlot } from '@/lib/actions'
import AdminToastTrigger from '@/components/AdminToastTrigger'

const slotNames = ['Slot A', 'Slot B', 'Slot C', 'Slot D', 'Slot E', 'Slot F']

type SP = Promise<{ toast?: string; toastType?: string }>

export default async function GalleryAdminPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const gallery = await getGallery()

  return (
    <>
      {sp.toast && <AdminToastTrigger message={decodeURIComponent(sp.toast)} type={(sp.toastType ?? 'success') as 'success' | 'error'} />}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gallery</h1>
          <p className="admin-page-subtitle">Kelola 5 foto bento di homepage</p>
        </div>
      </div>

      <div className="admin-gallery-grid">
        {gallery.map((slot, idx) => {
          const action = updateGallerySlot.bind(null, slot.id)
          return (
            <div key={slot.id} className="admin-gallery-card">
              <div className="admin-gallery-preview">
                {slot.image ? (
                  <Image
                    src={slot.image}
                    alt={slot.label}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="300px"
                  />
                ) : (
                  <div className="admin-gallery-empty">
                    <span>Belum ada foto</span>
                  </div>
                )}
              </div>

              <div className="admin-gallery-slot-label">
                Slot {idx + 1} — {slotNames[idx]}
              </div>

              <form action={action} encType="multipart/form-data" className="admin-gallery-form">
                <div className="admin-form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Foto</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="admin-gallery-file-input"
                  />
                </div>
                <button type="submit" className="btn-admin-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Simpan
                </button>
              </form>
            </div>
          )
        })}
      </div>
    </>
  )
}
