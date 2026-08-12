'use client'
import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }

type Props = {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  options: Option[]
  name?: string
  placeholder?: string
}

export default function AdminSelect({ value, defaultValue, onChange, options, name, placeholder }: Props) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? '')
  const current = isControlled ? (value as string) : internal

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === current)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function pick(v: string) {
    if (!isControlled) setInternal(v)
    onChange?.(v)
    setOpen(false)
  }

  return (
    <div ref={ref} className="admin-cselect" >
      {name && <input type="hidden" name={name} value={current} />}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`admin-cselect-trigger${open ? ' open' : ''}${!selected ? ' placeholder' : ''}`}
      >
        <span className="admin-cselect-value">
          {selected?.label ?? placeholder ?? 'Pilih...'}
        </span>
        <svg
          className={`admin-cselect-chevron${open ? ' open' : ''}`}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="admin-cselect-panel">
          {options.map(opt => {
            const isActive = opt.value === current
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => pick(opt.value)}
                className={`admin-cselect-item${isActive ? ' active' : ''}`}
              >
                {/* Pilihan aktif dibedakan lewat warna saja — tanpa ikon centang. */}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
