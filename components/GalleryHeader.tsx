'use client'
import { useLanguage } from '@/context/LanguageContext'

export default function GalleryHeader() {
  const { t } = useLanguage()
  const section = (t as any).gallerySection

  return (
    <div className="gbn-header">
      <h2>
        {section.title.split('\n').map((line: string, i: number) => (
          <span key={i}>{line}{i === 0 && <br />}</span>
        ))}
      </h2>
      <p>{section.sub}</p>
    </div>
  )
}
