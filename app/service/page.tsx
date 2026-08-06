import { getServices, buildPageMetadata } from '@/lib/data'
import ServicePageClient from './ServicePageClient'

export async function generateMetadata() {
  return buildPageMetadata('services', {
    title: 'Services',
    description: 'Full-service clothing and brand presentation.',
    path: '/service',
  })
}

export default async function ServicePage() {
  const services = await getServices()
  return <ServicePageClient services={services} />
}
