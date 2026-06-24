'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useAdminToast } from '@/context/AdminToastContext'

function FlashInner() {
  const params   = useSearchParams()
  const router   = useRouter()
  const pathname = usePathname()
  const { toast } = useAdminToast()

  useEffect(() => {
    const msg = params.get('toast')
    if (!msg) return
    const type = (params.get('toastType') ?? 'success') as 'success' | 'error'
    toast(decodeURIComponent(msg), type)
    const next = new URLSearchParams(params.toString())
    next.delete('toast')
    next.delete('toastType')
    const qs = next.toString()
    router.replace(pathname + (qs ? `?${qs}` : ''), { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  return null
}

export default function AdminFlash() {
  return (
    <Suspense>
      <FlashInner />
    </Suspense>
  )
}
