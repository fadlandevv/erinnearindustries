import { getContent } from '@/lib/data'
import ContentPageClient from './ContentPageClient'

export default async function ContentPage() {
  const content = await getContent()
  return <ContentPageClient content={content} />
}
