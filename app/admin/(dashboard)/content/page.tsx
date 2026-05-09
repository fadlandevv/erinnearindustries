import { getContent } from '@/lib/data'
import ContentEditor from './ContentEditor'

export default function ContentPage() {
  const content = getContent()
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Konten Halaman</h1>
          <p className="admin-page-subtitle">Edit teks banner, judul, dan deskripsi setiap halaman</p>
        </div>
      </div>
      <ContentEditor initialContent={content} />
    </>
  )
}
