import type { Order } from '@/lib/orders'
import type { OrderMessage } from '@/lib/order-messages'
import Link from 'next/link'
import OrderCard from './OrderCard'

export default function OrderList({ orders, messagesByOrder = {} }: { orders: Order[]; messagesByOrder?: Record<string, OrderMessage[]> }) {
  if (orders.length === 0) {
    return (
      <div className="oh-empty">
        <div className="oh-empty-icon">📦</div>
        <p>Belum ada pesanan</p>
        <span>Yuk mulai belanja produk favoritmu!</span>
        <Link href="/product" className="btn-dark oh-empty-cta">Lihat Produk</Link>
      </div>
    )
  }

  return (
    <div className="oh-list">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} messages={messagesByOrder[order.id] ?? []} />
      ))}
    </div>
  )
}
