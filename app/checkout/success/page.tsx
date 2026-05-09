import Link from 'next/link'
import { getOrderById } from '@/lib/orders'

export const metadata = { title: 'Pesanan Berhasil — Erinnear Industries' }

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams
  const order = order_id ? getOrderById(order_id) : undefined

  return (
    <section className="checkout-result-section">
      <div className="container">
        <div className="checkout-result-card">
          <div className="checkout-result-icon checkout-result-icon-success">✓</div>
          <h1 className="checkout-result-title">Pembayaran Berhasil!</h1>
          <p className="checkout-result-sub">
            Terima kasih atas pesananmu. Kami akan segera memproses pesanan dan menghubungimu.
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
                <span>Email</span>
                <strong>{order.customer.email}</strong>
              </div>
              <div className="checkout-result-row">
                <span>Total</span>
                <strong>Rp {order.totalPrice.toLocaleString('id-ID')}</strong>
              </div>
              <div className="checkout-result-row">
                <span>Status</span>
                <span className="checkout-status-badge checkout-status-paid">Dibayar</span>
              </div>
            </div>
          )}

          <div className="checkout-result-actions">
            <Link href="/product" className="btn-dark">Lanjut Belanja</Link>
            <Link href="/orders" className="btn-outline">Cek Riwayat Pesanan</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
