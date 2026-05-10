'use client'
import { useActionState } from 'react'
import { updatePricingAction } from '@/lib/actions'
import type { PricingItem } from '@/lib/pricing'

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function PricingTable({
  title, sub, items,
}: {
  title: string
  sub: string
  items: PricingItem[]
}) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <p className="admin-form-section-title">{title}</p>
        <p className="admin-form-hint">{sub}</p>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Label</th>
              <th style={{ width: 200 }}>Harga (Rp)</th>
              <th style={{ width: 140 }}>Nilai saat ini</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        <div className="admin-alert admin-alert-success">Harga berhasil disimpan.</div>
      )}
      {state.error && (
        <div className="admin-alert admin-alert-error">{state.error}</div>
      )}

      <PricingTable
        title="Harga Baju per Bahan"
        sub="Harga dasar baju sebelum ditambah biaya sablon."
        items={bahan}
      />
      <PricingTable
        title="Harga Sablon per Ukuran"
        sub="Biaya sablon per sisi (depan / belakang), ditambahkan di atas harga baju."
        items={sablon}
      />

      <div className="admin-form-actions" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="btn-admin-primary" disabled={pending}>
          {pending ? 'Menyimpan…' : 'Simpan Semua Harga'}
        </button>
      </div>
    </form>
  )
}
