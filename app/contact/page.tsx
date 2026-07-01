import type { Metadata } from 'next'
import { getServices, getProducts } from '@/lib/data'
import ContactForm from '@/components/ContactForm'
import ContactHero from '@/components/ContactHero'

export const metadata: Metadata = {
  title: 'Contact Us — Erinnear Industries',
  description: 'Get in touch with Erinnear Industries.',
}

const details = [
  { icon: '✉', label: 'Email', value: 'hello@erinnear.com' },
  { icon: '☎', label: 'Phone', value: '+62 812 3456 7890' },
  { icon: '⌖', label: 'Location', value: 'Jakarta, Indonesia' },
  { icon: '◷', label: 'Working Hours', value: 'Mon – Fri, 09.00 – 18.00 WIB' },
]

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; product?: string }>
}) {
  const [services, products, params] = await Promise.all([
    getServices(),
    getProducts(),
    searchParams,
  ])

  return (
    <>
      <ContactHero />

      <div className="contact-section">
        <div className="contact-inner">
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Contact Information</h3>
              <p>
                Whether you&apos;re looking for a new collection, a brand identity project,
                or just want to say hello — we&apos;re always happy to connect.
              </p>
              <div className="contact-detail">
                {details.map((d) => (
                  <div key={d.label} className="contact-detail-item">
                    <div className="contact-detail-icon">{d.icon}</div>
                    <div className="contact-detail-text">
                      <strong>{d.label}</strong>
                      <p>{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ContactForm
              services={services}
              products={products}
              defaultService={params.service}
              defaultProduct={params.product}
            />
          </div>
        </div>
      </div>
    </>
  )
}
