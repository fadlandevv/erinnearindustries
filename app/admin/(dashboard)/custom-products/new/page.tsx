import { createCustomProductAction } from '@/lib/actions'

export default function NewCustomProductPage() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tambah Custom Product</h1>
          <p className="admin-page-subtitle">Kartu baru di halaman /custom</p>
        </div>
      </div>

      <div className="admin-form-card" style={{ maxWidth: 600 }}>
        <form action={createCustomProductAction} encType="multipart/form-data">
          <div className="admin-form-group">
            <label>ID (slug, huruf kecil + strip)</label>
            <input name="id" type="text" className="admin-form-input" required placeholder="misal: polo-shirt" pattern="[a-z0-9\-]+" />
            <span style={{ fontSize: '0.75rem', color: '#999' }}>Akan jadi bagian URL. Tidak bisa diubah setelah disimpan.</span>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Nama Produk</label>
              <input name="name" type="text" className="admin-form-input" required placeholder="Polo Shirt" />
            </div>
            <div className="admin-form-group">
              <label>Subtitle</label>
              <input name="sub" type="text" className="admin-form-input" placeholder="Pique" />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Deskripsi Singkat <span style={{ color: '#aaa', fontWeight: 400 }}>(maks. 29 karakter)</span></label>
            <input name="descShort" type="text" className="admin-form-input" maxLength={29} placeholder="Bordir & sablon custom" />
          </div>

          <div className="admin-form-group">
            <label>Link Halaman</label>
            <input name="href" type="text" className="admin-form-input" required placeholder="/custom/polo-shirt" />
          </div>

          <div className="admin-form-group">
            <label>Warna Background (jika tanpa foto)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input name="bg" type="color" defaultValue="#1a1209" style={{ width: 44, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input name="bg" type="text" className="admin-form-input" defaultValue="#1a1209" placeholder="#1a1209" style={{ maxWidth: 140 }} />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Foto Background Kartu</label>
            <input type="file" name="image" accept="image/*" className="admin-gallery-file-input" />
          </div>

          <div className="admin-form-group">
            <label>Icon SVG (isi dalam &lt;svg&gt;, tanpa tag svg-nya)</label>
            <textarea
              name="iconSvg"
              className="admin-form-textarea"
              rows={4}
              placeholder={'<path d="M20.38 3.46L16 2a4 4 0 01-8 0..."/>'}
            />
            <span style={{ fontSize: '0.75rem', color: '#999' }}>Salin path/polyline dari icon SVG 24×24. Kosongkan jika tidak ada icon.</span>
          </div>

          <div className="admin-form-actions">
            <a href="/admin/custom-products" className="btn-admin-secondary">Batal</a>
            <button type="submit" className="btn-admin-primary">Simpan</button>
          </div>
        </form>
      </div>
    </>
  )
}
