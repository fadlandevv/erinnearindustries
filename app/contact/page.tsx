import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getServices, getProducts } from '@/lib/data'
import { getUserByEmail } from '@/lib/users'
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
  const jar = await cookies()
  const sessionEmail = jar.get('user-session')?.value

  const [services, products, params, user] = await Promise.all([
    getServices(),
    getProducts(),
    searchParams,
    sessionEmail ? getUserByEmail(sessionEmail) : Promise.resolve(undefined),
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
              defaultName={user?.name}
              defaultEmail={user?.email}
              defaultPhone={user?.phone}
            />
          </div>
        </div>
      </div>
    </>
  )
}
