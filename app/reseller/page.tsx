import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Program Reseller — Erinnear Industries',
  description: 'Bergabunglah sebagai reseller Erinnear Industries dan dapatkan diskon eksklusif, dukungan penuh, dan produk berkualitas premium.',
}

const BENEFITS = [
  { icon: '◈', title: 'Harga Grosir Eksklusif', desc: 'Dapatkan diskon hingga 30% dari harga jual normal — semakin banyak order, semakin besar margin keuntunganmu.' },
  { icon: '◎', title: 'Tanpa Stok Awal', desc: 'Kamu tidak perlu menyimpan stok. Kami produksi sesuai pesanan yang masuk dari pelangganmu.' },
  { icon: '✦', title: 'Free Materi Promosi', desc: 'Foto produk HD, caption siap pakai, dan template media sosial tersedia gratis untuk semua reseller.' },
  { icon: '⊕', title: 'Produk Premium Siap Jual', desc: 'Setiap produk dikerjakan dengan standar kualitas tinggi — packaging rapi, label branded, siap diterima pelanggan akhir.' },
  { icon: '◐', title: 'Support Dedicated', desc: 'Akses ke grup reseller eksklusif dengan respons cepat. Ada pertanyaan? Tim kami siap bantu 7 hari seminggu.' },
  { icon: '⊞', title: 'Dashboard Pesanan', desc: 'Pantau status semua pesananmu secara real-time langsung dari akun reseller di platform kami.' },
]

const TIERS = [
  {
    name: 'Starter',
    minOrder: '10 pcs',
    discount: '10%',
    perks: ['Akses harga reseller', 'Foto produk HD', 'Support via WhatsApp', 'Tidak perlu stok'],
    highlight: false,
  },
  {
    name: 'Pro',
    minOrder: '50 pcs',
    discount: '20%',
    perks: ['Semua benefit Starter', 'Prioritas produksi', '2 pcs sampel gratis', 'Template konten eksklusif', 'Label nama tokomu'],
    highlight: true,
  },
  {
    name: 'Elite',
    minOrder: '150 pcs',
    discount: '30%',
    perks: ['Semua benefit Pro', 'Diskon tertinggi 30%', '5 pcs sampel gratis', 'Dedicated account manager', 'Custom tag & packaging'],
    highlight: false,
  },
]

const STEPS = [
  { num: '01', title: 'Daftar via Form', desc: 'Isi form pendaftaran reseller di bawah. Kami akan verifikasi dan menghubungimu dalam 1×24 jam.' },
  { num: '02', title: 'Pilih Tier', desc: 'Diskusikan kebutuhan bisnismu dengan tim kami dan tentukan tier yang paling cocok.' },
  { num: '03', title: 'Mulai Jualan', desc: 'Terima materi promosi, akses harga reseller, dan mulai terima pesanan dari pelangganmu.' },
  { num: '04', title: 'Grow Bersama', desc: 'Semakin banyak yang kamu jual, semakin besar diskon dan benefit eksklusif yang kamu dapatkan.' },
]

const FAQS = [
  { q: 'Apakah ada biaya pendaftaran?', a: 'Tidak ada. Pendaftaran sebagai reseller Erinnear Industries sepenuhnya gratis.' },
  { q: 'Berapa minimum order per transaksi?', a: 'Tergantung tier yang kamu pilih — mulai dari 10 pcs untuk tier Starter.' },
  { q: 'Apakah bisa custom desain untuk reseller?', a: 'Ya, reseller tier Pro dan Elite bisa request custom desain dengan MOQ khusus. Hubungi tim kami untuk detail.' },
  { q: 'Berapa lama produksi?', a: 'Estimasi 7–14 hari kerja tergantung kompleksitas desain dan jumlah order.' },
  { q: 'Apakah ada area eksklusif?', a: 'Saat ini belum ada eksklusivitas area. Namun kami batasi jumlah reseller per kota untuk menjaga kualitas pasar.' },
]

export default function ResellerPage() {
  return (
    <>
      {/* Hero */}
      <div className="reseller-hero">
        <div className="reseller-hero-inner">
          <span className="pill pill-yellow">✦ Program Reseller</span>
          <h1 className="reseller-hero-title">Jual Produk Kami,<br />Raih Keuntungan Bersama</h1>
          <p className="reseller-hero-sub">
            Bergabunglah dengan 35+ reseller aktif Erinnear Industries dan bangun bisnis fashion-mu sendiri dengan modal minimal dan margin yang menggiurkan.
          </p>
          <div className="reseller-hero-ctas">
            <a href="#daftar" className="btn-dark">Daftar Sekarang →</a>
            <a href="#tier" className="btn-outline">Lihat Program</a>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="reseller-stats-strip">
        <div className="reseller-stats-inner">
          <div className="reseller-stat">
            <strong>35+</strong>
            <span>Reseller Aktif</span>
          </div>
          <div className="reseller-stat-divider" />
          <div className="reseller-stat">
            <strong>30%</strong>
            <span>Diskon Maks.</span>
          </div>
          <div className="reseller-stat-divider" />
          <div className="reseller-stat">
            <strong>7–14</strong>
            <span>Hari Produksi</span>
          </div>
          <div className="reseller-stat-divider" />
          <div className="reseller-stat">
            <strong>0</strong>
            <span>Biaya Daftar</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section className="reseller-section">
        <div className="reseller-section-inner">
          <div className="reseller-section-header">
            <span className="pill pill-yellow">✦ Keuntungan</span>
            <h2>Kenapa jadi reseller<br />Erinnear Industries?</h2>
          </div>
          <div className="reseller-benefits-grid">
            {BENEFITS.map((b) => (
              <div key={b.title} className="reseller-benefit-card">
                <div className="reseller-benefit-icon">{b.icon}</div>
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="reseller-section reseller-section--alt" id="tier">
        <div className="reseller-section-inner">
          <div className="reseller-section-header">
            <span className="pill pill-yellow">✦ Pilih Program</span>
            <h2>Tier Reseller</h2>
            <p className="reseller-section-sub">Mulai kecil, tumbuh besar. Upgrade tier kapan saja sesuai perkembangan bisnismu.</p>
          </div>
          <div className="reseller-tiers-grid">
            {TIERS.map((tier) => (
              <div key={tier.name} className={`reseller-tier-card${tier.highlight ? ' reseller-tier-card--highlight' : ''}`}>
                {tier.highlight && <div className="reseller-tier-badge">Paling Populer</div>}
                <div className="reseller-tier-name">{tier.name}</div>
                <div className="reseller-tier-discount">{tier.discount}</div>
                <div className="reseller-tier-discount-label">diskon dari harga normal</div>
                <div className="reseller-tier-moq">Min. order: <strong>{tier.minOrder}</strong></div>
                <ul className="reseller-tier-perks">
                  {tier.perks.map((p) => (
                    <li key={p}>
                      <span className="reseller-tier-check">✓</span> {p}
                    </li>
                  ))}
                </ul>
                <a href="#daftar" className={tier.highlight ? 'btn-dark reseller-tier-btn' : 'btn-outline reseller-tier-btn'}>
                  Pilih {tier.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="reseller-section">
        <div className="reseller-section-inner">
          <div className="reseller-section-header">
            <span className="pill pill-yellow">✦ Cara Kerja</span>
            <h2>Mulai dalam 4 langkah</h2>
          </div>
          <div className="reseller-steps">
            {STEPS.map((step, i) => (
              <div key={step.num} className="reseller-step">
                <div className="reseller-step-num">{step.num}</div>
                {i < STEPS.length - 1 && <div className="reseller-step-line" />}
                <div className="reseller-step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="reseller-section reseller-section--alt">
        <div className="reseller-section-inner reseller-section-inner--narrow">
          <div className="reseller-section-header">
            <span className="pill pill-yellow">✦ FAQ</span>
            <h2>Pertanyaan Umum</h2>
          </div>
          <div className="reseller-faq">
            {FAQS.map((faq) => (
              <details key={faq.q} className="reseller-faq-item">
                <summary className="reseller-faq-q">{faq.q}</summary>
                <p className="reseller-faq-a">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="reseller-section" id="daftar">
        <div className="reseller-section-inner reseller-section-inner--narrow">
          <div className="reseller-register-card">
            <span className="pill pill-yellow">✦ Daftar Sekarang</span>
            <h2>Siap bergabung?</h2>
            <p>Isi form di bawah atau hubungi kami langsung — tim kami akan merespons dalam 1×24 jam.</p>
            <div className="reseller-register-btns">
              <Link href="/contact" className="btn-dark">
                Hubungi via Form →
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Erinnear!%20Saya%20ingin%20mendaftar%20sebagai%20reseller."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Atau via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
