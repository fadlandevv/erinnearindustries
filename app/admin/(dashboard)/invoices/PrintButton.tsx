'use client'

/** Cetak / simpan PDF lewat dialog print browser — tidak perlu library PDF. */
export default function PrintButton() {
  return (
    <button type="button" className="btn-admin-primary" onClick={() => window.print()}>
      Cetak / PDF
    </button>
  )
}
