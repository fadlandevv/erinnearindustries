import { ImageResponse } from 'next/og'

export const alt = 'Erinnear Industries — Brand Fashion Custom Berkualitas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: '#f47c2f' }} />

        {/* Logo mark */}
        <div
          style={{
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f47c2f',
            borderRadius: 28,
            fontSize: 64,
            fontWeight: 800,
            marginBottom: 36,
            color: '#0d0d0d',
          }}
        >
          EI
        </div>

        <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: -1 }}>Erinnear Industries</div>
        <div style={{ fontSize: 30, color: '#bbb', marginTop: 18, maxWidth: 820, textAlign: 'center' }}>
          Brand fashion custom berkualitas — kaos, totebag &amp; custom printing
        </div>

        {/* Bottom row */}
        <div style={{ position: 'absolute', bottom: 40, display: 'flex', gap: 28, fontSize: 22, color: '#888' }}>
          <span>erinnear.com</span>
          <span>·</span>
          <span>Custom Order</span>
          <span>·</span>
          <span>Reseller</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
