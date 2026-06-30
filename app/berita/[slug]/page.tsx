import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { POSTS } from '../dummyPosts'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = POSTS.find(p => p.slug === slug)
  if (!post) return {}
  return { title: `${post.title} — Erinnear Industries` }
}

export async function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }))
}

export default async function BeritaArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POSTS.find(p => p.slug === slug)
  if (!post) notFound()

  const paragraphs = post.content.split('\n\n').filter(Boolean)

  return (
    <>
      <div className="svc-detail-back-wrap">
        <div className="svc-detail-back-inner">
          <Link href="/berita" className="svc-detail-back">← Semua Berita</Link>
        </div>
      </div>

      <article className="berita-article">
        <div className="berita-article-inner">
          <span className="berita-cat">{post.category}</span>
          <h1 className="berita-article-title">{post.title}</h1>
          <div className="berita-meta" style={{ marginBottom: '2rem' }}>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime} baca</span>
          </div>
          <div className="berita-article-img" />
          <div className="berita-article-body">
            {paragraphs.map((p, i) => {
              if (p.startsWith('**') && p.endsWith('**')) {
                return <h3 key={i} className="berita-article-h3">{p.replace(/\*\*/g, '')}</h3>
              }
              if (p.startsWith('**')) {
                const parts = p.split('**').filter(Boolean)
                return (
                  <p key={i} className="berita-article-p">
                    {parts.map((part, j) => j % 2 === 0 ? <strong key={j}>{part}</strong> : part)}
                  </p>
                )
              }
              return <p key={i} className="berita-article-p">{p}</p>
            })}
          </div>
        </div>
      </article>

      {/* Related posts */}
      <section className="berita-related">
        <div className="berita-article-inner">
          <h2 className="berita-related-title">Artikel Lainnya</h2>
          <div className="berita-grid">
            {POSTS.filter(p => p.slug !== slug).slice(0, 3).map(p => (
              <Link key={p.slug} href={`/berita/${p.slug}`} className="berita-card">
                <div className="berita-card-img" />
                <div className="berita-card-body">
                  <span className="berita-cat">{p.category}</span>
                  <h3 className="berita-card-title">{p.title}</h3>
                  <div className="berita-meta">
                    <span>{p.date}</span>
                    <span>·</span>
                    <span>{p.readTime} baca</span>
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
