'use client'
import { useTransition } from 'react'
import { deleteMemberAction } from '@/lib/actions'

export default function DeleteMemberBtn({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete account "${name}"? This action cannot be undone.`)) return
    startTransition(() => { deleteMemberAction(id) })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="btn-admin-danger"
      style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
    >
      {pending ? '...' : 'Delete'}
    </button>
  )
}
