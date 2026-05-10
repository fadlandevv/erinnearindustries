'use client'
import { useActionState } from 'react'
import { updatePricingAction } from '@/lib/actions'
import type { PricingItem } from '@/lib/pricing'

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function PricingClient({ items }: { items: PricingItem[] }) {
  const bahan  = items.filter(i => i.type === 'bahan')
  const sablon = items.filter(i => i.type === 'sablon')

  const [state, formAction, pending] = useActionState(updatePricingAction, {})

  return (
    <form action={formAction}>
      {state.ok && (
        <div className="admin-alert admin-alert-success" style={{ marginBottom: '1.5rem' }}>
          Harga berhasil disimpan.
        </div>
      )}
      {state.error && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
          {state.error}
        </div>
      )}

      {/* Bahan */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-section-title">Harga Baju per Bahan</h2>
          <p className="admin-section-sub">Harga dasar baju sebelum ditambah biaya sablon.</p>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Jenis Bahan</th>
              <th>Harga/pcs (Rp)</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {bahan.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.label}</td>
                <td>
                  <input
                    type="number"
                    name={`price-${item.id}`}
                    defaultValue={item.price}
                    min={1000}
                    step={1000}
                    className="admin-input"
                    style={{ width: '140px' }}
                  />
                </td>
                <td style={{ color: '#888', fontSize: '0.85rem' }}>{formatRp(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sablon */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-section-title">Harga Sablon per Ukuran</h2>
          <p className="admin-section-sub">Biaya sablon ditambahkan di atas harga baju, per sisi (depan / belakang).</p>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ukuran Sablon</th>
              <th>Harga/sisi (Rp)</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {sablon.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.label}</td>
                <td>
                  <input
                    type="number"
                    name={`price-${item.id}`}
                    defaultValue={item.price}
                    min={1000}
                    step={1000}
                    className="admin-input"
                    style={{ width: '140px' }}
                  />
                </td>
                <td style={{ color: '#888', fontSize: '0.85rem' }}>{formatRp(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
          {pending ? 'Menyimpan…' : 'Simpan Semua Harga'}
        </button>
      </div>
    </form>
  )
}
