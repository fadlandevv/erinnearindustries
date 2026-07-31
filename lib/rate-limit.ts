/*
  Rate limiter sederhana berbasis memori (sliding window).

  Keterbatasan yang perlu disadari: state disimpan per-instance. Di Vercel
  serverless, tiap instance punya hitungan sendiri, jadi batas efektifnya
  adalah `limit × jumlah instance aktif`. Ini tetap memblokir brute force dan
  penyalahgunaan otomatis dari satu sumber, tapi bukan pengganti rate limiter
  terpusat. Bila trafik sudah besar, pindahkan ke Upstash Redis / Vercel KV
  dengan mempertahankan tanda tangan fungsi di bawah ini.
*/

type Hit = { count: number; resetAt: number }

const buckets = new Map<string, Hit>()
let lastSweep = Date.now()

function sweep(now: number) {
  // Bersihkan entri kedaluwarsa sesekali agar Map tidak tumbuh tanpa batas.
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number }

/**
 * @param key    pengenal unik (mis. `login:1.2.3.4`)
 * @param limit  jumlah percobaan yang diizinkan per jendela waktu
 * @param windowSeconds panjang jendela waktu
 */
export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const hit = buckets.get(key)
  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { ok: true }
  }

  if (hit.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((hit.resetAt - now) / 1000)) }
  }

  hit.count++
  return { ok: true }
}

/** Hapus hitungan untuk sebuah key — dipanggil setelah login berhasil. */
export function resetRateLimit(key: string): void {
  buckets.delete(key)
}
