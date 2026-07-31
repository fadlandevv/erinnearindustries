'use client'
import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }

type Props = {
  name: string
  defaultValues?: string[]
  options: Option[]
  placeholder?: string
  required?: boolean
}

export default function AdminMultiSelect({ name, defaultValues = [], options, placeholder, required }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultValues)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  function toggle(value: string) {
    setSelected(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  const selectedLabels = options.filter(o => selected.includes(o.value))

  return (
    <div ref={ref} className="admin-cselect">
      {selected.map(v => <input key={v} type="hidden" name={name} value={v} />)}

      {/* Hidden inputs skip native validation — this stand-in blocks submit while nothing is picked */}
      {required && selected.length === 0 && (
        <input
          className="admin-cselect-validity"
          tabIndex={-1}
          required
          value=""
          onChange={() => {}}
          onFocus={() => setOpen(true)}
        />
      )}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`admin-cselect-trigger${open ? ' open' : ''}${selected.length === 0 ? ' placeholder' : ''}`}
      >
        <span className="admin-cselect-value">
          {selectedLabels.length > 0 ? (
            <span className="admin-ms-chips">
              {selectedLabels.map(o => (
                <span key={o.value} className="admin-ms-chip">{o.label}</span>
              ))}
            </span>
          ) : (placeholder ?? 'Pilih kategori...')}
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
          {options.length === 0 && (
            <div style={{ padding: '9px 10px', fontSize: 13, color: '#999' }}>Belum ada kategori</div>
          )}
          {options.map(opt => {
            const isActive = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className="admin-cselect-item"
              >
                <span className={`admin-ms-check${isActive ? ' checked' : ''}`}>
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
