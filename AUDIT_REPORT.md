# AUDIT REPORT — Erinnear Industries

**Tanggal:** 31 Juli 2026
**Auditor:** Claude Code (QA Engineer)
**Stack:** Next.js 16.2.4 (App Router, Turbopack) · React 19.2.6 · TypeScript 6.0.3 · Supabase · Midtrans · RajaOngkir · Anthropic SDK
**Metode:** Pembacaan kode langsung + `npm run build` + `npm audit` + pengujian HTTP live terhadap dev server (`localhost:3000`)

**Legenda status:** ✅ OK · ⚠️ Perlu Perhatian · ❌ Belum Ada/Bermasalah · 🔒 Risiko Keamanan

---

## ⛔ TEMUAN PALING MENDESAK

Dua hal ini menghentikan rilis dan harus dibaca lebih dulu:

1. **Build produksi GAGAL.** `npm run build` exit code 1 karena type error di `lib/actions.ts:270`. Website tidak bisa di-deploy sama sekali dalam kondisi sekarang.
2. **28 Server Action bisa dipanggil tanpa login**, termasuk `createAdminAction` — orang asing dapat membuat akun admin baru dan mengambil alih seluruh dashboard. Diperparah oleh CVE Next.js aktif (`GHSA-955p-x3mx-jcvp`) yang justru membocorkan daftar endpoint Server Function ke penyerang tanpa autentikasi.

---

## KATEGORI 1 — UI/UX & Design

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 1 | Konsistensi class prefix `admin-` | ✅ OK | Prefix dipakai konsisten di seluruh `admin.css` (2.018 baris), sesuai konvensi CLAUDE.md | `app/admin/admin.css` |
| 2 | Tidak ada styling konflik | ⚠️ Perlu Perhatian | Banyak inline `style={{...}}` di halaman admin, di luar sistem CSS. Menyulitkan maintenance & theming dark mode | `admin/(dashboard)/gallery/page.tsx:24`, `showcase/page.tsx:22`, `orders/OrdersClient.tsx:325` |
| 3 | Struktur heading H1→H2→H3 | ✅ OK | 54 file punya `<h1>`. Homepage memakai `<h1 class="hero-title">` via komponen Hero (terverifikasi di HTML render) | `components/Hero.tsx` |
| 4 | Breadcrumb navigasi | ⚠️ Perlu Perhatian | CSS breadcrumb lengkap & rapi, tapi **hanya dipakai di halaman detail produk**. Halaman service detail, berita, dan custom tidak punya | `components/ProductDetail.tsx:86`, `app/globals.css:934` |
| 5 | Semua gambar punya `alt` deskriptif | ⚠️ Perlu Perhatian | 4 ikon service memakai `alt=""` (kosong). Total 29 `alt` terpasang dari ~33 gambar | `app/service/[id]/page.tsx:55,130`, `app/service/ServicePageClient.tsx:30`, `components/Service.tsx:27` |
| 6 | Indikator jumlah item cart di semua halaman | ✅ OK | Badge `totalItems` di Navbar (global, muncul di semua halaman) + badge di CartDrawer | `components/Navbar.tsx:165`, `components/CartDrawer.tsx:28` |
| 7 | Halaman 404 custom | ❌ Belum Ada | Tidak ada `app/not-found.tsx`. Pengguna dapat halaman 404 default Next.js yang polos dan tanpa branding | — |
| 8 | Halaman error & loading custom | ❌ Belum Ada | Tidak ada `app/error.tsx` maupun `app/loading.tsx`. Error runtime tampil tanpa penanganan yang ramah | — |
| 9 | Filter produk | ✅ OK | Filter kategori via tab, mendukung multi-kategori | `app/product/ProductsClient.tsx:12-14` |
| 10 | Sorting produk | ❌ Belum Ada | Tidak ada opsi urutkan (harga, terbaru, nama). Urutan hanya mengikuti `sortOrder` dari admin | `app/product/ProductsClient.tsx` |
| 11 | Zoom gambar produk | ❌ Belum Ada | Tidak ada zoom/lightbox/magnifier di halaman detail produk — penting untuk e-commerce fashion | `components/ProductDetail.tsx` |
| 12 | Responsivitas mobile/tablet | ✅ OK | 36 media query (26 di globals.css, 10 di admin.css), breakpoint 420–960px tersebar baik | `app/globals.css`, `app/admin/admin.css` |
| 13 | State `:hover` pada CTA | ✅ OK | 136 deklarasi `:hover` | `app/globals.css` |
| 14 | State `:active` pada CTA | ❌ Belum Ada | **0 deklarasi `:active`** di seluruh CSS. Tombol Beli/Checkout tidak memberi umpan balik saat ditekan — terasa "mati" di mobile | `app/globals.css` |
| 15 | Aksesibilitas keyboard (`:focus`) | ⚠️ Perlu Perhatian | Hanya 16 `:focus` untuk 136 `:hover`. Navigasi keyboard kurang terlihat | `app/globals.css` |

---

## KATEGORI 2 — Performance & Speed

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 1 | `images.remotePatterns` ke Supabase Storage | ✅ OK | Terkonfigurasi benar, dibatasi ke path `/storage/v1/object/public/**` (praktik baik) | `next.config.mjs:34-42` |
| 2 | Turbopack | ✅ OK | Aktif di dev & build (default Next 16), compile 4.2 detik | `next.config.mjs` |
| 3 | `output: 'standalone'` | ⚠️ Perlu Perhatian | Tidak diset. Tidak masalah untuk Vercel, tapi wajib jika nanti pindah ke Docker/VPS | `next.config.mjs` |
| 4 | Pakai `<Image>` bukan `<img>` | ⚠️ Perlu Perhatian | **16 tag `<img>` mentah** vs 7 file yang pakai `next/image`. Kehilangan optimasi WebP/AVIF, lazy loading, dan pencegahan CLS | `components/ChatBot.tsx:170`, `CustomDesignClient.tsx:944,951`, `CustomProductCard.tsx:16`, `Service.tsx:27`, + 11 lainnya |
| 5 | Pagination / infinite scroll di listing produk | ❌ Belum Ada | **Seluruh produk di-render sekaligus** tanpa pagination. Aman saat katalog kecil, akan berat begitu produk >100 | `app/product/ProductsClient.tsx:57` |
| 6 | Query Supabase dengan kolom spesifik | ⚠️ Perlu Perhatian | **39 pemakaian `select('*')`**. Paling boros di `orders` (kolom JSONB `customer` + `items` ikut tertarik semua) dan `products` | `lib/orders.ts:49,54,77`, `lib/data.ts:132,144,185`, +34 lainnya |
| 7 | Caching data | ✅ OK | `unstable_cache` dengan tag & revalidate rapi: products/services 300s, content 3600s, plus invalidasi via `revalidateTag` | `lib/data.ts:130,183,306,366` |
| 8 | Font dengan `display: swap` | ✅ OK | Tidak ada Google Fonts / `@font-face` sama sekali — memakai system font stack. Ini justru paling cepat, nol render-blocking | `app/globals.css` |
| 9 | Script Midtrans snap.js | ⚠️ Perlu Perhatian | Di CheckoutForm pakai `strategy="afterInteractive"` (bisa diturunkan ke `lazyOnload`). Di RepayButton dibuat manual via `document.createElement` — di luar kendali Next.js Script | `components/CheckoutForm.tsx:240`, `components/RepayButton.tsx:27-32` |
| 10 | Google Translate | ✅ OK | Hanya di-whitelist di CSP, tidak di-load sebagai script pihak ketiga. Nol beban | `next.config.mjs:14` |
| 11 | Cache-Control untuk halaman statis | ❌ Belum Ada | Tidak ada header Cache-Control di `next.config.mjs`. Hanya header CSP yang diset | `next.config.mjs:44-53` |
| 12 | `generateStaticParams` untuk produk | ✅ OK | Halaman detail produk di-prerender saat build | `app/product/[id]/page.tsx:6` |

---

## KATEGORI 3 — SEO

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 1 | Canonical tag per halaman | 🔒❌ **KRITIS** | **Semua halaman detail menunjuk canonical ke homepage.** Root layout menetapkan `alternates:{canonical:'/'}`; `generateMetadata` di product/service/berita detail tidak menimpanya, jadi nilainya diwarisi. Terverifikasi live: `/product/1` → `canonical=https://erinnear.com`, `/service/1` → sama, `/berita/tips-...` → sama. **Google akan men-deindeks seluruh halaman produk** karena dianggap duplikat homepage | `app/layout.tsx:27`, `app/product/[id]/page.tsx:18-26` |
| 2 | Canonical halaman statis | ✅ OK | Halaman yang memakai `buildPageMetadata` benar: `/product`, `/service`, `/custom`, `/contact`, `/berita` | `lib/data.ts:98` |
| 3 | `metadata` / `generateMetadata` per halaman | ✅ OK | Semua halaman publik punya metadata. Halaman admin/reseller tidak punya — wajar karena tidak diindeks | 24 halaman publik |
| 4 | Sitemap dinamis | ✅ OK | Sangat baik: static + custom + produk + service + berita, lengkap dengan `lastModified`, `changeFrequency`, `priority` | `app/sitemap.ts` |
| 5 | robots.txt | ✅ OK | `/admin`, `/checkout`, `/orders`, `/profile`, `/reseller/dashboard`, dan halaman auth sudah di-disallow. Sitemap terdaftar | `app/robots.ts` |
| 6 | Slug produk deskriptif | ❌ Belum Ada | URL memakai ID numerik `Date.now()` → `/product/1`, `/product/1753875600000`. Tidak ada kata kunci di URL. Berita sudah benar pakai slug | `lib/actions.ts:98`, `app/product/[id]/` |
| 7 | JSON-LD schema Product | ✅ OK | Schema Product lengkap: name, description, image, brand, offers (harga + mata uang + ketersediaan) | `app/product/[id]/page.tsx:42-55` |
| 8 | JSON-LD BreadcrumbList | ❌ Belum Ada | Breadcrumb visual ada tapi tanpa markup terstruktur — tidak muncul di hasil pencarian | `components/ProductDetail.tsx:86` |
| 9 | JSON-LD Organization / LocalBusiness | ❌ Belum Ada | Tidak ada schema organisasi di root layout | `app/layout.tsx` |
| 10 | `alt` tidak kosong di semua gambar | ⚠️ Perlu Perhatian | 4 ikon service `alt=""` | lihat Kategori 1 #5 |
| 11 | hreflang multi-bahasa | ❌ Belum Ada | Situs dwibahasa (ID/EN) tapi bahasa disimpan di **localStorage saja** — tidak ada route `/en`, tidak ada hreflang, `<html lang="id">` selalu statis. **Versi Inggris tidak bisa diindeks Google sama sekali** | `context/LanguageContext.tsx:55-62`, `app/layout.tsx:51` |
| 12 | Open Graph & Twitter Card | ✅ OK | Lengkap di root + per halaman, plus `opengraph-image.tsx` | `app/layout.tsx:28-40`, `app/opengraph-image.tsx` |
| 13 | Google Site Verification | ✅ OK | Dapat dikelola dari CMS admin | `app/layout.tsx:27` |

---

## KATEGORI 4 — Security

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 1 | Server Action mutasi cek session | 🔒❌ **KRITIS** | **28 Server Action tanpa cek autentikasi apa pun.** Server Action = endpoint HTTP publik. Paling berbahaya: `createAdminAction` (buat akun admin → ambil alih penuh), `createRoleAction`/`updateRoleAction` (buat role all-permission), `deleteAdminAction`, `deleteMemberAction` (hapus pelanggan), `saveContentAction` (ganti seluruh konten situs), `deletePembukuanAction` (hapus data keuangan), seluruh CRUD produk & service | `lib/actions.ts:97,137,177,185,215,246,263,284,374,388,405,409,424,439,447,457,688,703,737,749,764,771,787,820,850,936,977,1424` |
| 2 | Validitas cookie admin | 🔒❌ **KRITIS** | ~30 action lain hanya memakai `if (!jar.get('admin-token')) return` — memeriksa **keberadaan**, bukan keabsahan. Cookie `admin-token=apasaja` lolos ke `adminUpdateOrderStatus`, pembukuan, pricing, pesan order, dsb | `lib/actions.ts:312,344,588,611,712,860,881,895,925,1147,1178,1188,1208,1267,1283,1357,1412,1419` |
| 3 | Cookie sesi pelanggan | 🔒❌ **KRITIS** | `user-session` berisi **email mentah tanpa tanda tangan**. Siapa pun bisa memalsukannya untuk membaca profil & riwayat pesanan orang lain (nama, telepon, alamat lengkap). **Terverifikasi live:** `curl -H "Cookie: user-session=notreal-audit-test@example.com" /orders` → **HTTP 200**, halaman ter-render | `lib/actions.ts:560,575`; `app/orders/page.tsx:13` |
| 4 | Manipulasi harga checkout | 🔒❌ **KRITIS** | `unitPrice` diambil dari JSON cart kiriman browser, begitu pula `kurir.price`. Pembeli dapat mengubah harga menjadi Rp1.000 dan Midtrans menagih sesuai itu. Harga wajib diambil ulang dari DB berdasarkan `productId`+`size` | `lib/actions.ts:509-521`; `components/CheckoutForm.tsx:213` |
| 5 | RBAC dipakai konsisten | 🔒❌ **KRITIS** | Fungsi `hasPermission()` didefinisikan tapi **tidak pernah dipanggil di mana pun**. Sidebar hanya menyembunyikan link — admin role terbatas cukup mengetik `/admin/pembukuan`, `/admin/rekap`, atau `/admin/roles` untuk membuka data keuangan & manajemen akun | `lib/rbac.ts:86`; `admin/(dashboard)/pembukuan/page.tsx:17-19`; `rekap/page.tsx:15-16` |
| 6 | Kerentanan dependensi (`npm audit`) | 🔒❌ **KRITIS** | **5 kerentanan (4 high).** Yang paling relevan: **`GHSA-955p-x3mx-jcvp` — Next.js: Unauthenticated disclosure of internal Server Function endpoints.** CVE ini **melipatgandakan dampak temuan #1**: penyerang tak terautentikasi bisa menemukan daftar Server Action lalu memanggil yang tanpa proteksi. Plus `postcss` (XSS + path traversal), `sharp`/libvips (4 CVE), DoS Image Optimization via SVG. Perbaikan tersedia: `npm audit fix` | `package.json` |
| 7 | Endpoint chatbot: auth & rate limit | 🔒❌ Belum Ada | `/api/chat` terbuka penuh tanpa auth maupun rate limit. Siapa pun bisa memanggil berulang dan **membakar kuota API Anthropic Anda** | `app/api/chat/route.ts:44` |
| 8 | Rate limiting login | 🔒❌ Belum Ada | Tidak ada pembatasan pada login admin, reseller, maupun user → brute force bebas | `lib/actions.ts:63,564,1032` |
| 9 | Upload file tanpa auth & validasi | 🔒⚠️ | `uploadDesignFileAction` terbuka tanpa auth, tanpa batas ukuran, ekstensi diambil dari nama file kiriman user, `contentType` dari client. Storage Supabase bisa dipenuhi penyerang | `lib/actions.ts:474-496` |
| 10 | Kebocoran data order | 🔒⚠️ | `lookupOrders` tanpa auth — kirim email apa pun, dapat seluruh order beserta alamat & telepon | `lib/actions.ts:539` |
| 11 | Verifikasi signature Midtrans | ✅ OK | SHA-512 atas `order_id+status_code+gross_amount+server_key`, benar sesuai spesifikasi. **Terverifikasi live:** signature palsu → HTTP 403 | `app/api/midtrans/webhook/route.ts:11-18` |
| 12 | Proteksi route `/admin/*` | ✅ OK | Middleware + layout server-side yang memvalidasi ke DB via `getAdminById`. **Terverifikasi live:** `admin-token=fake123` → 307 redirect ke `/admin/login`. Reseller layout juga cek `active` | `middleware.ts:16-21`; `admin/(dashboard)/layout.tsx:10-13`; `reseller/(dashboard)/layout.tsx:12-14` |
| 13 | Kredensial ter-hardcode di source | ✅ OK | Nol hardcode. Semua via `process.env`, `.env.local` sudah masuk `.gitignore`. `SUPABASE_SECRET_KEY` hanya dipakai server-side | `lib/db.ts`, `.gitignore` |
| 14 | Hashing password | ✅ OK | scrypt + salt acak 16 byte + `timingSafeEqual`. Praktik yang benar | `lib/users.ts:48-59`; `lib/rbac.ts:70-84` |
| 15 | `verifyPassword` bisa melempar exception | ⚠️ Perlu Perhatian | Versi user tanpa `try/catch` — `timingSafeEqual` melempar jika panjang buffer berbeda (hash rusak) → HTTP 500. Versi admin sudah dibungkus `try/catch` | `lib/users.ts:57` vs `lib/rbac.ts:78` |
| 16 | Token reset password | ✅ OK | 32 byte acak, expiry 24 jam, flag `used`, divalidasi atomik saat dikonsumsi | `lib/users.ts:61-84` |
| 17 | Row Level Security Supabase | 🔒⚠️ | **Nol policy RLS di 23 tabel.** Saat ini tertahan karena hanya secret key server-side yang dipakai, tapi tidak ada lapisan pertahanan kedua bila key bocor | `supabase-schema.sql` |
| 18 | CSP headers | ⚠️ Perlu Perhatian | Whitelist Midtrans/Vercel/Google Translate sudah benar. RajaOngkir tidak perlu (dipanggil server-side). Namun `'unsafe-inline'` + `'unsafe-eval'` di `script-src` melemahkan proteksi XSS | `next.config.mjs:11` |
| 19 | Logging akses data sensitif | ⚠️ Perlu Perhatian | `admin_access_log` hanya mencatat `login`, `logout`, `login_failed`. **Akses/perubahan data pelanggan, order, dan keuangan tidak tercatat** — tidak ada jejak audit saat insiden | `lib/access-log.ts:3`; hanya 3 pemanggil di `lib/actions.ts:73,79,90` |
| 20 | Prompt injection chatbot | ✅ OK | System prompt hanya menyisipkan data produk/service dari DB (dikontrol admin), bukan input pengguna. Pesan user diteruskan sebagai `messages`, bukan digabung ke system prompt — struktur yang benar | `app/api/chat/route.ts:6-40` |
| 21 | Cookie flags | ⚠️ Perlu Perhatian | `httpOnly` + `sameSite:'lax'` sudah ada, tapi **`secure: true` tidak diset** — cookie bisa terkirim via HTTP polos | `lib/actions.ts:78,560,575,1046` |

---

## KATEGORI 5 — Functionality

### Cart

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 1 | Akurasi subtotal termasuk update quantity | ✅ OK | `totalPrice` dan `totalItems` dihitung via reduce atas quantity, konsisten | `context/CartContext.tsx:110-114` |
| 2 | Persistensi cart saat refresh | ✅ OK | Disimpan ke `localStorage` key `erinnear-cart` | `context/CartContext.tsx:50-59` |
| 3 | Race hidrasi localStorage | ⚠️ Perlu Perhatian | Effect penulis berjalan bersamaan dengan effect pembaca pada mount, sempat menimpa storage dengan `[]` sebelum data terbaca kembali. Cart bisa hilang bila halaman ditutup tepat saat hidrasi | `context/CartContext.tsx:50-59` |

### Checkout & Midtrans

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 4 | Parameter order ke Midtrans | ✅ OK | `gross_amount`, `item_details`, `customer_details`, billing/shipping address terkirim benar. Nama item dipotong 50 char sesuai batas Midtrans | `lib/midtrans.ts:20-52` |
| 5 | Webhook update status order | ⚠️ Perlu Perhatian | Pemetaan status benar (capture/settlement/pending/deny/cancel/expire + `fraud_status`), tapi **`updateOrderStatus()` tidak di-`await`**. Di serverless, response balik lebih dulu dan fungsi bisa dibekukan sebelum DB tertulis → **pembayaran masuk tapi status tetap pending** | `app/api/midtrans/webhook/route.ts:56` |
| 6 | Webhook mengurangi stok setelah bayar | ❌ Belum Ada | **Stok tidak pernah berkurang saat produk terjual.** `adjustStock` hanya dipakai oleh aksi manual admin. Data gudang akan terus melenceng dari kenyataan | `app/api/midtrans/webhook/route.ts`; `lib/actions.ts:901` |
| 7 | Fallback bila webhook tidak datang | ❌ Belum Ada | Tidak ada polling status maupun rekonsiliasi terjadwal. Jika webhook gagal terkirim, order menggantung di `pending` selamanya | `components/CheckoutForm.tsx`, `app/checkout/success/` |

### Ongkir

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 8 | Error handling RajaOngkir timeout/down | ✅ OK | `AbortController` timeout 5 detik, `try/catch` di semua fungsi, cache 24 jam untuk daftar kota | `lib/rajaongkir.ts:26-30` |
| 9 | UX saat API ongkir gagal | ✅ OK | Menampilkan daftar estimasi + pesan "harga final dikonfirmasi admin" alih-alih layar kosong | `components/CheckoutForm.tsx:362-366` |
| 10 | Ongkir dihitung ulang di server | 🔒❌ Belum Ada | Server menerima `kurir.price` mentah dari client tanpa verifikasi ulang. Ongkir bisa dimanipulasi jadi Rp0 | `lib/actions.ts:519-521`; `components/CheckoutForm.tsx:213` |
| 11 | Berat pengiriman | ⚠️ Perlu Perhatian | `WEIGHT_GRAMS = 500` di-hardcode, tidak dikalikan jumlah item. Order 20 pcs tetap dihitung 500 gram → ongkir jauh di bawah biaya riil, selisihnya ditanggung Anda | `lib/rajaongkir.ts:4` |

### Stok & Warehouse

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 12 | Cek stok tersedia sebelum order diproses | ❌ Belum Ada | `createCheckoutOrder` tidak menyentuh tabel `warehouse_stock` sama sekali. **Produk habis tetap bisa dibeli** | `lib/actions.ts:497-538` |
| 13 | Proteksi race condition | ❌ Belum Ada | Tidak ada transaksi, row lock, maupun update atomik. Pola `select` lalu `update` terpisah. Dua pembeli item terakhir akan sama-sama berhasil | `lib/warehouse.ts:41-75` |

### Orders & Pembukuan

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 14 | Order history difilter per user | ⚠️ Perlu Perhatian | Query benar difilter (`getOrdersByEmail`), tapi identitasnya berasal dari cookie yang bisa dipalsukan (lihat Security #3), dan `lookupOrders` terbuka tanpa auth (Security #10) | `lib/orders.ts:76-81` |
| 15 | Akurasi kalkulasi rekap keuangan | ✅ OK | Rentang tanggal bulanan dihitung benar termasuk tahun kabisat (`new Date(year, month, 0).getDate()`), pemisahan pemasukan/pengeluaran konsisten | `lib/pembukuan.ts:26-51` |
| 16 | Pembukuan hanya bisa diakses admin | 🔒❌ | Halaman mengambil data admin hanya untuk **menampilkan nama**, bukan untuk otorisasi. Tidak ada cek permission — semua role admin bisa membuka data keuangan | `admin/(dashboard)/pembukuan/page.tsx:17-19` |

### Chatbot

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 17 | Chatbot berfungsi | ❌ **RUSAK TOTAL** | **`ANTHROPIC_API_KEY` kosong (panjang 0)** di `.env.local`. **Terverifikasi live:** POST `/api/chat` → HTTP 500, log server: `Could not resolve authentication method` | `.env.local`; `app/api/chat/route.ts:4` |
| 18 | Penanganan error streaming | ❌ Bermasalah | Error terjadi di dalam `ReadableStream.start` **setelah header terkirim**, sehingga `try/catch` di route tidak menangkapnya → `failed to pipe response`. Pengguna melihat chat menggantung | `app/api/chat/route.ts:59-72` |
| 19 | Model `claude-haiku-4-5-20251001` valid | ✅ OK | ID model benar dan masih aktif | `app/api/chat/route.ts:48` |
| 20 | Limit `max_tokens` | ✅ OK | `max_tokens: 512` — pembatas biaya yang wajar | `app/api/chat/route.ts:49` |
| 21 | Data sensitif di riwayat percakapan | ✅ OK | Percakapan hanya di state React, tidak dipersistensi ke DB/localStorage. Hilang saat refresh | `components/ChatBot.tsx` |

### Email & Notifikasi

| # | Item | Status | Keterangan | File/Lokasi |
|---|------|--------|------------|-------------|
| 22 | Email konfirmasi pesanan | ❌ **KRITIS** | **Tidak ada layanan email sama sekali** — nol dependensi nodemailer/resend/sendgrid, nol kode pengiriman email. Pelanggan yang sudah membayar tidak menerima konfirmasi apa pun | seluruh codebase |
| 23 | Email reset password | ❌ Belum Ada | Link reset harus di-*generate* admin lalu dikirim manual. Halaman `/forgot-password` ada tapi tidak bisa mengirim email sendiri | `lib/actions.ts:708-718` |
| 24 | Nama env var link reset | ❌ Bermasalah | Kode memakai `NEXT_PUBLIC_SITE_URL`, sedangkan `.env.local` hanya punya `NEXT_PUBLIC_BASE_URL`. Akibatnya link reset selalu jadi `http://localhost:3000/...` di produksi | `lib/actions.ts:716` |
| 25 | Notifikasi order baru ke admin | ❌ Belum Ada | Tidak ada email/WhatsApp/push. Admin harus memantau dashboard secara manual | — |

---

## Ringkasan Eksekutif

| Kategori | ✅ OK | ⚠️ Perhatian | ❌ Masalah | 🔒 Security |
|----------|-------|-------------|-----------|------------|
| UI/UX & Design | 6 | 4 | 5 | — |
| Performance | 5 | 5 | 2 | — |
| SEO | 6 | 1 | 5 | 1 |
| Security | 6 | 6 | 9 | **11** |
| Functionality | 9 | 5 | 11 | 3 |
| **Total** | **32** | **21** | **32** | **15** |

**Total item diperiksa: 85**

Catatan: kolom 🔒 menghitung item yang berimplikasi keamanan dan sudah ikut dihitung di kolom ⚠️/❌.

### Kondisi Keseluruhan

| Aspek | Nilai | Catatan |
|---|---|---|
| Build & Deployability | 🔴 **Gagal** | Type error memblokir `npm run build` |
| Keamanan | 🔴 **Kritis** | Kontrol akses efektif tidak ada di lapisan Server Action |
| SEO | 🟡 **Sedang** | Fondasi bagus (sitemap, robots, JSON-LD) tapi dirusak bug canonical |
| Performance | 🟢 **Baik** | Caching rapi, nol font eksternal, Turbopack |
| UI/UX | 🟢 **Baik** | Responsif & konsisten; kurang polish (404, zoom, `:active`) |
| Fungsionalitas Inti | 🟡 **Ada Lubang** | Alur bayar jalan, tapi stok & email hilang |

---

## Prioritas Perbaikan

### 🔴 Kritis — harus fix sebelum production

| # | Item | Estimasi | Referensi |
|---|------|----------|-----------|
| 1 | **Perbaiki type error build** — tambahkan field `tag` pada `createService` | 5 menit | `lib/actions.ts:270` |
| 2 | **Buat helper `requireAdmin(permission)`** yang memvalidasi cookie ke DB **dan** mengecek permission, lalu pasang ke seluruh 28 action tanpa proteksi + 30 action yang cek-nya lemah | 4–6 jam | Security #1, #2, #5 |
| 3 | **Tanda tangani cookie sesi** (HMAC) atau pindah ke tabel session; ganti isi `user-session` dari email mentah ke ID sesi | 2–3 jam | Security #3 |
| 4 | **Hitung ulang harga di server** — ambil harga produk & ongkir dari DB berdasarkan `productId`+`size`, abaikan nilai dari client | 2–3 jam | Security #4, Functionality #10 |
| 5 | **`npm audit fix`** — tutup CVE Next.js yang membocorkan endpoint Server Function | 15 menit + regresi | Security #6 |
| 6 | **Perbaiki canonical tag** — set `alternates.canonical` di tiap `generateMetadata` halaman detail | 30 menit | SEO #1 |
| 7 | **Isi `ANTHROPIC_API_KEY`** atau nonaktifkan widget chatbot | 5 menit | Functionality #17 |
| 8 | **Tambahkan `await`** pada `updateOrderStatus` di webhook | 1 menit | Functionality #5 |
| 9 | **Pasang layanan email** (Resend/SendGrid) untuk konfirmasi pesanan & reset password | 4–6 jam | Functionality #22, #23 |
| 10 | **Kurangi stok setelah pembayaran sukses** + cek ketersediaan sebelum order | 3–4 jam | Functionality #6, #12 |
| 11 | **Rate limiting** pada login, `/api/chat`, form kontak, dan upload | 2–3 jam | Security #7, #8, #9 |

**Total estimasi kritis: ~3–4 hari kerja**

### 🟡 Penting — fix dalam sprint berikutnya

1. Aktifkan RLS di 23 tabel Supabase sebagai pertahanan berlapis *(Security #17)*
2. Set `secure: true` pada semua cookie *(Security #21)*
3. Tutup `lookupOrders` dengan autentikasi *(Security #10)*
4. Perluas audit log ke akses data pelanggan, order, dan keuangan *(Security #19)*
5. Bungkus `verifyPassword` dengan `try/catch` *(Security #15)*
6. Perbaiki nama env var `NEXT_PUBLIC_SITE_URL` → `NEXT_PUBLIC_BASE_URL` *(Functionality #24)*
7. Berat kirim dihitung dari jumlah item, bukan 500g tetap *(Functionality #11)*
8. Proteksi race condition stok dengan update atomik *(Functionality #13)*
9. Buat `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx` *(UI/UX #7, #8)*
10. Tambahkan hreflang + routing `/en` agar versi Inggris terindeks *(SEO #11)*
11. Ganti slug produk numerik jadi deskriptif, dengan redirect 301 *(SEO #6)*
12. Fallback polling status pembayaran *(Functionality #7)*
13. Ganti 16 `<img>` mentah dengan `next/image` *(Performance #4)*

### 🟢 Opsional — nice to have

1. Tambahkan state `:active` pada semua CTA *(UI/UX #14)*
2. Zoom/lightbox gambar produk *(UI/UX #11)*
3. Sorting produk (harga, terbaru, nama) *(UI/UX #10)*
4. Breadcrumb di service detail, berita, dan custom *(UI/UX #4)*
5. JSON-LD BreadcrumbList & Organization *(SEO #8, #9)*
6. Isi `alt` deskriptif pada 4 ikon service *(UI/UX #5, SEO #10)*
7. Ganti `select('*')` dengan kolom spesifik, terutama pada tabel `orders` *(Performance #6)*
8. Pagination listing produk sebelum katalog >100 item *(Performance #5)*
9. Pindahkan inline style admin ke `admin.css` *(UI/UX #2)*
10. Header Cache-Control untuk aset statis *(Performance #11)*
11. Perluas cakupan `:focus` untuk aksesibilitas keyboard *(UI/UX #15)*
12. Tambahkan test suite — Playwright sudah terpasang tapi belum dipakai sama sekali

---

## Lampiran — Bukti Pengujian Live

Dijalankan terhadap dev server di `localhost:3000` pada 31 Juli 2026.

```
# Proteksi route admin — LULUS
GET /admin                              → 307 → /admin/login
GET /admin  (Cookie: admin-token=fake123) → 307 → /admin/login

# Pemalsuan sesi pelanggan — GAGAL (kerentanan terkonfirmasi)
GET /orders (Cookie: user-session=notreal-audit-test@example.com)
                                        → 200 OK, halaman "Riwayat Pesanan" ter-render

# Verifikasi signature webhook — LULUS
POST /api/midtrans/webhook (signature_key: "bogus")
                                        → 403 {"error":"Invalid signature"}

# Chatbot — GAGAL
POST /api/chat                          → 500, "Could not resolve authentication method"

# Canonical tag — GAGAL pada semua halaman detail
GET /product/1        → canonical = https://erinnear.com        ❌ (harusnya /product/1)
GET /service/1        → canonical = https://erinnear.com        ❌ (harusnya /service/1)
GET /berita/tips-...  → canonical = https://erinnear.com        ❌
GET /product          → canonical = https://erinnear.com/product ✅
GET /service          → canonical = https://erinnear.com/service ✅

# Ketersediaan 18 route publik — SEMUA LULUS (HTTP 200)
/  /product  /service  /contact  /custom  /berita  /login  /register  /checkout
/custom/{tshirt,hoodie,jersey,totebag,coach-jacket,amplop-packaging}
/admin/login  /reseller/login  /forgot-password

# Build produksi — GAGAL
npm run build → exit 1
  ./lib/actions.ts:270 — Property 'tag' is missing in type ... but required in type 'ServiceItem'

# npm audit — 5 kerentanan (1 low, 4 high)
  next    — Unauthenticated disclosure of internal Server Function endpoints (GHSA-955p-x3mx-jcvp)
  next    — DoS in Image Optimization API using SVGs (GHSA-q8wf-6r8g-63ch)
  postcss — XSS + path traversal via sourceMappingURL (3 advisory)
  sharp   — libvips CVE-2026-33327/33328/35590/35591
```
