import { redirect } from 'next/navigation'

export const metadata = { title: 'Penghasilan' }

export default function EarningsPage() {
  redirect('/reseller/dashboard/earnings/grafik')
}
