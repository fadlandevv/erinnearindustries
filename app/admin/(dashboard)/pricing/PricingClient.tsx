'use client'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updatePricingAction, addPricingItemAction, deletePricingItemAction } from '@/lib/actions'
import type { PricingItem } from '@/lib/pricing'

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function AddForm({ type }: { type: 'bahan' | 'sablon' }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(addPricingItemAction, {})

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      router.refresh()
    }
  }, [state.ok, router])

  return (
    <form ref={formRef} action={action} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '0.75rem' }}>
      <input type="hidden" name="type" value={type} />
      <input
        type="text"
        name="label"
        placeholder={type === 'bahan' ? 'New material name…' : 'Screen print size name…'}
        className="admin-form-input"
        style={{ flex: 1 }}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price (Rp)"
        className="admin-form-input"
        style={{ width: 150 }}
        min={1000}
        step={1000}
        required
      />
      <button type="submit" className="btn-admin-primary" disabled={pending}
        style={{ whiteSpace: 'nowrap' }}>
        {pending ? '…' : '+ Add'}
      </button>
      {state.error && (
        <span style={{ fontSize: '0.78rem', color: '#ef4444', alignSelf: 'center' }}>{state.error}</span>
      )}
    </form>
  )
}

function DeleteBtn({ id }: { id: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      className="btn-admin-danger"
      style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
      onClick={async () => {
        await deletePricingItemAction(id)
        router.refresh()
      }}
    >
      Delete
    </button>
  )
}

function PricingSection({
  title, sub, items, type,
}: {
  title: string
  sub: string
  items: PricingItem[]
  type: 'bahan' | 'sablon'
}) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <p className="admin-form-section-title">{title}</p>
        <p className="admin-form-hint">{sub}</p>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Label</th>
              <th style={{ width: 180 }}>Price (Rp)</th>
              <th style={{ width: 130 }}>Current value</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.label}</td>
                <td>
                  <input
                    type="number"
                    name={`price-${item.id}`}
                    defaultValue={item.price}
                    min={1000}
                    step={1000}
                    className="admin-form-input"
                    style={{ width: '100%' }}
                  />
                </td>
                <td style={{ color: '#999', fontSize: '0.82rem' }}>{formatRp(item.price)}</td>
                <td>
                  {!item.isDefault && <DeleteBtn id={item.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddForm type={type} />
    </div>
  )
}

export default function PricingClient({ items }: { items: PricingItem[] }) {
  const bahan  = items.filter(i => i.type === 'bahan')
  const sablon = items.filter(i => i.type === 'sablon')

  const [state, formAction, pending] = useActionState(updatePricingAction, {})

  return (
    <form action={formAction}>
      {state.ok && (
        <div className="admin-alert admin-alert-success">Prices saved successfully.</div>
      )}
      {state.error && (
        <div className="admin-alert admin-alert-error">{state.error}</div>
      )}

      <PricingSection
        title="Shirt Price per Material"
        sub="Base shirt price before adding screen print cost."
        items={bahan}
        type="bahan"
      />
      <PricingSection
        title="Screen Print Price per Size"
        sub="Screen print cost per side (front / back), added on top of shirt price."
        items={sablon}
        type="sablon"
      />

      <div className="admin-form-actions" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="btn-admin-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save All Prices'}
        </button>
      </div>
    </form>
  )
}
