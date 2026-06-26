import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import ChatBot from '@/components/ChatBotWrapper'
import { getUserByEmail } from '@/lib/users'
import { getContent } from '@/lib/data'

export const metadata: Metadata = {
  title: {
    default: 'Erinnear Industries',
    template: '%s — Erinnear Industries',
  },
  description: 'Erinnear Industries — brand fashion custom berkualitas. Kaos, totebag, dan solusi custom printing terbaik. Percayakan kebutuhan brand Anda kepada kami.',
  metadataBase: new URL('https://erinnear.com'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://erinnear.com',
    siteName: 'Erinnear Industries',
    title: 'Erinnear Industries',
    description: 'Erinnear Industries — brand fashion custom berkualitas. Kaos, totebag, dan solusi custom printing terbaik.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Erinnear Industries' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Erinnear Industries',
    description: 'Brand fashion custom berkualitas — kaos, totebag, dan custom printing.',
    images: ['/og-image.png'],
  },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  const user = email ? await getUserByEmail(email) : null
  const userInfo = user ? { name: user.name } : null
  const content = await getContent()

  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('ei-theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();` }} />
      </head>
      <body>
        <Providers content={content}>
          <Navbar user={userInfo} />
          <main>{children}</main>
          <Footer />
          <ChatBot />
        </Providers>
      </body>
    </html>
  )
}