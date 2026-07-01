import { getGallery } from '@/lib/data'
import { updateGallerySlot } from '@/lib/actions'
const slotNames = ['Slot A', 'Slot B', 'Slot C', 'Slot D', 'Slot E', 'Slot F']

export default async function GalleryAdminPage() {
  const gallery = await getGallery()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gallery</h1>
          <p className="admin-page-subtitle">Manage the 5 bento photos on the homepage</p>
        </div>
      </div>

      <div className="admin-gallery-grid">
        {gallery.map((slot, idx) => {
          const action = updateGallerySlot.bind(null, slot.id)
          return (
            <div key={slot.id} className="admin-gallery-card">
              <div className="admin-gallery-preview">
                {slot.image ? (
                  <img src={slot.image} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div className="admin-gallery-empty">
                    <span>No photo yet</span>
                  </div>
                )}
              </div>

              <div className="admin-gallery-slot-label">
                Slot {idx + 1} — {slotNames[idx]}
              </div>

              <form action={action} className="admin-gallery-form">
                <div className="admin-form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Photo</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="admin-gallery-file-input"
                  />
                </div>
                <button type="submit" className="btn-admin-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Save
                </button>
              </form>
            </div>
          )
        })}
      </div>
    </>
  )
}
