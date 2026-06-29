import { getShowcase } from '@/lib/data'
import { updateShowcaseItem } from '@/lib/actions'
export default async function ShowcaseAdminPage() {
  const items = await getShowcase()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Showcase</h1>
          <p className="admin-page-subtitle">2 main cards below the homepage hero</p>
        </div>
      </div>

      <div className="admin-showcase-grid">
        {items.map((item, idx) => {
          const action = updateShowcaseItem.bind(null, item.id)
          return (
            <div key={item.id} className="admin-form-card">
              <div className="admin-showcase-preview">
                {item.image ? (
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div className="admin-gallery-empty">
                    <span>Card {idx + 1} — no photo yet</span>
                  </div>
                )}
              </div>

              <form action={action} encType="multipart/form-data">
                <div className="admin-form-group">
                  <label>Photo</label>
                  <input type="file" name="image" accept="image/*" className="admin-gallery-file-input" />
                </div>
                <div className="admin-form-group">
                  <label>Title</label>
                  <input name="title" type="text" className="admin-form-input" defaultValue={item.title} required />
                </div>
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea name="desc" className="admin-form-textarea" defaultValue={item.desc} required />
                </div>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Button Text</label>
                    <input name="buttonText" type="text" className="admin-form-input" defaultValue={item.buttonText} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Button Link</label>
                    <input name="buttonHref" type="text" className="admin-form-input" defaultValue={item.buttonHref} required placeholder="/product" />
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="btn-admin-primary">Save</button>
                </div>
              </form>
            </div>
          )
        })}
      </div>
    </>
  )
}
