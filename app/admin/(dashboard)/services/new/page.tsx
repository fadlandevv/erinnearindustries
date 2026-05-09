import Link from 'next/link'
import { createService } from '@/lib/actions'

const iconOptions = ['✦', '◈', '◎', '⊕', '◐', '⊞', '◇', '○', '△', '□']

export default function NewServicePage() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tambah Service</h1>
          <p className="admin-page-subtitle">Tambahkan layanan baru</p>
        </div>
        <Link href="/admin/services" className="btn-admin-secondary">← Kembali</Link>
      </div>

      <div className="admin-form-card">
        <form action={createService}>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="title">Nama Layanan *</label>
              <input id="title" name="title" type="text" className="admin-form-input"
                placeholder="cth. Brand Identity" required />
            </div>
            <div className="admin-form-group">
              <label htmlFor="icon">Icon *</label>
              <select id="icon" name="icon" className="admin-form-select" required>
                {iconOptions.map((i) => (
                  <option key={i} value={i}>{i} — {i}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="desc">Deskripsi Singkat *</label>
            <textarea id="desc" name="desc" className="admin-form-textarea"
              placeholder="Satu atau dua kalimat ringkasan layanan..." required />
            <p className="admin-form-hint">Ditampilkan di kartu layanan</p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="longDesc">Deskripsi Lengkap <span style={{ color: '#aaa', fontWeight: 400 }}>(opsional)</span></label>
            <textarea id="longDesc" name="longDesc" className="admin-form-textarea" rows={5}
              placeholder="Penjelasan detail layanan untuk halaman detail..." />
          </div>

          <div className="admin-form-group">
            <label htmlFor="features">Yang Termasuk <span style={{ color: '#aaa', fontWeight: 400 }}>(opsional)</span></label>
            <textarea id="features" name="features" className="admin-form-textarea" rows={5}
              placeholder={'Satu item per baris:\nLogo design\nBrand guidelines\nColor palette'} />
            <p className="admin-form-hint">Satu item per baris — ditampilkan sebagai daftar di halaman detail</p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="tag">Badge <span style={{ color: '#aaa', fontWeight: 400 }}>(opsional)</span></label>
            <input id="tag" name="tag" type="text" className="admin-form-input"
              placeholder="cth. Most Popular atau B2B" />
            <p className="admin-form-hint">Kosongkan jika tidak ingin menampilkan badge</p>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn-admin-primary">Simpan Service</button>
            <Link href="/admin/services" className="btn-admin-secondary">Batal</Link>
          </div>
        </form>
      </div>
    </>
  )
}
