const MIDTRANS_DOMAINS = [
  'https://app.sandbox.midtrans.com',
  'https://app.midtrans.com',
  'https://api.sandbox.midtrans.com',
  'https://api.midtrans.com',
].join(' ')

const VERCEL_DOMAINS = 'https://vercel.live https://*.vercel.live https://*.pusher.com wss://*.pusher.com'

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${MIDTRANS_DOMAINS} ${VERCEL_DOMAINS}`,
  `style-src 'self' 'unsafe-inline' ${MIDTRANS_DOMAINS} ${VERCEL_DOMAINS}`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data: https:`,
  `connect-src 'self' ${MIDTRANS_DOMAINS} ${VERCEL_DOMAINS}`,
  `frame-src 'self' ${MIDTRANS_DOMAINS} ${VERCEL_DOMAINS}`,
  `worker-src 'self' blob:`,
].join('; ')

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bzhwhvjuijofiuoujmgu.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  outputFileTracingIncludes: {
    '/**': ['./data/**'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
