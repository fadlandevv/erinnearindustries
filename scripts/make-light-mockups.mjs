/**
 * Regenerates public/mockups/light/* from the source photos in public/mockups/.
 *
 * The custom-order mockup is recoloured at runtime (see tintTransfer in
 * CustomDesignClient.tsx) by multiplying a grey base through the chosen colour.
 * Most source photos are of *black* garments, which can't be tinted — nothing
 * brightens black. This script stretches each garment's compressed luminance
 * range into a neutral grey around MOCKUP_BASE_TONE (210) so the tint has
 * something to work with, keeping the folds, seams and shadows intact.
 *
 * Run after adding or replacing any mockup photo:
 *   node scripts/make-light-mockups.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const SRC_DIR = 'public/mockups'
const OUT_DIR = 'public/mockups/light'

// Amplop packaging is deliberately absent — it has no colour picker.
const MOCKUPS = [
  'tshirt.png', 'tshirt-back.png',
  'hoodiedepan.png', 'hoodiebelakang.png',
  'jerseydepan.png', 'jerseybelakang.png',
  'coachjacket.png', 'coachjacket-belakang.png',
  'totebag.png',
]

const LO_OUT = 148, HI_OUT = 246, SHADOW_OUT = 88
// Fabrics with a very flat source range (jersey) would need a huge gain to fill
// [LO_OUT, HI_OUT] — that just amplifies weave noise, so cap it and narrow the output.
const MAX_GAIN = 4
const SCALE = 2 // downscale: averages out sensor noise and halves the file size

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
  return c
})

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function decode(file) {
  const b = fs.readFileSync(file)
  let p = 8
  const idat = []
  let w, h, bitDepth, colorType
  while (p < b.length) {
    const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8)
    if (type === 'IHDR') {
      w = b.readUInt32BE(p + 8); h = b.readUInt32BE(p + 12)
      bitDepth = b[p + 16]; colorType = b[p + 17]
    }
    if (type === 'IDAT') idat.push(b.subarray(p + 8, p + 8 + len))
    p += len + 12
  }
  if (bitDepth !== 8 || colorType !== 6) {
    throw new Error(`${file}: expected 8-bit RGBA (got bitDepth=${bitDepth} colorType=${colorType})`)
  }

  const data = zlib.inflateSync(Buffer.concat(idat))
  const bpp = 4, stride = w * bpp + 1
  const px = Buffer.alloc(w * h * bpp)
  for (let y = 0; y < h; y++) {
    const filter = data[y * stride]
    for (let x = 0; x < w * bpp; x++) {
      const left = x >= bpp ? px[y * w * bpp + x - bpp] : 0
      const up = y > 0 ? px[(y - 1) * w * bpp + x] : 0
      const upLeft = (x >= bpp && y > 0) ? px[(y - 1) * w * bpp + x - bpp] : 0
      let v = data[y * stride + 1 + x]
      if (filter === 1) v += left
      else if (filter === 2) v += up
      else if (filter === 3) v += (left + up) >> 1
      else if (filter === 4) {
        const est = left + up - upLeft
        const dl = Math.abs(est - left), du = Math.abs(est - up), dul = Math.abs(est - upLeft)
        v += (dl <= du && dl <= dul) ? left : (du <= dul ? up : upLeft)
      }
      px[y * w * bpp + x] = v & 255
    }
  }
  return { w, h, px }
}

function encode(file, w, h, px) {
  const stride = w * 4
  const raw = Buffer.alloc((stride + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 1 // Sub filter
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? px[y * stride + x - 4] : 0
      raw[y * (stride + 1) + 1 + x] = (px[y * stride + x] - left) & 255
    }
  }
  const chunk = (type, data) => {
    const out = Buffer.alloc(8 + data.length + 4)
    out.writeUInt32BE(data.length, 0)
    out.write(type, 4, 'ascii')
    data.copy(out, 8)
    out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length)
    return out
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]))
}

function lighten(name) {
  const { w, h, px } = decode(path.join(SRC_DIR, name))

  // Anchor the levels on the garment only — the surrounding pixels are transparent.
  const lum = []
  for (let i = 0; i < w * h; i++) {
    if (px[i * 4 + 3] > 200) lum.push(0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2])
  }
  lum.sort((a, b) => a - b)
  const lo = lum[Math.floor(lum.length * 0.03)], hi = lum[Math.floor(lum.length * 0.97)]

  const span = Math.min(HI_OUT - LO_OUT, MAX_GAIN * Math.max(hi - lo, 1))
  const mid = (LO_OUT + HI_OUT) / 2
  const loOut = mid - span / 2, hiOut = mid + span / 2

  const map = L => {
    if (L <= lo) return SHADOW_OUT + (L / Math.max(lo, 1)) * (loOut - SHADOW_OUT)
    const t = (L - lo) / Math.max(hi - lo, 1)
    // soft knee above the highlight anchor so specular hits don't clip flat
    const v = t <= 1 ? loOut + t * span : hiOut + (1 - Math.exp(-(t - 1) * 1.5)) * (255 - hiOut)
    return Math.min(255, v)
  }

  const ow = Math.round(w / SCALE), oh = Math.round(h / SCALE)
  const out = Buffer.alloc(ow * oh * 4)
  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      // Weight by alpha so transparent edge pixels don't drag the tone down.
      let sum = 0, alphaSum = 0, n = 0
      for (let dy = 0; dy < SCALE; dy++) {
        for (let dx = 0; dx < SCALE; dx++) {
          const sx = Math.min(w - 1, x * SCALE + dx), sy = Math.min(h - 1, y * SCALE + dy)
          const i = (sy * w + sx) * 4, a = px[i + 3]
          sum += map(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) * a
          alphaSum += a
          n++
        }
      }
      const v = alphaSum > 0 ? Math.round(sum / alphaSum) : 255
      const o = (y * ow + x) * 4
      out[o] = out[o + 1] = out[o + 2] = v
      out[o + 3] = Math.round(alphaSum / n)
    }
  }

  encode(path.join(OUT_DIR, name), ow, oh, out)
  console.log(`  ${name.padEnd(28)} ${ow}x${oh}  source range ${Math.round(lo)}–${Math.round(hi)}`)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
console.log(`Writing tintable mockup bases to ${OUT_DIR}/`)
for (const name of MOCKUPS) lighten(name)
console.log('Done.')
