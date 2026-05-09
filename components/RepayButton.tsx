'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { renewSnapToken } from '@/lib/actions'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (r: unknown) => void
        onPending?: (r: unknown) => void
        onError?: (r: unknown) => void
        onClose?: () => void
      }) => void
    }
  }
}

const SNAP_URL = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'
const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''

function loadSnap(): Promise<void> {
  if (typeof window !== 'undefined' && window.snap) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SNAP_URL
    script.setAttribute('data-client-key', CLIENT_KEY)
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function RepayButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    setLoading(true)
    setError('')

    // Step 1: get a brand-new snap token so Midtrans shows method selection fresh
    const result = await renewSnapToken(orderId)
    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Step 2: load Snap.js then open the popup
    try {
      await loadSnap()
      window.snap.pay(result.snapToken, {
        onSuccess: () => router.push(`/checkout/success?order_id=${orderId}`),
        onPending: () => { router.refresh(); setLoading(false) },
        onError: () => { setError('Pembayaran gagal. Coba lagi.'); setLoading(false) },
        onClose: () => setLoading(false),
      })
    } catch {
      setError('Gagal memuat sistem pembayaran.')
      setLoading(false)
    }
  }

  return (
    <>
      <button className="oh-repay-btn" onClick={handlePay} disabled={loading}>
        {loading ? (
          <span className="oh-repay-spinner" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        )}
        {loading ? 'Memperbarui...' : 'Ubah Pembayaran'}
      </button>
      {error && <p className="oh-repay-error">{error}</p>}
    </>
  )
}
