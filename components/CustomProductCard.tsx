'use client'
import { useRef, useState, useTransition } from 'react'
import { updateCustomProductImageAction } from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'

type Props = {
  id: string
  name: string
  sub: string
  savedImage?: string
}

export default function CustomProductCard({ id, name, sub, savedImage }: Props) {
  const [currentImage, setCurrentImage] = useState(savedImage)
  const [preview, setPreview]           = useState<string | null>(null)
  const [fileName, setFileName]         = useState<string | null>(null)
  const [isPending, startTransition]    = useTransition()
  const formRef  = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useAdminToast()

  const displayed = preview ?? currentImage ?? null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setFileName(file.name)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    startTransition(async () => {
      const result = await updateCustomProductImageAction(id, formData)
      if ('url' in result) {
        setCurrentImage(result.url)
        setPreview(null)
        toast('Foto berhasil disimpan')
      } else {
        toast(result.error, 'error')
      }
    })
  }

  return (
    <div className="admin-form-card">
      {/* Preview area */}
      <div className="admin-showcase-preview">
        {displayed ? (
          <img
            src={displayed}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="admin-gallery-empty" style={{
            flexDirection: 'column', gap: 8,
            border: '1.5px dashed rgba(255,255,255,0.15)',
            margin: 12, borderRadius: 8,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
            <span>Belum ada foto</span>
          </div>
        )}

        {/* Badge preview */}
        {preview && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
            color: '#fff', fontSize: '11px', fontWeight: 500,
            padding: '3px 8px', borderRadius: 6,
            pointerEvents: 'none', zIndex: 2,
          }}>
            Preview
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 10 }}>
          {name} <span style={{ fontWeight: 400, color: '#888' }}>· {sub}</span>
        </div>

        {/* Custom file input */}
        <div className="admin-form-group">
          <label>Foto Background</label>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px',
              border: '1.5px dashed #d4ccbf',
              borderRadius: 10,
              cursor: 'pointer',
              background: fileName ? '#faf8f5' : '#fff',
              transition: 'border-color 0.15s',
            }}
            onClick={() => inputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{
              fontSize: '0.82rem',
              color: fileName ? '#0d0d0d' : '#aaa',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {fileName ?? 'Klik untuk pilih foto…'}
            </span>
            {fileName && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            name="image"
            accept="image/*"
            required={!currentImage}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn-admin-primary" disabled={isPending || (!preview && !fileName)}>
            {isPending ? 'Menyimpan…' : currentImage && !preview ? 'Ganti Foto' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
