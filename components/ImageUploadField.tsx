'use client'
import { useRef, useState } from 'react'

type Props = {
  name: string
  label: string
  current?: string
  hint?: string
  required?: boolean
}

export default function ImageUploadField({ name, label, current, hint, required }: Props) {
  const [preview, setPreview] = useState<string | null>(current ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="img-field">
      <span className="img-field-label">{label}</span>
      {hint && <p className="admin-form-hint">{hint}</p>}
      <div
        className={`img-field-area${preview ? ' img-field-area--filled' : ''}`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="img-field-preview" />
            <button
              type="button"
              className="img-field-clear"
              onClick={handleClear}
              aria-label="Hapus foto"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="img-field-empty">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Klik untuk upload</span>
            <span className="img-field-hint">JPG, PNG, WEBP</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={handleChange}
        required={required && !preview}
        style={{ display: 'none' }}
      />
    </div>
  )
}
