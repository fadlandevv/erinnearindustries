'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'success' | 'error'
type Toast = { id: number; message: string; type: ToastType }
type ToastCtx = { toast: (msg: string, type?: ToastType) => void }

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

const LABELS: Record<ToastType, string> = { success: 'Berhasil', error: 'Gagal' }
const ICONS:  Record<ToastType, string> = { success: '✓', error: '✕' }
const DURATION = 3200

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setItems(prev => [...prev, { id, message, type }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), DURATION + 300)
  }, [])

  const dismiss = useCallback((id: number) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="admin-toast-wrap" aria-live="polite">
        {items.map(t => (
          <div
            key={t.id}
            className={`admin-toast admin-toast--${t.type}`}
            onClick={() => dismiss(t.id)}
            role="alert"
          >
            <div className="admin-toast-icon-wrap">
              <span className="admin-toast-icon">{ICONS[t.type]}</span>
            </div>
            <div className="admin-toast-body">
              <span className="admin-toast-label">{LABELS[t.type]}</span>
              <span className="admin-toast-msg">{t.message}</span>
            </div>
            <div className="admin-toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useAdminToast = () => useContext(ToastContext)
