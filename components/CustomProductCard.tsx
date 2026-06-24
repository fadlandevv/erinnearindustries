'use client'
import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { updateCustomProductImageAction } from '@/lib/actions'

type Props = {
  id: string
  name: string
  sub: string
  savedImage?: string
}

export default function CustomProductCard({ id, name, sub, savedImage }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const displayed = preview ?? savedImage ?? null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const formData = new FormData(form)
    startTransition(async () => {
      await updateCustomProductImageAction(id, formData)
    })
  }

  return (
    <div className="admin-form-card">
      <div className="admin-showcase-preview" style={{ position: 'relative' }}>
        {displayed ? (
          <Image
            src={displayed}
            alt={name}
            fill
            unoptimized={!!preview}
            style={{ objectFit: 'cover' }}
            sizes="500px"
          />
        ) : (
          <div className="admin-gallery-empty">
            <span>{name} ({sub}) — belum ada foto</span>
          </div>
        )}
        {preview && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)', zIndex: 2,
          }}>
            <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.04em' }}>
              Preview — belum disimpan
            </span>
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ padding: '0 0 4px', fontWeight: 600, fontSize: '0.9rem' }}>
          {name} <span style={{ fontWeight: 400, color: '#888' }}>· {sub}</span>
        </div>
        <div className="admin-form-group" style={{ marginTop: 10 }}>
          <label>Upload Foto Background</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="admin-gallery-file-input"
            required
            onChange={handleFileChange}
          />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn-admin-primary" disabled={isPending}>
            {isPending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
