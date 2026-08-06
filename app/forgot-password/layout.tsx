import type { ReactNode } from 'react'

// page.tsx-nya client component, jadi metadata dipasang lewat layout.
export const metadata = { title: 'Lupa Password' }

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children
}
