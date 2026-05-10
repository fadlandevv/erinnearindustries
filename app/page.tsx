import Hero from '@/components/Hero'
import ShowcaseSection from '@/components/ShowcaseSection'
import Stats from '@/components/Stats'
import FeatureGrid from '@/components/FeatureGrid'
import Service from '@/components/Service'
import { getProducts, getServices } from '@/lib/data'

export default async function HomePage() {
  const products = (await getProducts()).slice(0, 3)
  const services = (await getServices()).slice(0, 3)

  return (
    <>
      <Hero />
      <ShowcaseSection />
      <Stats />
      <FeatureGrid products={products} />
      <Service services={services} />
    </>
  )
}