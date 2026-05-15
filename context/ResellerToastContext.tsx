'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'success' | 'error'
type Toast = { id: number; message: string; type: ToastType }
type ToastCtx = { toast: (msg: string, type?: ToastType) => void }

const ResellerToastContext = createContext<ToastCtx>({ toast: () => {} })

export function ResellerToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setItems(prev => [...prev, { id, message, type }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ResellerToastContext.Provider value={{ toast }}>
      {children}
      <div className="admin-toast-wrap" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`admin-toast admin-toast--${t.type}`}>
            <span className="admin-toast-icon">{t.type === 'success' ? '✓' : '✕'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ResellerToastContext.Provider>
  )
}

export const useResellerToast = () => useContext(ResellerToastContext)
