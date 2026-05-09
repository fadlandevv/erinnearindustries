import type { Order } from '@/lib/orders'

const steps: { label: string; sub: string }[] = [
  { label: 'Pesanan Dibuat',    sub: 'Order diterima' },
  { label: 'Pembayaran',        sub: 'Pembayaran dikonfirmasi' },
  { label: 'Diproses',          sub: 'Sedang disiapkan' },
  { label: 'Dikirim',           sub: 'Dalam perjalanan' },
  { label: 'Selesai',           sub: 'Pesanan diterima' },
]

function getActiveStep(status: Order['status']): number {
  switch (status) {
    case 'pending':    return 0
    case 'paid':       return 1
    case 'processing': return 2
    case 'shipped':    return 3
    case 'delivered':  return 4
    default:           return -1   // failed / expired
  }
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export default function OrderTracker({ status }: { status: Order['status'] }) {
  const active = getActiveStep(status)
  const isFailed = status === 'failed' || status === 'expired'

  return (
    <div className="otr-wrap">
      <div className="otr-steps">
        {steps.map((step, i) => {
          const done    = !isFailed && i < active
          const current = !isFailed && i === active
          const failed  = isFailed && i === 0

          let dotClass = 'otr-dot'
          if (done)    dotClass += ' otr-dot--done'
          if (current) dotClass += ' otr-dot--current'
          if (failed)  dotClass += ' otr-dot--failed'

          return (
            <div key={i} className={`otr-step${i < steps.length - 1 ? ' otr-step--has-line' : ''}`}>
              {/* Connector line left of dot */}
              {i > 0 && (
                <div className={`otr-line${(!isFailed && i <= active) ? ' otr-line--done' : ''}`} />
              )}

              {/* Dot */}
              <div className={dotClass}>
                {done ? <CheckIcon /> : <span>{i + 1}</span>}
              </div>

              {/* Label */}
              <div className="otr-label">
                <span className={`otr-label-main${current ? ' otr-label-main--active' : ''}${done ? ' otr-label-main--done' : ''}`}>
                  {step.label}
                </span>
                <span className="otr-label-sub">{step.sub}</span>
              </div>
            </div>
          )
        })}
      </div>

      {isFailed && (
        <p className="otr-failed-note">
          {status === 'expired' ? 'Pesanan telah kedaluwarsa.' : 'Pesanan gagal diproses.'}
        </p>
      )}
    </div>
  )
}
