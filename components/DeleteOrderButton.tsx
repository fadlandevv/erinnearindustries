'use client'
import { useTransition } from 'react'
import { deleteUserOrder } from '@/lib/actions'

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Hapus pesanan ini? Tindakan ini tidak dapat dibatalkan.')) return
    startTransition(async () => {
      await deleteUserOrder(orderId)
    })
  }

  return (
    <button
      className="oh-delete-btn"
      onClick={handleDelete}
      disabled={pending}
      aria-label="Hapus pesanan"
    >
      {pending ? (
        <span className="oh-delete-spinner" />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      )}
      {pending ? 'Menghapus...' : 'Hapus'}
    </button>
  )
}
