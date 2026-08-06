import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@/app/admin/admin.css'

// Judul tab untuk seluruh area reseller.
// - `absolute` membuat segmen ini mengabaikan template dari root layout.
// - `template` memberi suffix brand partner ke judul tiap halaman anak.
//   Catatan: template tidak berlaku untuk page.tsx satu segmen (halaman
//   marketing /reseller), yang memang sengaja tetap memakai suffix publik.
export const metadata: Metadata = {
  title: {
    absolute: 'Erinnear Partner',
    template: '%s — Erinnear Partner',
  },
}

export default function ResellerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
