import Image from 'next/image'
import { getProducts } from '@/lib/data'

export default async function ResellerPromoPage() {
  const products = await getProducts()
  const withImages = products.filter(p => p.image)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Materi Promo</h1>
          <p className="admin-page-subtitle">Download foto produk untuk keperluan promosi di media sosial.</p>
        </div>
      </div>

      <div className="rs-note-box">
        Foto di bawah bebas kamu gunakan untuk promosi di sosial media. Klik tombol Download untuk menyimpan ke perangkatmu.
      </div>

      {withImages.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-empty">Belum ada foto produk tersedia.</div>
        </div>
      ) : (
        <div className="rs-promo-grid">
          {withImages.map(product => (
            <div key={product.id} className="rs-promo-card">
              <div className="rs-promo-img-wrap" style={{ background: product.bg }}>
                <Image
                  src={product.image!}
                  alt={product.title}
                  width={300}
                  height={300}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
              <div className="rs-promo-info">
                <div className="rs-promo-title" title={product.title}>{product.title}</div>
                <div className="rs-promo-tag">{product.tag}</div>
                <a
                  href={product.image}
                  download
                  className="btn-admin-primary"
                  style={{ background: '#16a34a', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ↓ Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail photos */}
      {products.some(p => p.images?.some(Boolean)) && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '2rem 0 1rem' }}>Foto Detail Produk</h2>
          <div className="rs-promo-grid">
            {products.flatMap(product =>
              (product.images ?? [])
                .filter(Boolean)
                .map((imgUrl, i) => (
                  <div key={`${product.id}-${i}`} className="rs-promo-card">
                    <div className="rs-promo-img-wrap" style={{ background: product.bg }}>
                      <Image
                        src={imgUrl}
                        alt={`${product.title} detail ${i + 1}`}
                        width={300}
                        height={300}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </div>
                    <div className="rs-promo-info">
                      <div className="rs-promo-title" title={product.title}>{product.title}</div>
                      <div className="rs-promo-tag">Detail {i + 1}</div>
                      <a
                        href={imgUrl}
                        download
                        className="btn-admin-primary"
                        style={{ background: '#16a34a', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ↓ Download
                      </a>
                    </div>
                  </div>
                ))
            )}
          </div>
        </>
      )}
    </>
  )
}
