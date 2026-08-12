'use client'
import { useState } from 'react'

/**
 * Nomor rekening yang bisa disalin sekali klik. Tampil sebagai teks biasa —
 * ikonnya disembunyikan saat dicetak supaya invoice kertas tetap bersih.
 */
export default function CopyAccount({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  async function copy() {
    try {
      // Clipboard API hanya tersedia di konteks aman (https / localhost).
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setFailed(false)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setFailed(true)
      setTimeout(() => setFailed(false), 2500)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inv-copy-account"
      title={failed ? 'Gagal menyalin — salin manual' : 'Klik untuk salin'}
      aria-label={`Salin nomor rekening ${value}`}
    >
      {value}
      <span className="inv-copy-icon inv-no-print" aria-hidden>
        {copied ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="1.7"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="6.4" height="6.4" rx="1.6"
              stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 2.6A1.6 1.6 0 006.4 1H3.2A1.6 1.6 0 001.6 2.6v3.2A1.6 1.6 0 003.2 7.4"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {copied && <span className="inv-copy-toast inv-no-print">Tersalin</span>}
      {failed && <span className="inv-copy-toast inv-copy-toast--err inv-no-print">Gagal</span>}
    </button>
  )
}
