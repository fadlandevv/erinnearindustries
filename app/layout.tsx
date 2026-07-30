import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import ChatBot from '@/components/ChatBotWrapper'
import { getUserByEmail } from '@/lib/users'
import { getContent, getSeo } from '@/lib/data'

const DEFAULT_TITLE = 'Erinnear Industries'
const DEFAULT_DESC = 'Erinnear Industries — brand fashion custom berkualitas. Kaos, totebag, dan solusi custom printing terbaik. Percayakan kebutuhan brand Anda kepada kami.'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('home')
  const title = seo.title || DEFAULT_TITLE
  const description = seo.description || DEFAULT_DESC
  return {
    title: {
      default: title,
      template: '%s — Erinnear Industries',
    },
    description,
    keywords: seo.keywords || undefined,
    metadataBase: new URL('https://erinnear.com'),
    alternates: { canonical: '/' },
    ...(seo.googleVerification ? { verification: { google: seo.googleVerification } } : {}),
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: 'https://erinnear.com',
      siteName: 'Erinnear Industries',
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
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