'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminToast } from '@/context/AdminToastContext'

type Props = { message: string; type?: 'success' | 'error' }

const fired = new Set<string>()

export default function AdminToastTrigger({ message, type = 'success' }: Props) {
  const { toast } = useAdminToast()
  const router    = useRouter()
  const pathname  = usePathname()
  const key       = `${pathname}:${message}:${type}`

  useEffect(() => {
    if (fired.has(key)) return
    fired.add(key)
    toast(message, type)
    router.replace(pathname, { scroll: false })
    setTimeout(() => fired.delete(key), 3000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
