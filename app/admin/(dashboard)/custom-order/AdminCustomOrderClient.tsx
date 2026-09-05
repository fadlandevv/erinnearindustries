'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CustomDesignClient from '@/components/CustomDesignClient'
import AdminSelect from '@/components/AdminSelect'
import { createManualOrderAction, uploadMockupImageAction } from '@/lib/actions'
import {
  customProductLabel, customRowsQty, customRowsTotal, customRowTitle,
  type CustomOrderRow,
} from '@/lib/custom-order'
import type { ColorOption, PriceOption } from '@/lib/custom-defaults'
import type { InvoiceCustomerOption } from '@/lib/invoices'

export type ProductSetup = {
  label:         string
  sablonOptions: PriceOption[]
  colorOptions:  ColorOption[]
  bahanOptions:  PriceOption[]
  sizeOptions:   PriceOption[]
  productConfig: Record<string, number>
}

const EMPTY_CUSTOMER = {
  name: '', email: '', phone: '', address: '', city: '', postalCode: '',
}

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

export default function AdminCustomOrderClient({
  products,
  customers,
}: {
  products:  Record<string, ProductSetup>
  customers: InvoiceCustomerOption[]
}) {
  const router = useRouter()
  const types = Object.keys(products)

  const [activeType, setActiveType] = useState(types[0] ?? 'tshirt')
  const [rows, setRows] = useState<CustomOrderRow[]>([])
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER)
  const [pickedCustomer, setPickedCustomer] = useState('')
  const [status, setStatus] = useState<'pending' | 'paid'>('pending')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const [saving, setSaving] = useState(false)

  const setup = products[activeType]
  const total = customRowsTotal(rows)
  const qty   = customRowsQty(rows)

  const pickCustomer = (email: string) => {
    setPickedCustomer(email)
    const found = customers.find(c => c.email === email)
    if (!found) return
    setCustomer(c => ({
      ...c,
      name: found.name, email: found.email,
      phone: found.phone, address: found.address,
    }))
  }

  const field = (key: keyof typeof EMPTY_CUSTOMER) => ({
    value: customer[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setCustomer(c => ({ ...c, [key]: e.target.value })),
  })

  /**
   * Mockup dikirim satu per satu, bukan menumpang payload order — data URL-nya
   * besar dan batas body Server Action cuma 1 MB.
   */
  const uploadMockups = async (list: CustomOrderRow[]): Promise<CustomOrderRow[]> => {
    const pending = list.flatMap(r =>
      (['mockupDepan', 'mockupBelakang'] as const).filter(k => r[k]?.startsWith('data:')),
    ).length
    let done = 0
    const out: CustomOrderRow[] = []

    for (const row of list) {
      // Preview lokal (blob:/__pdf__:) tidak ada artinya di server — dibuang
      // supaya payload tetap ramping.
      const next: CustomOrderRow = { ...row, depanPreview: undefined, belakangPreview: undefined }
      for (const key of ['mockupDepan', 'mockupBelakang'] as const) {
        const dataUrl = row[key]
        if (!dataUrl?.startsWith('data:')) continue
        setProgress(`Mengunggah mockup ${++done}/${pending}…`)
        const res = await uploadMockupImageAction(dataUrl)
        if (res.error) throw new Error(`Gagal mengunggah mockup: ${res.error}`)
        next[key] = res.url
      }
      out.push(next)
    }
    return out
  }

  const handleSubmit = async () => {
    if (!rows.length)            { setError('Belum ada item. Tambahkan minimal satu desain.'); return }
    if (!customer.name.trim())   { setError('Nama customer wajib diisi.'); return }

    setSaving(true)
    setError('')
    try {
      const prepared = await uploadMockups(rows)
      setProgress('Menyimpan order…')

      const fd = new FormData()
      Object.entries(customer).forEach(([k, v]) => fd.set(k, v.trim()))
      fd.set('status', status)
      fd.set('notes', notes)
      fd.set('itemsJson', JSON.stringify(prepared))

      const res = await createManualOrderAction(null, fd)
      if (res.error || !res.orderId) {
        setError(res.error ?? 'Gagal menyimpan order.')
        return
      }
      // Form invoice sudah bisa mengisi dirinya dari sebuah order — dipakai
      // ulang di sini supaya admin tinggal mengatur diskon/ongkir lalu simpan.
      router.push(`/admin/invoices/new?orderId=${res.orderId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan order.')
    } finally {
      setSaving(false)
      setProgress('')
    }
  }

  return (
    <div className="cmo-wrap">
      {/* Pemilih produk — tab tidak mengosongkan daftar item yang sudah disusun */}
      <div className="cmo-tabs">
        {types.map(type => (
          <button
            key={type} type="button"
            className={`cmo-tab${type === activeType ? ' cmo-tab--active' : ''}`}
            onClick={() => setActiveType(type)}
          >
            {products[type].label}
            {rows.some(r => r.productType === type) && (
              <span className="cmo-tab-count">{rows.filter(r => r.productType === type).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="cmo-designer">
        <CustomDesignClient
          key={activeType}
          mode="admin"
          productType={activeType}
          bahanOptions={setup.bahanOptions}
          sablonOptions={setup.sablonOptions}
          colorOptions={setup.colorOptions}
          sizeOptions={setup.sizeOptions}
          productConfig={setup.productConfig}
          items={rows}
          onItemsChange={setRows}
        />
      </div>

      {rows.length > 0 && (
        <div className="admin-form-card cmo-panel">
          <h2 className="admin-form-section-title">Mockup Tersimpan</h2>
          <div className="cmo-mockups">
            {rows.flatMap(row =>
              ([['Depan', row.mockupDepan], ['Belakang', row.mockupBelakang]] as const)
                .filter(([, src]) => src)
                .map(([side, src]) => (
                  <figure key={`${row.rowId}-${side}`} className="cmo-mockup">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src!} alt={`Mockup ${side} — ${customRowTitle(row)}`} />
                    <figcaption>{customProductLabel(row.productType)} · {side}</figcaption>
                  </figure>
                )),
            )}
          </div>
          <p className="admin-form-hint">
            Mockup dirender otomatis saat item ditambahkan, lalu ikut tersimpan di order —
            desain PDF tidak bisa dirender jadi gambar.
          </p>
        </div>
      )}

      <div className="admin-form-card cmo-panel">
        <h2 className="admin-form-section-title">Data Customer</h2>

        {customers.length > 0 && (
          <div className="admin-form-group">
            <label>Pilih Pelanggan</label>
            <AdminSelect
              value={pickedCustomer}
              onChange={pickCustomer}
              options={customers.map(c => ({
                value: c.email,
                label: c.phone ? `${c.name} — ${c.phone}` : c.name,
              }))}
              placeholder="Member / pembeli sebelumnya (opsional)…"
            />
          </div>
        )}

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="cmo-name">Nama Customer *</label>
            <input id="cmo-name" type="text" maxLength={120} className="admin-form-input"
              placeholder="Nama / perusahaan" {...field('name')} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="cmo-phone">No. HP</label>
            <input id="cmo-phone" type="tel" maxLength={30} className="admin-form-input"
              placeholder="08xxxxxxxxxx" {...field('phone')} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="cmo-email">Email</label>
            <input id="cmo-email" type="email" maxLength={120} className="admin-form-input"
              placeholder="Boleh dikosongkan" {...field('email')} />
          </div>
          <div className="admin-form-group">
            <label>Status Pembayaran</label>
            <AdminSelect
              value={status}
              onChange={v => setStatus(v === 'paid' ? 'paid' : 'pending')}
              options={[
                { value: 'pending', label: 'Belum Dibayar' },
                { value: 'paid',    label: 'Sudah Dibayar' },
              ]}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="cmo-city">Kota</label>
            <input id="cmo-city" type="text" maxLength={80} className="admin-form-input"
              {...field('city')} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="cmo-postal">Kode Pos</label>
            <input id="cmo-postal" type="text" maxLength={10} className="admin-form-input"
              {...field('postalCode')} />
          </div>
        </div>

        <div className="admin-form-group">
          <label htmlFor="cmo-address">Alamat</label>
          <input id="cmo-address" type="text" maxLength={200} className="admin-form-input"
            {...field('address')} />
        </div>

        <div className="admin-form-group">
          <label htmlFor="cmo-notes">Catatan Order</label>
          <textarea id="cmo-notes" rows={2} className="admin-form-textarea" maxLength={500}
            placeholder="cth. deadline, PIC, kesepakatan DP"
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {error && <p className="admin-alert admin-alert-error">{error}</p>}

        <div className="cmo-summary">
          <span>{rows.length} item · {qty} pcs</span>
          <strong>{formatRp(total)}</strong>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="btn-admin-primary"
            onClick={handleSubmit} disabled={saving || rows.length === 0}>
            {saving ? (progress || 'Menyimpan…') : 'Simpan Order & Buat Invoice →'}
          </button>
        </div>
        <p className="admin-form-hint">
          Order tersimpan tanpa pembayaran online, lalu form invoice terbuka dengan data
          customer dan itemnya sudah terisi.
        </p>
      </div>
    </div>
  )
}
