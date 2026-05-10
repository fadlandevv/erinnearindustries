import { getProducts, getServices } from '@/lib/data'
import ChatBot from './ChatBot'

export default async function ChatBotWrapper() {
  const products = (await getProducts()).slice(0, 3).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: p.image ?? '',
    bg: p.bg,
  }))

  const services = (await getServices()).slice(0, 3).map((s) => ({
    id: s.id,
    icon: s.icon,
    title: s.title,
    tag: s.tag,
  }))

  return <ChatBot featuredProducts={products} featuredServices={services} />
}
