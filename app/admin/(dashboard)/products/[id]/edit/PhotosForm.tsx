'use client'
import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProductPhotos } from '@/lib/actions'
import { useAdminToast } from '@/context/AdminToastContext'
import ImageUploadField from '@/components/ImageUploadField'

type Props = {
  productId: string
  image?: string
  images?: string[]
}

export default function PhotosForm({ productId, image, images }: Props) {
  const { toast } = useAdminToast()
  const router = useRouter()
  const [state, action, isPending] = useActionState(
    updateProductPhotos.bind(null, productId),
    null
  )

  useEffect(() => {
    if (!state) return
    if (state.ok) {
      toast('Foto produk berhasil disimpan')
      router.refresh()
    } else if (state.error) {
      toast(state.error, 'error')
    }
  }, [state])

  return (
    <div className="admin-form-card" style={{ marginTop: '1.25rem' }}>
      <form action={action} encType="multipart/form-data">
        <p className="admin-form-section-title">Foto Produk</p>
        <p className="admin-form-hint" style={{ marginBottom: '0.75rem' }}>Foto pertama jadi foto utama produk</p>
        <div className="admin-photos-5col">
          <ImageUploadField name="image" label="1 — Utama" current={image} />
          {[0, 1, 2, 3].map(i => (
            <ImageUploadField
              key={i}
              name={`detail-${i}`}
              label={`${i + 2}`}
              current={images?.[i] || undefined}
            />
          ))}
        </div>
        <div className="admin-form-divider" />
        <div className="admin-form-actions">
          <button type="submit" className="btn-admin-primary" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan Foto'}
          </button>
        </div>
      </form>
    </div>
  )
}
