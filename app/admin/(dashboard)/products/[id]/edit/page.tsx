import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/data'
import { updateProductInfo, updateProductPhotos } from '@/lib/actions'
import { getProductSizeEntries } from '@/lib/warehouse'
import ImageUploadField from '@/components/ImageUploadField'
import StockPricingTable from './StockPricingTable'

const tagOptions = ['New Arrival', 'Best Seller', 'Limited', 'Sale', 'Coming Soon']
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const entries = await getProductSizeEntries(id, product.sizes)
  const infoAction = updateProductInfo.bind(null, product.id)
  const photosAction = updateProductPhotos.bind(null, product.id)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Product</h1>
          <p className="admin-page-subtitle">{product.title}</p>
        </div>
        <Link href="/admin/products" className="btn-admin-secondary">← Kembali</Link>
      </div>

      {/* ── Section 1: Informasi Produk ── */}
      <div className="admin-form-card">
        <form action={infoAction}>
          <p className="admin-form-section-title">Informasi Produk</p>

          <div className="admin-form-group">
            <label htmlFor="title">Nama Produk *</label>
            <input id="title" name="title" type="text" className="admin-form-input"
              defaultValue={product.title} required />
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="tag">Tag *</label>
              <select id="tag" name="tag" className="admin-form-select" defaultValue={product.tag} required>
                {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label htmlFor="material">Material *</label>
              <textarea
                id="material" name="material" className="admin-form-textarea" rows={3}
                defaultValue={Array.isArray(product.material) ? product.material.join('\n') : product.material}
                placeholder={'cth.\n100% Cotton Oxford\nBreathable & Lightweight'}
                required
              />
              <p className="admin-form-hint">Satu baris = satu poin material</p>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="description">Deskripsi *</label>
            <textarea id="description" name="description" className="admin-form-textarea"
              defaultValue={product.description} required />
          </div>

          <div className="admin-form-group">
            <label>Ukuran Tersedia *</label>
            <div className="admin-size-checkboxes">
              {sizeOptions.map(size => (
                <label key={size} className="admin-size-check">
                  <input type="checkbox" name="sizes" value={size}
                    defaultChecked={product.sizes.includes(size)} />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="colors">Pilihan Warna</label>
            <input id="colors" name="colors" type="text" className="admin-form-input"
              defaultValue={product.colors?.join(', ') ?? product.bg}
              placeholder="cth. #0d0d0d, #f5f2ec, #1a3a5c" />
            <p className="admin-form-hint">Hex warna dipisah koma</p>
          </div>

          <div className="admin-form-divider" />
          <div className="admin-form-actions">
            <button type="submit" className="btn-admin-primary">Simpan Info</button>
            <Link href="/admin/products" className="btn-admin-secondary">Batal</Link>
          </div>
        </form>
      </div>

      {/* ── Section 2: Stok & Harga ── */}
      <StockPricingTable
        productId={product.id}
        productTitle={product.title}
        entries={entries}
      />

      {/* ── Section 3: Foto Produk ── */}
      <div className="admin-form-card" style={{ marginTop: '1.25rem' }}>
        <form action={photosAction} encType="multipart/form-data">
          <p className="admin-form-section-title">Foto Produk</p>

          <p className="admin-form-hint" style={{ marginBottom: '0.75rem' }}>Foto pertama jadi foto utama produk</p>
          <div className="admin-photos-5col">
            <ImageUploadField name="image" label="1 — Utama" current={product.image} />
            {[0, 1, 2, 3].map(i => (
              <ImageUploadField
                key={i}
                name={`detail-${i}`}
                label={`${i + 2}`}
                current={product.images?.[i] || undefined}
              />
            ))}
          </div>

          <div className="admin-form-divider" />
          <div className="admin-form-actions">
            <button type="submit" className="btn-admin-primary">Simpan Foto</button>
          </div>
        </form>
      </div>
    </>
  )
}
