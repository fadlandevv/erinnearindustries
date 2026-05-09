const MIDTRANS_DOMAINS = [
  'https://app.sandbox.midtrans.com',
  'https://app.midtrans.com',
  'https://api.sandbox.midtrans.com',
  'https://api.midtrans.com',
].join(' ')

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${MIDTRANS_DOMAINS}`,
  `style-src 'self' 'unsafe-inline' ${MIDTRANS_DOMAINS}`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${MIDTRANS_DOMAINS}`,
  `frame-src 'self' ${MIDTRANS_DOMAINS}`,
  `worker-src 'self' blob:`,
].join('; ')

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
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
