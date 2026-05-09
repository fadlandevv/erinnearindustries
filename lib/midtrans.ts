import type { OrderItem, OrderCustomer } from './orders'

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? ''
const BASE_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

export async function createSnapToken(
  orderId: string,
  totalPrice: number,
  customer: OrderCustomer,
  items: OrderItem[]
): Promise<string> {
  const authHeader =
    'Basic ' + Buffer.from(SERVER_KEY + ':').toString('base64')

  const body = {
    transaction_details: {
      order_id: orderId,
      gross_amount: totalPrice,
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
      phone: customer.phone,
      billing_address: {
        address: customer.address,
        city: customer.city,
        postal_code: customer.postalCode,
        country_code: 'IDN',
      },
      shipping_address: {
        address: customer.address,
        city: customer.city,
        postal_code: customer.postalCode,
        country_code: 'IDN',
      },
    },
    item_details: items.map((item) => ({
      id: `${item.productId}-${item.size}`,
      price: item.unitPrice,
      quantity: item.quantity,
      name: `${item.title} (${item.size})`.slice(0, 50),
    })),
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/checkout/success`,
    },
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Midtrans error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.token as string
}
