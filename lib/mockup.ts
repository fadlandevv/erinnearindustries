/*
  Konfigurasi mockup produk + perender mockup ke gambar.

  Modul ini aman diimpor dari client maupun server (tidak menyentuh API Node.js
  atau Supabase). Angka-angka di sini sebelumnya hidup di CustomDesignClient;
  dipindah ke sini supaya halaman custom (publik) dan halaman order manual
  (admin) memakai sumber yang sama — kalau area cetak digeser, keduanya ikut.
*/

export type Side = 'front' | 'back'
export type DesignPos = { x: number; y: number }
/**
 * Penempatan desain relatif terhadap kotak area cetak: `x`/`y` dalam satuan
 * viewBox mockup (300 lebar), `rot` dalam derajat. Semuanya 0 = posisi bawaan.
 */
export type DesignPlacement = { x: number; y: number; rot: number }
export type DesignSize = 'logo' | 'a4' | 'a3'
export type AmplopDesignSize = 'kecil' | 'sedang' | 'besar'

export type DesignArea = { x: number; y: number; w: number; h: number }
export type MockupConfig = { front: string; back: string; vb: string; da: DesignArea }

export const PHOTO_MOCKUPS: Record<string, MockupConfig> = {
  tshirt:            { front: '/mockups/tshirt.png',               back: '/mockups/tshirt-back.png',           vb: '0 0 300 300', da: { x: 90, y: 90,  w: 120, h: 120 } },
  totebag:           { front: '/mockups/totebag.png',              back: '/mockups/totebag.png',               vb: '0 0 300 300', da: { x: 85, y: 110, w: 130, h: 130 } },
  'coach-jacket':    { front: '/mockups/coachjacket.png',          back: '/mockups/coachjacket-belakang.png',  vb: '0 0 300 300', da: { x: 90, y: 100, w: 120, h: 120 } },
  hoodie:            { front: '/mockups/hoodiedepan.png',          back: '/mockups/hoodiebelakang.png',        vb: '0 0 300 300', da: { x: 90, y: 118, w: 120, h: 110 } },
  jersey:            { front: '/mockups/jerseydepan.png',          back: '/mockups/jerseybelakang.png',        vb: '0 0 300 300', da: { x: 90, y: 90,  w: 120, h: 120 } },
  'amplop-packaging':{ front: '/mockups/amplop-packaging.png',     back: '/mockups/amplop-packaging-back.png', vb: '0 0 300 375', da: { x: 75, y: 115, w: 150, h: 185 } },
}

export const DESIGN_SIZES: Record<DesignSize, DesignArea> = {
  logo: { x: 126, y: 82,  w: 48,  h: 48  },
  a4:   { x: 97,  y: 70,  w: 105, h: 130 },
  a3:   { x: 85,  y: 50,  w: 130, h: 195 },
}

export const AMPLOP_DESIGN_SIZES: Record<AmplopDesignSize, DesignArea> = {
  kecil:  { x: 110, y: 155, w: 80,  h: 100 },
  sedang: { x:  75, y: 115, w: 150, h: 185 },
  besar:  { x:   2, y:   8, w: 296, h: 360 },
}

export function mockupConfig(productType: string): MockupConfig {
  return PHOTO_MOCKUPS[productType] ?? PHOTO_MOCKUPS.tshirt
}

export function sablonToDesignSize(label?: string): DesignSize | undefined {
  if (!label) return undefined
  const l = label.toLowerCase()
  if (l.includes('logo')) return 'logo'
  if (l.includes('a3'))   return 'a3'
  return 'a4'
}

/** Kotak area cetak yang berlaku: ukuran amplop menang, lalu ukuran sablon, lalu bawaan produk. */
export function resolveDesignArea(
  productType: string,
  designSize?: DesignSize,
  amplopDesignSize?: AmplopDesignSize,
): DesignArea {
  if (productType === 'amplop-packaging' && amplopDesignSize) return AMPLOP_DESIGN_SIZES[amplopDesignSize]
  if (designSize) return DESIGN_SIZES[designSize]
  return mockupConfig(productType).da
}

/** Tinggi viewBox mockup — lebarnya selalu 300. */
export function mockupHeight(productType: string): number {
  return Number(mockupConfig(productType).vb.split(' ')[3]) || 300
}

// ── Render ke gambar (browser saja) ───────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Desain yang sudah tersimpan datang dari Supabase Storage (beda origin);
    // tanpa ini canvas ikut ternoda dan toDataURL() melempar SecurityError.
    if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Gagal memuat gambar: ${src}`))
    img.src = src
  })
}

export type ComposeMockupInput = {
  productType: string
  side: Side
  /** URL desain — blob dari upload barusan, atau URL storage. */
  designSrc: string
  pos?: DesignPos
  rot?: number
  designSize?: DesignSize
  amplopDesignSize?: AmplopDesignSize
  /** Pengali resolusi terhadap viewBox 300px. */
  scale?: number
}

/**
 * Menyusun foto mockup + desain jadi satu gambar JPEG (data URL), meniru persis
 * penempatan yang dilihat admin di layar: desain di-fit ke dalam kotak area
 * cetak (setara preserveAspectRatio="xMidYMid meet"), digeser sesuai drag, lalu
 * diputar pada titik tengahnya sendiri.
 *
 * Mengembalikan `null` bila salah satu gambar gagal dimuat atau canvas ternoda —
 * mockup hanya pelengkap, kegagalannya tidak boleh membatalkan pesanan.
 */
export async function composeMockupImage(input: ComposeMockupInput): Promise<string | null> {
  const { productType, side, designSrc, pos, rot = 0, designSize, amplopDesignSize } = input
  if (!designSrc || designSrc.startsWith('__pdf__:')) return null

  const s = input.scale ?? 3
  const cfg = mockupConfig(productType)
  const vbH = mockupHeight(productType)
  const da  = resolveDesignArea(productType, designSize, amplopDesignSize)

  try {
    const [base, design] = await Promise.all([
      loadImage(side === 'front' ? cfg.front : cfg.back),
      loadImage(designSrc),
    ])

    const canvas = document.createElement('canvas')
    canvas.width  = 300 * s
    canvas.height = vbH * s
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // JPEG tidak punya alpha — foto mockup bertransparansi butuh alas putih.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height)

    // "meet" = muat seluruhnya di dalam kotak, rasio asli dipertahankan.
    const fit = Math.min(da.w / design.width, da.h / design.height)
    const w = design.width * fit
    const h = design.height * fit
    const cx = (da.x + (pos?.x ?? 0) + da.w / 2) * s
    const cy = (da.y + (pos?.y ?? 0) + da.h / 2) * s

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((rot * Math.PI) / 180)
    ctx.drawImage(design, (-w / 2) * s, (-h / 2) * s, w * s, h * s)
    ctx.restore()

    return canvas.toDataURL('image/jpeg', 0.85)
  } catch {
    return null
  }
}
