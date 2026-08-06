import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@/app/admin/admin.css'

// Judul tab untuk seluruh area reseller.
// - `absolute` membuat segmen ini mengabaikan template dari root layout.
// - `template` tanpa '%s' mengunci judul halaman anak agar tidak berubah.
export const metadata: Metadata = {
  title: {
    absolute: 'Erinnear Partner',
    template: 'Erinnear Partner',
  },
}

export default function ResellerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
