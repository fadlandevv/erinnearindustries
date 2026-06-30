import type { Metadata } from 'next'
import Link from 'next/link'
import { POSTS } from './dummyPosts'

export const metadata: Metadata = {
  title: 'Berita & Artikel — Erinnear Industries',
  description: 'Kabar terbaru, tips, dan artikel seputar produk custom dari Erinnear Industries.',
}

export default function BeritaPage() {
  const [featured, ...rest] = POSTS

  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/" className="svc-detail-back">← Beranda</Link>
        </div>
      </div>

      <section className="custom-hero">
        <div className="custom-hero-inner">
          <h1 className="custom-hero-title">Berita & Artikel</h1>
          <p className="custom-hero-sub">
            Kabar terbaru, tips, dan update dari Erinnear Industries.
          </p>
        </div>
      </section>

      <section className="berita-section">
        <div className="berita-inner">

          {/* Featured post */}
          <Link href={`/berita/${featured.slug}`} className="berita-featured">
            <div className="berita-featured-img" />
            <div className="berita-featured-body">
              <span className="berita-cat">{featured.category}</span>
              <h2 className="berita-featured-title">{featured.title}</h2>
              <p className="berita-featured-excerpt">{featured.excerpt}</p>
              <div className="berita-meta">
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readTime} baca</span>
              </div>
            </div>
          </Link>

          {/* Grid */}
          <div className="berita-grid">
            {rest.map(post => (
              <Link key={post.slug} href={`/berita/${post.slug}`} className="berita-card">
                <div className="berita-card-img" />
                <div className="berita-card-body">
                  <span className="berita-cat">{post.category}</span>
                  <h3 className="berita-card-title">{post.title}</h3>
                  <p className="berita-card-excerpt">{post.excerpt}</p>
                  <div className="berita-meta">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime} baca</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}
