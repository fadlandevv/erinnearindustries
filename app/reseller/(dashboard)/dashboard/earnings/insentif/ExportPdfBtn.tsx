'use client'

export default function ExportPdfBtn() {
  return (
    <button
      className="insentif-add-btn insentif-export-btn"
      onClick={() => window.print()}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ marginRight: '0.3rem' }}>
        <path d="M2 5V2h10v3M2 10h10M7 5v5m-2.5-2.5L7 5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Export PDF
    </button>
  )
}
