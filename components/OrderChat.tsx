'use client'
import { useState, useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sendOrderMessageAction } from '@/lib/actions'
import type { OrderMessage } from '@/lib/order-messages'

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
  ' · ' + new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

type Props = { orderId: string; initialMessages: OrderMessage[]; bare?: boolean }

export default function OrderChat({ orderId, initialMessages, bare = false }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(sendOrderMessageAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isOpen = bare || open
  const msgCount = initialMessages.length

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset()
      router.refresh()
    }
  }, [state])

  // Only scroll when a NEW message arrives after mount, not on open
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [msgCount])

  const adminCount = initialMessages.filter(m => m.sender === 'admin').length

  return (
    <div className={bare ? undefined : 'od-chat'}>
      {!bare && (
        <button type="button" className="od-chat-toggle" onClick={() => setOpen(o => !o)}>
          💬 Diskusi
          {initialMessages.length > 0 && <span style={{ color: '#888', fontWeight: 400 }}>({initialMessages.length})</span>}
          {adminCount > 0 && <span className="od-chat-unread">{adminCount}</span>}
        </button>
      )}

      {isOpen && (
        <>
          <div className="od-chat-body">
            {initialMessages.length === 0 ? (
              <p className="od-chat-empty">Belum ada pesan. Tanyakan sesuatu ke tim kami!</p>
            ) : (
              initialMessages.map(msg => (
                <div key={msg.id} className={`od-chat-msg od-chat-msg--${msg.sender}`}>
                  <div className="od-chat-bubble">{msg.message}</div>
                  <span className="od-chat-meta">{msg.senderName} · {fmtTime(msg.createdAt)}</span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {state?.error && <p className="od-chat-error">{state.error}</p>}

          <form ref={formRef} action={action} className="od-chat-form">
            <input type="hidden" name="orderId" value={orderId} />
            <input
              name="message"
              type="text"
              className="od-chat-input"
              placeholder="Tulis pesan..."
              maxLength={500}
              required
            />
            <button type="submit" className="od-chat-send" disabled={isPending}>
              {isPending ? '...' : 'Kirim'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
