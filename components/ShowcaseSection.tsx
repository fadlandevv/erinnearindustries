import Image from 'next/image'
import Link from 'next/link'
import { getShowcase } from '@/lib/data'

export default async function ShowcaseSection() {
  const items = await getShowcase()

  return (
    <section className="showcase-section">
      <div className="showcase-inner">
        <div className="showcase-grid">
          {items.map((item) => (
            <div key={item.id} className="showcase-card">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              ) : (
                <div className="showcase-placeholder" />
              )}
              <div className="showcase-overlay" />
              <div className="showcase-content">
                <h3 className="showcase-title">{item.title}</h3>
                <p className="showcase-desc">{item.desc}</p>
                <Link href={item.buttonHref} className="showcase-btn">
                  {item.buttonText} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
