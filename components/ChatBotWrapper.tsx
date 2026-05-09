import { getProducts, getServices } from '@/lib/data'
import ChatBot from './ChatBot'

export default function ChatBotWrapper() {
  const products = getProducts().slice(0, 3).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: p.image ?? '',
    bg: p.bg,
  }))

  const services = getServices().slice(0, 3).map((s) => ({
    id: s.id,
    icon: s.icon,
    title: s.title,
    tag: s.tag,
  }))

  return <ChatBot featuredProducts={products} featuredServices={services} />
}
