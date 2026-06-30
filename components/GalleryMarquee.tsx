import Image from 'next/image'
import { getGallery } from '@/lib/data'
import GalleryHeader from './GalleryHeader'

const AREAS = ['a', 'b', 'c', 'd', 'e'] as const

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #1c1c1c 0%, #0d0d0d 100%)',
  'linear-gradient(135deg, #1a1814 0%, #111 100%)',
  'linear-gradient(135deg, #151515 0%, #0a0a0a 100%)',
  'linear-gradient(135deg, #1e1a16 0%, #111 100%)',
  'linear-gradient(135deg, #181818 0%, #0d0d0d 100%)',
  'linear-gradient(135deg, #121212 0%, #0a0a0a 100%)',
  'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
  'linear-gradient(135deg, #161614 0%, #0d0d0d 100%)',
]

export default async function GalleryMarquee() {
  const items = await getGallery()

  return (
    <section className="gbn-section">
      <div className="gbn-inner">
        <GalleryHeader />
        <div className="gbn-grid">
          {AREAS.map((area, i) => {
            const item = items[i % items.length]
            return (
              <div
                key={area}
                className={`gbn-item gbn-${area}`}
                style={{ background: item?.image ? undefined : PLACEHOLDER_GRADIENTS[i] }}
              >
                {item?.image && (
                  <Image
                    src={item.image}
                    alt={item.label || ''}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 400px) 50vw, 33vw"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
