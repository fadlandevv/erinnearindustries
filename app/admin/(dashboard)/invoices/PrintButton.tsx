'use client'

/** Cetak / simpan PDF lewat dialog print browser — tidak perlu library PDF. */
export default function PrintButton() {
  return (
    <button type="button" className="btn-admin-primary" onClick={() => window.print()}>
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M4.5 6V2.5h7V6" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 12H3a1 1 0 01-1-1V7a1 1 0 011-1h10a1 1 0 011 1v4a1 1 0 01-1 1h-1.5"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4.5" y="9.5" width="7" height="4" rx="0.8"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      Print
    </button>
  )
}
