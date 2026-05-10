import Image from 'next/image'
import { getGallery } from '@/lib/data'

export default async function GallerySection() {
  const items = await getGallery()
  const [s1, s2, s3, s4, s5] = items

  return (
    <section className="gallery-section">
      <div className="gallery-inner">
        <div className="gallery-bento">

          {/* Slot 1 — top left */}
          <div className="gallery-card gallery-slot-1">
            {s1?.image ? (
              <Image src={s1.image} alt={s1.label} fill style={{ objectFit: 'cover' }} sizes="300px" />
            ) : (
              <div className="gallery-placeholder">
                <div className="gallery-placeholder-icon">✦</div>
              </div>
            )}
            <div className="gallery-card-label">
              <span className="gallery-card-sub">{s1?.sublabel}</span>
              <span className="gallery-card-title">{s1?.label}</span>
            </div>
          </div>

          {/* Slot 2 — bottom left */}
          <div className="gallery-card gallery-slot-2">
            {s2?.image ? (
              <Image src={s2.image} alt={s2.label} fill style={{ objectFit: 'cover' }} sizes="300px" />
            ) : (
              <div className="gallery-placeholder gallery-placeholder--alt">
                <div className="gallery-placeholder-icon">◈</div>
              </div>
            )}
            <div className="gallery-card-label">
              <span className="gallery-card-sub">{s2?.sublabel}</span>
              <span className="gallery-card-title">{s2?.label}</span>
            </div>
          </div>

          {/* Slot 3 — center main (tall) */}
          <div className="gallery-card gallery-slot-3">
            {s3?.image ? (
              <Image src={s3.image} alt={s3.label} fill style={{ objectFit: 'cover' }} sizes="600px" priority />
            ) : (
              <div className="gallery-placeholder gallery-placeholder--main">
                <div className="gallery-placeholder-icon gallery-placeholder-icon--lg">EI</div>
              </div>
            )}
            <div className="gallery-card-label gallery-card-label--main">
              <span className="gallery-card-sub">{s3?.sublabel}</span>
              <span className="gallery-card-title">{s3?.label}</span>
            </div>
          </div>

          {/* Slot 4 — top right */}
          <div className="gallery-card gallery-slot-4">
            {s4?.image ? (
              <Image src={s4.image} alt={s4.label} fill style={{ objectFit: 'cover' }} sizes="320px" />
            ) : (
              <div className="gallery-placeholder gallery-placeholder--warm">
                <div className="gallery-placeholder-icon">◎</div>
              </div>
            )}
            <div className="gallery-card-label">
              <span className="gallery-card-sub">{s4?.sublabel}</span>
              <span className="gallery-card-title">{s4?.label}</span>
            </div>
          </div>

          {/* Slot 5 — bottom right */}
          <div className="gallery-card gallery-slot-5">
            {s5?.image ? (
              <Image src={s5.image} alt={s5.label} fill style={{ objectFit: 'cover' }} sizes="320px" />
            ) : (
              <div className="gallery-placeholder gallery-placeholder--light">
                <div className="gallery-placeholder-icon gallery-placeholder-icon--dark">⊞</div>
              </div>
            )}
            <div className="gallery-card-label">
              <span className="gallery-card-sub">{s5?.sublabel}</span>
              <span className="gallery-card-title">{s5?.label}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
