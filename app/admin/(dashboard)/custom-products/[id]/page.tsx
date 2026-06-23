import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getCustomProductById } from '@/lib/data'
import { updateCustomProductAction } from '@/lib/actions'

export default async function EditCustomProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getCustomProductById(id)
  if (!product) notFound()

  const updateAction = updateCustomProductAction.bind(null, id)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit: {product.name}</h1>
          <p className="admin-page-subtitle">ID: {product.id}</p>
        </div>
      </div>

      <div className="admin-form-card" style={{ maxWidth: 600 }}>
        {product.image && (
          <div style={{ position: 'relative', height: 160, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
            <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="600px" />
          </div>
        )}

        <form action={updateAction} encType="multipart/form-data">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Nama Produk</label>
              <input name="name" type="text" className="admin-form-input" defaultValue={product.name} required />
            </div>
            <div className="admin-form-group">
              <label>Subtitle</label>
              <input name="sub" type="text" className="admin-form-input" defaultValue={product.sub} />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Deskripsi Singkat <span style={{ color: '#aaa', fontWeight: 400 }}>(maks. 29 karakter)</span></label>
            <input name="descShort" type="text" className="admin-form-input" maxLength={29} defaultValue={product.descShort} />
          </div>

          <div className="admin-form-group">
            <label>Link Halaman</label>
            <input name="href" type="text" className="admin-form-input" defaultValue={product.href} required />
          </div>

          <div className="admin-form-group">
            <label>Warna Background (jika tanpa foto)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input name="bg" type="color" defaultValue={product.bg} style={{ width: 44, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input name="bg" type="text" className="admin-form-input" defaultValue={product.bg} style={{ maxWidth: 140 }} />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Ganti Foto Background</label>
            <input type="file" name="image" accept="image/*" className="admin-gallery-file-input" />
          </div>

          <div className="admin-form-group">
            <label>Icon SVG (isi dalam &lt;svg&gt;, tanpa tag svg-nya)</label>
            <textarea
              name="iconSvg"
              className="admin-form-textarea"
              rows={4}
              defaultValue={product.iconSvg}
            />
          </div>

          <div className="admin-form-group">
            <label>Status</label>
            <select name="active" className="admin-form-input" defaultValue={String(product.active)}>
              <option value="true">Aktif (tampil di /custom)</option>
              <option value="false">Hidden (disembunyikan)</option>
            </select>
          </div>

          <div className="admin-form-actions">
            <a href="/admin/custom-products" className="btn-admin-secondary">Batal</a>
            <button type="submit" className="btn-admin-primary">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </>
  )
}
