'use client'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminToast } from '@/context/AdminToastContext'

type Props = { message: string; type?: 'success' | 'error' }

export default function AdminToastTrigger({ message, type = 'success' }: Props) {
  const { toast } = useAdminToast()
  const router    = useRouter()
  const pathname  = usePathname()
  const shown     = useRef(false)

  useEffect(() => {
    if (shown.current) return
    shown.current = true
    toast(message, type)
    router.replace(pathname, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
