import Anthropic from '@anthropic-ai/sdk'
import { getProducts, getServices } from '@/lib/data'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystem() {
  const products = getProducts()
  const services = getServices()

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
    const { messages } = await req.json()

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: buildSystem(),
      messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
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
