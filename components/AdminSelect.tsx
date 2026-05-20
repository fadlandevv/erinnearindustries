'use client'
import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }

type Props = {
  value: string
  onChange: (value: string) => void
  options: Option[]
  name?: string
  placeholder?: string
}

export default function AdminSelect({ value, onChange, options, name, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

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

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '0.7rem 0.9rem',
          border: `1.5px solid ${open ? '#f47c2f' : '#e5e5e5'}`,
          borderRadius: 10,
          fontSize: '0.875rem',
          color: selected ? '#0d0d0d' : '#aaa',
          background: '#fff',
          boxShadow: open ? '0 0 0 3px rgba(244,124,47,0.08)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected?.label ?? placeholder ?? 'Pilih...'}
        </span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none', opacity: 0.5 }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1.5px solid #e5e5e5',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          zIndex: 400,
          overflow: 'hidden',
          maxHeight: 240,
          overflowY: 'auto',
        }}>
          {options.map(opt => {
            const isActive = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  background: isActive ? 'rgba(244,124,47,0.07)' : 'transparent',
                  color: isActive ? '#f47c2f' : '#0d0d0d',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#fafaf9' }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2 6l3 3 5-5" stroke="#f47c2f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span style={{ marginLeft: isActive ? 0 : 20 }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
