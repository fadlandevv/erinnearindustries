'use client'
import { useLanguage } from '@/context/LanguageContext'

export default function GalleryHeader() {
  const { t } = useLanguage()
  const section = (t as any).gallerySection

  return (
    <div className="gbn-header">
      {/* newline dari CMS diratakan jadi spasi supaya judulnya satu baris */}
      <h2>{section.title.replace(/\s*\n\s*/g, ' ')}</h2>
      <p>{section.sub}</p>
    </div>
  )
}
