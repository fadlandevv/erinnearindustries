import Link from 'next/link'
import { getOrderById } from '@/lib/orders'

export const metadata = { title: 'Menunggu Pembayaran — Erinnear Industries' }

export default async function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams
  const order = order_id ? await getOrderById(order_id) : undefined

  return (
    <section className="checkout-result-section">
      <div className="container">
        <div className="checkout-result-card">
          <div className="checkout-result-icon checkout-result-icon-pending">⏳</div>
          <h1 className="checkout-result-title">Menunggu Pembayaran</h1>
          <p className="checkout-result-sub">
            Pesananmu sudah dibuat. Selesaikan pembayaran sesuai instruksi yang telah dikirim.
          </p>

          {order && (
            <div className="checkout-result-info">
              <div className="checkout-result-row">
                <span>ID Pesanan</span>
                <strong>{order.id.slice(-6).toUpperCase()}</strong>
              </div>
              <div className="checkout-result-row">
                <span>Nama</span>
                <strong>{order.customer.name}</strong>
              </div>
              <div className="checkout-result-row">
                <span>Total</span>
                <strong>Rp {order.totalPrice.toLocaleString('id-ID')}</strong>
              </div>
              <div className="checkout-result-row">
                <span>Status</span>
                <span className="checkout-status-badge checkout-status-pending">Menunggu</span>
              </div>
            </div>
          )}

          <p className="checkout-result-note">
            Cek email <strong>{order?.customer.email}</strong> untuk instruksi pembayaran lengkap.
          </p>

          <div className="checkout-result-actions">
            <Link href="/" className="btn-dark">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
