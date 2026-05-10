'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '@/lib/data'

export type CustomSpec = {
  warna: string
  warnaNama: string
  bahan: string
  jumlah: number
  hargaPerPcs: number
  size: string
  depan: boolean
  belakang: boolean
  catatan?: string
}

export type CartItem = {
  product: Product
  size: string
  quantity: number
  customSpec?: CustomSpec
}

type CartCtx = {
  items: CartItem[]
  addToCart: (product: Product, size: string) => void
  addCustomItem: (spec: CustomSpec) => void
  removeFromCart: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, qty: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartCtx | null>(null)

function parsePrice(str: string): number {
  return parseInt(str.replace(/[^\d]/g, '')) || 0
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('erinnear-cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('erinnear-cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, size: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.size === size
      )
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, size, quantity: 1 }]
    })
    setIsOpen(true)
  }

  const addCustomItem = (spec: CustomSpec) => {
    const virtualProduct: Product = {
      id: `custom-${Date.now()}`,
      title: 'Custom Design',
      tag: 'Custom Order',
      price: `Rp ${spec.hargaPerPcs.toLocaleString('id-ID')}`,
      bg: spec.warna,
      description: `Bahan: ${spec.bahan} | Warna: ${spec.warnaNama} | ${spec.depan ? 'Desain Depan ✓' : ''}${spec.depan && spec.belakang ? ' + ' : ''}${spec.belakang ? 'Desain Belakang ✓' : ''}`,
      material: [spec.bahan],
      sizes: [spec.size],
    }
    setItems((prev) => [...prev, { product: virtualProduct, size: spec.size, quantity: spec.jumlah, customSpec: spec }])
    setIsOpen(true)
  }

  const removeFromCart = (productId: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.size === size))
    )
  }

  const updateQuantity = (productId: string, size: string, qty: number) => {
    if (qty < 1) return removeFromCart(productId, size)
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
      )
    )
  }

  const clearCart = () => setItems([])
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce(
    (s, i) => s + parsePrice(i.product.price) * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addCustomItem,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
