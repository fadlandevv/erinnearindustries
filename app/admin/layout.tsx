import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './admin.css'

// Judul tab untuk seluruh area CMS admin.
// - `absolute` membuat segmen ini mengabaikan template dari root layout.
// - `template` memberi suffix brand CMS ke judul tiap halaman anak.
export const metadata: Metadata = {
  title: {
    absolute: 'Erinnear System',
    template: '%s — Erinnear System',
  },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-overlay">{children}</div>
}
