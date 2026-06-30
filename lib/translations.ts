export type Lang = 'id' | 'en'
export type Currency = 'IDR' | 'USD'

export const translations = {
  id: {
    nav: {
      home: 'Beranda', products: 'Produk', services: 'Layanan',
      custom: 'Custom', reseller: 'Reseller',
      contact: 'Kontak', login: 'Masuk', profile: 'Profil Saya',
      orders: 'Riwayat Pesanan',
    },
    hero: {
      badge: 'Koleksi Baru — Tersedia Sekarang',
      title: 'Fashion brand <em>crafting</em> purposeful style',
      sub: 'Koleksi siap pakai yang dirancang indah, membantu Anda tampil menonjol dan terhubung dengan audiens Anda.',
      cta: 'Ayo Ngobrol', ctaSecondary: 'Produk Kami',
    },
    stats: {
      heading: 'Kami Erinnear\nIndustries',
      desc: 'Brand pakaian dengan passion untuk menciptakan pengalaman digital yang terasa intuitif, indah, dan manusiawi. Dengan latar belakang di ready-to-wear dan desain brand, kami menghadirkan keseimbangan kreativitas dan strategi di setiap proyek.',
      about: 'Tentang Kami',
      items: [
        { num: '8+', unit: 'tahun', desc: 'Pengalaman merancang pakaian untuk brand di bidang lifestyle, sportswear, dan fashion berkelanjutan.' },
        { num: '120+', unit: 'produk', desc: 'Berhasil diluncurkan dari konsep desain hingga koleksi pakaian yang berdampak tinggi.' },
        { num: '35+', unit: 'klien puas', desc: 'Banyak rumah fashion terbuka untuk kolaborasi baru, ritel, atau klien ready-to-order.' },
        { num: '99%', unit: 'kepuasan', desc: 'Berdasarkan feedback klien yang dikumpulkan selama lima tahun terakhir.' },
      ],
    },
    featuredProducts: { badge: 'Terus Bergerak', title: 'Produk yang kami\nbuat saat ini' },
    servicesSection: {
      badge: 'Yang Kami Tawarkan',
      title: 'Layanan pakaian\n& presentasi brand',
      sub: 'Semua yang Anda butuhkan untuk membangun kehadiran digital premium untuk brand Anda.',
    },
    gallerySection: {
      title: 'Karya yang\nkami banggakan',
      sub: 'Koleksi hasil kerja terbaik kami — dari pakaian hingga identitas brand.',
    },
    contact: {
      badge: 'Hubungi Kami',
      title: 'Ayo buat sesuatu\nbersama',
      sub: 'Punya proyek? Kami sangat ingin mendengarnya. Kirimkan pesan dan kami akan merespons dalam 1–2 hari kerja.',
    },
    footer: {
      tagline: 'Pakaian modern dan desain\nprofil perusahaan.',
      groups: { Company: 'Perusahaan', Support: 'Dukungan' },
      links: { Home: 'Beranda', Product: 'Produk', Service: 'Layanan', 'Contact Us': 'Hubungi Kami', 'Cek Pesanan': 'Cek Pesanan' },
      copyright: '© 2025 Erinnear Industries. Hak cipta dilindungi.',
    },
    productDetail: {
      material: 'Material', pickColor: 'Pilih Warna', pickSize: 'Pilih Ukuran',
      selected: 'Terpilih', addToCart: 'Tambah ke Keranjang',
      contact: 'Hubungi Kami', otherProducts: 'Produk Lainnya',
      sizeError: 'Pilih ukuran terlebih dahulu',
    },
    productPage: {
      badge: 'Koleksi Kami',
      title: 'Produk yang kami buat\ndengan niat',
      sub: 'Dari koleksi kapsul musiman hingga pakaian premium sehari-hari — setiap karya dirancang dengan tujuan.',
      categories: ['Semua', 'Apparel', 'Accessories', 'B2B'],
      loadMore: 'Muat Lebih Banyak',
    },
    servicePage: {
      badge: 'Yang Kami Tawarkan',
      title: 'Layanan untuk\nbrand fashion',
      sub: 'Semua yang Anda butuhkan untuk membangun kehadiran digital premium — dari identitas brand hingga pengalaman e-commerce penuh.',
      processTitle: 'Cara Kami Bekerja',
      steps: [
        { num: '01', title: 'Penemuan', desc: 'Kami mulai dengan memahami brand, tujuan, target audiens, dan positioning unik Anda.' },
        { num: '02', title: 'Strategi', desc: 'Bersama kami merancang rencana kreatif yang disesuaikan dengan jadwal dan anggaran Anda.' },
        { num: '03', title: 'Desain', desc: 'Tim kami mewujudkan visi Anda melalui iterasi, feedback, dan presisi.' },
        { num: '04', title: 'Peluncuran', desc: 'Kami mendukung go-live Anda dengan pemeriksaan akhir, serah terima, dan panduan pasca-peluncuran.' },
      ],
    },
  },
  en: {
    nav: {
      home: 'Home', products: 'Products', services: 'Services',
      custom: 'Custom', reseller: 'Reseller',
      contact: 'Contact', login: 'Sign In', profile: 'My Profile',
      orders: 'Order History',
    },
    hero: {
      badge: 'New Collection — Available Now',
      title: 'Fashion brand <em>crafting</em> purposeful style',
      sub: 'Beautifully designed, ready-to-wear collections that help you stand out and connect with your audience.',
      cta: "Let's Talk", ctaSecondary: 'Our Products',
    },
    stats: {
      heading: "We're Erinnear\nIndustries",
      desc: 'A clothing brand with a passion for crafting digital experiences that feel intuitive, beautiful, and human. With a background in ready-to-wear and brand design, we bring a thoughtful balance of creativity and strategy to every project.',
      about: 'About Us',
      items: [
        { num: '8+', unit: 'years', desc: 'Experience designing wearables for brands across lifestyle, sportswear, and sustainable fashion.' },
        { num: '120+', unit: 'products', desc: 'Successfully launched from concept design to high-impact clothing capsules.' },
        { num: '35+', unit: 'happy clients', desc: 'Many fashion houses open for new collaborations, retail, or ready-to-order clients.' },
        { num: '99%', unit: 'satisfaction', desc: 'Based on client feedback collected over the last five years.' },
      ],
    },
    featuredProducts: { badge: 'Keep Moving On', title: "Products we're building\nat the moment" },
    servicesSection: {
      badge: 'What We Offer',
      title: 'Full service clothing\n& brand presentation',
      sub: 'Everything you need to establish a premium digital presence for your brand.',
    },
    gallerySection: {
      title: 'Work we\nare proud of',
      sub: 'A collection of our best work — from clothing to brand identity.',
    },
    contact: {
      badge: 'Get In Touch',
      title: "Let's build something\ntogether",
      sub: "Have a project in mind? We'd love to hear about it. Send us a message and we'll get back to you within 1–2 business days.",
    },
    footer: {
      tagline: 'Modern clothing and company\nprofile design.',
      groups: { Company: 'Company', Support: 'Support' },
      links: { Home: 'Home', Product: 'Product', Service: 'Service', 'Contact Us': 'Contact Us', 'Cek Pesanan': 'Track Order' },
      copyright: '© 2025 Erinnear Industries. All rights reserved.',
    },
    productDetail: {
      material: 'Material', pickColor: 'Pick Color', pickSize: 'Pick Size',
      selected: 'Selected', addToCart: 'Add to Cart',
      contact: 'Contact Us', otherProducts: 'Other Products',
      sizeError: 'Please select a size first',
    },
    productPage: {
      badge: 'Our Collections',
      title: 'Products we craft\nwith intention',
      sub: 'From seasonal capsule collections to premium everyday wear — each piece is designed with purpose and crafted with care.',
      categories: ['All', 'Apparel', 'Accessories', 'B2B'],
      loadMore: 'Load More Products',
    },
    servicePage: {
      badge: 'What We Offer',
      title: 'Services built for\nfashion brands',
      sub: 'Everything you need to establish a premium digital presence — from brand identity to full e-commerce experiences.',
      processTitle: 'How We Work',
      steps: [
        { num: '01', title: 'Discovery', desc: 'We start by understanding your brand, goals, target audience, and unique positioning.' },
        { num: '02', title: 'Strategy', desc: 'Together we craft a tailored creative plan aligned with your timeline and budget.' },
        { num: '03', title: 'Design', desc: 'Our team brings your vision to life through iteration, feedback, and precision.' },
        { num: '04', title: 'Launch', desc: 'We support your go-live with final checks, handover, and post-launch guidance.' },
      ],
    },
  },
}

export type TranslationShape = (typeof translations)['id']
