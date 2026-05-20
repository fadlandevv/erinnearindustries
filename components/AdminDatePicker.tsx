'use client'
import { useState, useRef, useEffect } from 'react'

type Props = {
  value: string        // YYYY-MM-DD
  onChange: (v: string) => void
  name?: string
  min?: string         // YYYY-MM-DD
  max?: string         // YYYY-MM-DD
}

const DAY_LABELS = ['Sen','Sel','Rab','Kam','Jum','Sab','Min']
const MONTH_ID   = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function toDate(s: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmt(s: string): string {
  const d = toDate(s)
  if (!d) return ''
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AdminDatePicker({ value, onChange, name, min, max }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const sel = toDate(value)

  const [vy, setVy] = useState(sel?.getFullYear() ?? today.getFullYear())
  const [vm, setVm] = useState(sel?.getMonth() ?? today.getMonth())

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Build calendar grid (Mon-first)
  const first = new Date(vy, vm, 1)
  const last  = new Date(vy, vm + 1, 0)
  let startDow = first.getDay() - 1
  if (startDow < 0) startDow = 6

  const cells: (Date | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(vy, vm, d))
  while (cells.length % 7 !== 0) cells.push(null)

  function prevMonth() {
    if (vm === 0) { setVm(11); setVy(y => y - 1) } else setVm(m => m - 1)
  }
  function nextMonth() {
    if (vm === 11) { setVm(0); setVy(y => y + 1) } else setVm(m => m + 1)
  }

  function isDisabled(d: Date) {
    const minD = toDate(min ?? '')
    const maxD = toDate(max ?? '')
    if (minD && d < minD) return true
    if (maxD && d > maxD) return true
    return false
  }

  function pick(d: Date) {
    if (isDisabled(d)) return
    onChange(toStr(d))
    setOpen(false)
  }

  function pickToday() {
    onChange(toStr(today))
    setVy(today.getFullYear())
    setVm(today.getMonth())
    setOpen(false)
  }

  // Nav button style
  const navBtn: React.CSSProperties = {
    width: 28, height: 28,
    border: '1.5px solid #e5e5e5',
    borderRadius: 8,
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#555',
    flexShrink: 0,
    transition: 'background 0.12s, border-color 0.12s',
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '0.7rem 0.9rem',
          border: `1.5px solid ${open ? '#f47c2f' : '#e5e5e5'}`,
          borderRadius: 10,
          fontSize: '0.875rem',
          color: value ? '#0d0d0d' : '#aaa',
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
        <span style={{ flex: 1 }}>{value ? fmt(value) : 'Pilih tanggal...'}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
          <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 7h12M6 1v4M10 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Calendar popover */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0,
          background: '#fff',
          border: '1.5px solid #e5e5e5',
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          zIndex: 500,
          padding: '1rem',
          width: 292,
        }}>

          {/* Month / Year nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <button type="button" style={navBtn} onClick={prevMonth}
              onMouseOver={e => { e.currentTarget.style.background = '#f5f3ef'; e.currentTarget.style.borderColor = '#ccc' }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e5e5e5' }}
            >
              <svg width="7" height="11" viewBox="0 0 7 11" fill="none">
                <path d="M5.5 1.5L2 5.5L5.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', color: '#0d0d0d' }}>
              {MONTH_ID[vm]} {vy}
            </span>

            <button type="button" style={navBtn} onClick={nextMonth}
              onMouseOver={e => { e.currentTarget.style.background = '#f5f3ef'; e.currentTarget.style.borderColor = '#ccc' }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e5e5e5' }}
            >
              <svg width="7" height="11" viewBox="0 0 7 11" fill="none">
                <path d="M1.5 1.5L5 5.5L1.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.3rem' }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '0.65rem', fontWeight: 600,
                color: '#bbb', padding: '0.2rem 0', letterSpacing: '0.02em',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const isSelected = sel && toStr(day) === toStr(sel)
              const isToday    = toStr(day) === toStr(today)
              const disabled   = isDisabled(day)

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(day)}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 8,
                    border: isToday && !isSelected ? '1.5px solid rgba(244,124,47,0.35)' : 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: isSelected ? '#0d0d0d' : 'transparent',
                    color: isSelected ? '#fff' : disabled ? '#ddd' : isToday ? '#f47c2f' : '#0d0d0d',
                    fontWeight: isSelected || isToday ? 700 : 400,
                    fontSize: '0.8rem',
                    transition: 'background 0.1s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseOver={e => {
                    if (!isSelected && !disabled) e.currentTarget.style.background = '#f5f3ef'
                  }}
                  onMouseOut={e => {
                    if (!isSelected && !disabled) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '0.875rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f0ede8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#bbb' }}>
              {sel ? fmt(value) : 'Belum dipilih'}
            </span>
            <button
              type="button"
              onClick={pickToday}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f47c2f',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: '0.2rem 0.5rem',
                borderRadius: 6,
                transition: 'background 0.1s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(244,124,47,0.08)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Hari ini
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
