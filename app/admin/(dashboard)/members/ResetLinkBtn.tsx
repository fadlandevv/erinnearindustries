'use client'
import { useState } from 'react'
import { generateResetLinkAction } from '@/lib/actions'

export default function ResetLinkBtn({ email }: { email: string }) {
  const [link, setLink]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    const result = await generateResetLinkAction(email)
    setLoading(false)
    if (result.link) setLink(result.link)
  }

  const handleCopy = () => {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (link) {
    return (
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          readOnly
          value={link}
          className="admin-form-input"
          style={{ fontSize: '0.7rem', width: 200, fontFamily: 'monospace' }}
          onClick={e => (e.target as HTMLInputElement).select()}
        />
        <button
          type="button"
          className="btn-admin-primary"
          style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem', whiteSpace: 'nowrap' }}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="btn-admin-secondary"
      style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
      onClick={handleGenerate}
      disabled={loading}
    >
      {loading ? '…' : 'Reset Password'}
    </button>
  )
}
