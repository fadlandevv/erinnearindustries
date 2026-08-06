import { getContactMessages } from '@/lib/contact-messages'
import MessagesClient from './MessagesClient'

export const metadata = { title: 'Messages' }
export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const messages = await getContactMessages()
  return <MessagesClient messages={messages} />
}
