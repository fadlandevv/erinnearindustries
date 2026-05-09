'use client'
import type { ReactNode } from 'react'
import { CartProvider } from '@/context/CartContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from '@/context/ThemeContext'
import CartDrawer from '@/components/CartDrawer'
import type { ContentData } from '@/lib/data'

export default function Providers({
  children,
  content,
}: {
  children: ReactNode
  content?: ContentData
}) {
  return (
    <ThemeProvider>
      <LanguageProvider cmsContent={content}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
