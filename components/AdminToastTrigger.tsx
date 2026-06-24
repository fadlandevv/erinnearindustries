'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminToast } from '@/context/AdminToastContext'

type Props = { message: string; type?: 'success' | 'error' }

export default function AdminToastTrigger({ message, type = 'success' }: Props) {
  const { toast } = useAdminToast()
  const router    = useRouter()
  const pathname  = usePathname()

  useEffect(() => {
    toast(message, type)
    // bersihkan ?toast= dari URL supaya tidak muncul lagi saat refresh
    router.replace(pathname, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
