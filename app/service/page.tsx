import type { Metadata } from 'next'
import { getServices } from '@/lib/data'
import ServicePageClient from './ServicePageClient'

export const metadata: Metadata = {
  title: 'Services — Erinnear Industries',
  description: 'Full-service clothing and brand presentation.',
}

export default function ServicePage() {
  const services = getServices()
  return <ServicePageClient services={services} />
}
