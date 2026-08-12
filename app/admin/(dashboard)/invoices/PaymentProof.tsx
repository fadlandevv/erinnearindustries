'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPaymentProofAction, removePaymentProofAction } from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'

/**
 * Unggah / lihat bukti transfer sebuah invoice.
 *
 * Berkas dikirim lewat Server Action, jadi validasi tipe & ukuran tetap
 * ditegakkan di server — atribut `accept` di input hanya membantu di UI.
 */
export default function PaymentProof({ invoiceId, url }: { invoiceId: string; url?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const { toast } = useAdminToast()
  const router = useRouter()

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const data = new FormData()
    data.set('invoiceId', invoiceId)
    data.set('proof', file)
    setBusy(true)
    uploadPaymentProofAction(null, data)
      .then(res => {
        if (res.error) toast(res.error, 'error')
        else { toast('Bukti transfer terunggah.'); router.refresh() }
      })
      .finally(() => {
        setBusy(false)
        // Reset supaya memilih berkas yang sama lagi tetap memicu onChange.
        if (inputRef.current) inputRef.current.value = ''
      })
  }

  function remove() {
    if (!confirm('Hapus bukti transfer invoice ini?')) return
    startTransition(async () => {
      const res = await removePaymentProofAction(invoiceId)
      if (res.error) toast(res.error, 'error')
      else { toast('Bukti transfer dihapus.'); router.refresh() }
    })
  }

  const working = busy || pending

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onPick}
        style={{ display: 'none' }}
      />

      {url ? (
        <span className="inv-proof-group">
          <a href={url} target="_blank" rel="noopener noreferrer" className="inv-proof-view" title="Lihat bukti transfer">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 6s1.9-3.3 5-3.3S11 6 11 6s-1.9 3.3-5 3.3S1 6 1 6z" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="6" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Bukti
          </a>
          <button type="button" className="inv-proof-swap" onClick={() => inputRef.current?.click()}
            disabled={working} title="Ganti bukti transfer">
            {working ? '…' : 'Ganti'}
          </button>
          <button type="button" className="inv-proof-swap inv-proof-swap--del" onClick={remove}
            disabled={working} title="Hapus bukti transfer">
            ✕
          </button>
        </span>
      ) : (
        <button type="button" className="btn-admin-edit" onClick={() => inputRef.current?.click()} disabled={working}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 8.5V2m0 0L3.5 4.5M6 2l2.5 2.5" stroke="currentColor" strokeWidth="1.3"
              strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1.5 8v1.5a1 1 0 001 1h7a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.3"
              strokeLinecap="round" />
          </svg>
          {working ? 'Mengunggah…' : 'Bukti TF'}
        </button>
      )}
    </>
  )
}
