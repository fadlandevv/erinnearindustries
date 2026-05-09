import { createHash } from 'crypto'
import { updateOrderStatus } from '@/lib/orders'
import { NextRequest, NextResponse } from 'next/server'

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? ''

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signature: string
) {
  const hash = createHash('sha512')
    .update(orderId + statusCode + grossAmount + SERVER_KEY)
    .digest('hex')
  return hash === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body

    if (!verifySignature(order_id, status_code, gross_amount, signature_key)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    let status: 'paid' | 'pending' | 'failed' | 'expired' = 'pending'

    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    ) {
      if (fraud_status === 'accept' || !fraud_status) status = 'paid'
    } else if (transaction_status === 'pending') {
      status = 'pending'
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'failure'
    ) {
      status = 'failed'
    } else if (transaction_status === 'expire') {
      status = 'expired'
    }

    // Strip retry suffix (e.g. "EI-123-r1700000000000" → "EI-123")
    const internalId = order_id.replace(/-r\d+$/, '')
    updateOrderStatus(internalId, status)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Midtrans webhook error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
