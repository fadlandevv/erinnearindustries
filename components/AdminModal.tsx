'use client'
import { useEffect, type ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  maxWidth?: number
  footer?: ReactNode
}

export default function AdminModal({ title, subtitle, onClose, children, maxWidth = 780, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="admin-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="admin-modal" style={{ maxWidth }}>
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">{title}</h3>
            {subtitle && <p className="admin-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="admin-modal-body">
          {children}
        </div>

        {footer && (
          <div className="admin-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
