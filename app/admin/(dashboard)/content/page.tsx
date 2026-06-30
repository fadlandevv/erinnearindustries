import { getContent, getShowcase } from '@/lib/data'
import ContentPageClient from './ContentPageClient'

export default async function ContentPage() {
  const [content, showcase] = await Promise.all([getContent(), getShowcase()])
  return <ContentPageClient content={content} showcase={showcase} />
}
