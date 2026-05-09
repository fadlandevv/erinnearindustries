'use client'
import { useState, useEffect } from 'react'

function getRelative(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getAbsolute(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function RelativeTime({ iso }: { iso: string }) {
  const [relative, setRelative] = useState(() => getRelative(iso))

  useEffect(() => {
    const interval = setInterval(() => setRelative(getRelative(iso)), 30_000)
    return () => clearInterval(interval)
  }, [iso])

  return (
    <span title={getAbsolute(iso)} style={{ cursor: 'default' }}>
      <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500 }}>{relative}</span>
      <span style={{ display: 'block', fontSize: '0.72rem', color: '#aaa', marginTop: '0.1rem' }}>
        {getAbsolute(iso)}
      </span>
    </span>
  )
}
