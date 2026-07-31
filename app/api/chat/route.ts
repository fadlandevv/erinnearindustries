import Anthropic from '@anthropic-ai/sdk'
import { getProducts, getServices } from '@/lib/data'
import { rateLimit } from '@/lib/rate-limit'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function buildSystem() {
  const products = await getProducts()
  const services = await getServices()

  const productList = products
    .map((p) => `  - ${p.title} | Harga: ${p.price} | Ukuran: ${p.sizes.join(', ')}`)
    .join('\n')

  const serviceList = services
    .map((s) => `  - ${s.title}${s.tag ? ` [${s.tag}]` : ''}: ${s.desc}`)
    .join('\n')

  return `Kamu adalah asisten virtual Erinnear Industries, sebuah brand pakaian premium asal Indonesia.

Tentang Erinnear Industries:
- Brand pakaian dengan fokus pada kualitas, desain, dan pengalaman digital yang premium
- Menyediakan koleksi ready-to-wear mulai dari casual hingga formal
- Pembayaran melalui Midtrans (transfer bank, kartu kredit, QRIS, dll)

Produk yang tersedia saat ini:
${productList || '  (belum ada produk)'}

Layanan yang tersedia:
${serviceList || '  (belum ada layanan)'}

Cara menjawab:
- Gunakan Bahasa Indonesia yang ramah, sopan, dan profesional
- Jawaban singkat dan to the point (2-4 kalimat), kecuali jika ditanya detail
- Jika ditanya produk spesifik atau ingin beli, arahkan ke halaman /product
- Jika ditanya layanan lebih lanjut, arahkan ke halaman /service
- Jika ingin hubungi tim, arahkan ke halaman /contact
- Jika ada pertanyaan pesanan, arahkan ke halaman /orders
- Jangan menjawab hal di luar konteks brand atau tidak relevan`
}

export async function POST(req: Request) {
  try {
    // Endpoint ini memakai kuota API berbayar, jadi harus dibatasi walau publik.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? req.headers.get('x-real-ip') ?? 'unknown'
    const limited = rateLimit(`chat:${ip}`, 20, 300)
    if (!limited.ok) {
      return Response.json(
        { error: 'Terlalu banyak pesan. Coba lagi sebentar lagi.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } },
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Tanpa cek ini kegagalan muncul di tengah stream (setelah header terkirim),
      // sehingga try/catch di bawah tidak menangkapnya dan chat menggantung.
      console.error('[chat] ANTHROPIC_API_KEY belum diset')
      return Response.json(
        { error: 'Chatbot sedang tidak tersedia. Silakan hubungi kami lewat halaman /contact.' },
        { status: 503 },
      )
    }

    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Pesan kosong.' }, { status: 400 })
    }

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: await buildSystem(),
      messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        // Error di sini terjadi setelah header terkirim, jadi tidak bisa lagi
        // diubah jadi status HTTP. Kirim pesan yang terbaca pengguna lalu tutup
        // stream dengan rapi — jangan biarkan koneksi putus tanpa penjelasan.
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } catch (err) {
          console.error('[chat] stream error:', err)
          controller.enqueue(encoder.encode('\n\nMaaf, koneksi ke asisten terputus. Coba kirim ulang pesannya ya.'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Gagal memproses pesan.' }, { status: 500 })
  }
}
