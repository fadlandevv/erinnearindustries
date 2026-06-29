'use server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getProducts, saveProducts, deleteProduct as _deleteProductFromDB, getServices, saveServices, getGallery, saveGallery, getShowcase, saveShowcase, saveContent, type ContentData } from './data'
import { saveOrder, getOrderById, getOrdersByEmail, deleteOrder, updateOrderStatus, type OrderItem, type Order } from './orders'
import { createSnapToken } from './midtrans'
import { getUserByEmail, saveUser, updateUser, deleteUser, hashPassword, verifyPassword, createResetToken, validateAndConsumeResetToken } from './users'
import {
  getAdminByUsername, getAdminById, saveAdmin, deleteAdmin as _deleteAdmin,
  getRoles, getRoleById, saveRole, deleteRole as _deleteRole,
  hashAdminPassword, verifyAdminPassword, type Permission,
} from './rbac'
import {
  getResellerByUsername, getResellerById, getResellers, saveReseller, deleteReseller as _deleteReseller,
  hashResellerPassword, verifyResellerPassword, saveResellerOrder, updateResellerOrderStatus,
  getResellerOrders, type ResellerOrderStatus,
} from './resellers'
import { adjustStock, upsertSizeEntry } from './warehouse'
import { saveManualEntry, deleteManualEntry, type RekapSource } from './rekap'
import { savePembukuanEntry, deletePembukuanEntry, type EntryType } from './pembukuan'
import { logAdminAccess } from './access-log'
import { getPricingItems, upsertPricingItem, insertPricingItem, deletePricingItem } from './pricing'
import { fetchShippingCost, fetchShippingCostByName, type ShippingOption } from './rajaongkir'
import { generateId } from './utils'
import { db } from './db'
import { getOrderMessages, getMessagesByOrderIds, sendOrderMessage, markMessagesRead, type OrderMessage } from './order-messages'

function parseSizechart(formData: FormData): string | undefined {
  const chart: Record<string, { panjang: number; lebar: number }> = {}
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('sc_p_')) continue
    const size = key.slice(5)
    const p = parseInt(value as string)
    const l = parseInt(formData.get(`sc_l_${size}`) as string)
    if (!isNaN(p) || !isNaN(l)) {
      chart[size] = { panjang: isNaN(p) ? 0 : p, lebar: isNaN(l) ? 0 : l }
    }
  }
  return Object.keys(chart).length > 0 ? JSON.stringify(chart) : undefined
}

async function saveImage(file: File, productId: string, slot: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `products/${productId}/${slot}.${ext}`
  const { error } = await db.storage
    .from('images')
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      upsert: true,
      contentType: file.type || `image/${ext}`,
    })
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = db.storage.from('images').getPublicUrl(storagePath)
  return publicUrl
}

async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? 'unknown'
}

export async function login(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const username = (formData.get('username') as string).trim()
  const password = formData.get('password') as string
  const admin = await getAdminByUsername(username)
  const ip = await getClientIp()

  if (!admin || !verifyAdminPassword(password, admin.passwordHash)) {
    await logAdminAccess({ adminId: admin?.id ?? '', username: username || '?', action: 'login_failed', ip })
    return { error: 'Username atau password salah.' }
  }

  const jar = await cookies()
  jar.set('admin-token', admin.id, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  await logAdminAccess({ adminId: admin.id, username: admin.username, action: 'login', ip })
  redirect('/admin')
}

export async function logout() {
  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  if (adminId) {
    const admin = await getAdminById(adminId)
    if (admin) {
      const ip = await getClientIp()
      await logAdminAccess({ adminId: admin.id, username: admin.username, action: 'logout', ip })
    }
  }
  jar.delete('admin-token')
  redirect('/admin/login')
}

export async function createProduct(formData: FormData) {
  const id = Date.now().toString()
  let image: string | undefined
  const mainFile = formData.get('image') as File | null
  if (mainFile && mainFile.size > 0) image = await saveImage(mainFile, id, 'main')

  const images: string[] = ['', '', '', '']
  for (let i = 0; i < 4; i++) {
    const f = formData.get(`detail-${i}`) as File | null
    if (f && f.size > 0) images[i] = await saveImage(f, id, `detail-${i}`)
  }

  const colorsRaw = (formData.get('colors') as string | null) ?? ''
  const colors = colorsRaw.split(',').map((c) => c.trim()).filter(Boolean)

  const products = await getProducts()
  products.push({
    id,
    tag: formData.get('tag') as string,
    title: formData.get('title') as string,
    price: '—',
    bg: colors[0] ?? '#f0ede8',
    colors: colors.length > 0 ? colors : undefined,
    description: formData.get('description') as string,
    material: ((formData.get('material') as string | null) ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
    sizechart: parseSizechart(formData),
    sizes: formData.getAll('sizes') as string[],
    ...(image ? { image } : {}),
    ...(images.some(Boolean) ? { images } : {}),
    updatedAt: new Date().toISOString(),
  })
  await saveProducts(products)
  revalidateTag('products', {})
  revalidatePath('/product')
  redirect('/admin/products?toast=Produk+berhasil+ditambah')
}

export async function updateProduct(id: string, formData: FormData) {
  const products = await getProducts()
  const existing = products.find((p) => p.id === id)

  let image = existing?.image
  const mainFile = formData.get('image') as File | null
  if (mainFile && mainFile.size > 0) image = await saveImage(mainFile, id, 'main')

  const images: string[] = ['', '', '', '']
  existing?.images?.forEach((v, i) => { if (i < 4) images[i] = v })
  for (let i = 0; i < 4; i++) {
    const f = formData.get(`detail-${i}`) as File | null
    if (f && f.size > 0) images[i] = await saveImage(f, id, `detail-${i}`)
  }

  const colorsRaw = (formData.get('colors') as string | null) ?? ''
  const colors = colorsRaw.split(',').map((c) => c.trim()).filter(Boolean)

  const updated = products.map((p) =>
    p.id === id ? {
      ...p,
      tag: formData.get('tag') as string,
      title: formData.get('title') as string,
      price: p.price,
      bg: colors[0] ?? p.bg,
      colors: colors.length > 0 ? colors : p.colors,
      description: formData.get('description') as string,
      material: ((formData.get('material') as string | null) ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
      sizes: formData.getAll('sizes') as string[],
      image, images,
      updatedAt: new Date().toISOString(),
    } : p
  )
  await saveProducts(updated)
  revalidateTag('products', {})
  revalidatePath('/product')
  revalidatePath(`/product/${id}`)
  redirect('/admin/products?toast=Produk+berhasil+diperbarui')
}

export async function duplicateProduct(id: string) {
  const products = await getProducts()
  const source = products.find((p) => p.id === id)
  if (!source) return
  const newId = Date.now().toString()
  products.push({ ...source, id: newId, title: `${source.title} (Copy)`, image: undefined, images: undefined })
  await saveProducts(products)
  revalidateTag('products', {})
  revalidatePath('/product')
  redirect(`/admin/products/${newId}/edit?toast=Produk+berhasil+diduplikat`)
}

export async function deleteProduct(id: string) {
  await _deleteProductFromDB(id)
  revalidateTag('products', {})
  revalidatePath('/product')
  redirect('/admin/products?toast=Produk+berhasil+dihapus&toastType=success')
}

export async function createService(formData: FormData) {
  const services = await getServices()
  const tag = (formData.get('tag') as string).trim()
  const featuresRaw = (formData.get('features') as string).trim()
  const features = featuresRaw ? featuresRaw.split('\n').map((l) => l.trim()).filter(Boolean) : undefined
  services.push({
    id: Date.now().toString(),
    icon: formData.get('icon') as string,
    title: formData.get('title') as string,
    desc: formData.get('desc') as string,
    tag: tag || null,
    longDesc: (formData.get('longDesc') as string).trim() || undefined,
    ...(features?.length ? { features } : {}),
  })
  await saveServices(services)
  revalidateTag('services', {})
  revalidatePath('/service')
  redirect('/admin/services?toast=Layanan+berhasil+ditambah')
}

export async function updateService(id: string, formData: FormData) {
  const tag = (formData.get('tag') as string).trim()
  const featuresRaw = (formData.get('features') as string).trim()
  const features = featuresRaw ? featuresRaw.split('\n').map((l) => l.trim()).filter(Boolean) : undefined
  const services = await getServices()
  const updated = services.map((s) =>
    s.id === id ? {
      ...s,
      icon: formData.get('icon') as string,
      title: formData.get('title') as string,
      desc: formData.get('desc') as string,
      tag: tag || null,
      longDesc: (formData.get('longDesc') as string).trim() || undefined,
      features: features?.length ? features : undefined,
    } : s
  )
  await saveServices(updated)
  revalidateTag('services', {})
  revalidatePath('/service')
  revalidatePath(`/service/${id}`)
  redirect('/admin/services?toast=Layanan+berhasil+diperbarui')
}

export async function updateShowcaseItem(itemId: string, formData: FormData): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  const showcase = await getShowcase()
  const item = showcase.find((s) => s.id === itemId)
  if (!item) return

  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `showcase/item-${itemId}.${ext}`
    const { error } = await db.storage
      .from('images')
      .upload(storagePath, Buffer.from(await imageFile.arrayBuffer()), {
        upsert: true,
        contentType: imageFile.type || `image/${ext}`,
      })
    if (error) throw new Error(error.message)
    const { data: { publicUrl } } = db.storage.from('images').getPublicUrl(storagePath)
    item.image = publicUrl
  }

  item.title = (formData.get('title') as string).trim() || item.title
  item.desc = (formData.get('desc') as string).trim() || item.desc
  item.buttonText = (formData.get('buttonText') as string).trim() || item.buttonText
  item.buttonHref = (formData.get('buttonHref') as string).trim() || item.buttonHref

  await saveShowcase(showcase.map((s) => (s.id === itemId ? item : s)))
  revalidatePath('/')
  redirect('/admin/showcase?toast=Showcase+berhasil+disimpan')
}

export async function updateGallerySlot(slotId: string, formData: FormData): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  const gallery = await getGallery()
  const slot = gallery.find((g) => g.id === slotId)
  if (!slot) return

  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `gallery/slot-${slotId}.${ext}`
    const { error } = await db.storage
      .from('images')
      .upload(storagePath, Buffer.from(await imageFile.arrayBuffer()), {
        upsert: true,
        contentType: imageFile.type || `image/${ext}`,
      })
    if (error) throw new Error(error.message)
    const { data: { publicUrl } } = db.storage.from('images').getPublicUrl(storagePath)
    slot.image = publicUrl
  }

  const label = (formData.get('label') as string).trim()
  const sublabel = (formData.get('sublabel') as string).trim()
  if (label) slot.label = label
  if (sublabel) slot.sublabel = sublabel

  await saveGallery(gallery.map((g) => (g.id === slotId ? slot : g)))
  revalidatePath('/')
  redirect('/admin/gallery?toast=Gallery+berhasil+disimpan')
}

export async function deleteService(id: string) {
  const services = await getServices()
  await saveServices(services.filter((s) => s.id !== id))
  revalidateTag('services', {})
  revalidatePath('/service')
  redirect('/admin/services?toast=Layanan+berhasil+dihapus&toastType=success')
}

function parsePrice(str: string): number {
  return parseInt(str.replace(/[^\d]/g, '')) || 0
}

// ── Custom Product Options ────────────────────────────────────

export async function addCustomProductOptionAction(
  _: Record<string, unknown>,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const productType = (formData.get('product_type') as string)?.trim()
  const category    = (formData.get('category') as string)?.trim()
  const label       = (formData.get('label') as string)?.trim()
  const value       = (formData.get('value') as string) ?? ''
  const price       = parseInt(formData.get('price') as string) || 0
  if (!productType || !category || !label) return { error: 'Data tidak lengkap.' }
  const { error } = await db.from('custom_product_options').insert({
    product_type: productType, category, label, value, price, sort_order: Math.floor(Date.now() / 1000),
  })
  if (error) return { error: error.message }
  return { ok: true }
}

export async function deleteCustomProductOptionAction(id: string): Promise<void> {
  await db.from('custom_product_options').delete().eq('id', id)
}

export async function seedDefaultBahansAction(
  productType: string,
  bahans: { label: string; price: number }[]
): Promise<void> {
  const rows = bahans.map((b, i) => ({
    product_type: productType,
    category: 'bahan',
    label: b.label,
    value: '',
    price: b.price,
    sort_order: Math.floor(Date.now() / 1000) + i,
  }))
  await db.from('custom_product_options').insert(rows)
}

export async function seedDefaultSizesAction(
  productType: string,
  sizes: { label: string; price: number }[]
): Promise<void> {
  const rows = sizes.map((s, i) => ({
    product_type: productType,
    category: 'size',
    label: s.label,
    value: '',
    price: s.price,
    sort_order: Math.floor(Date.now() / 1000) + i,
  }))
  await db.from('custom_product_options').insert(rows)
}

export async function updateCustomProductOptionPriceAction(
  id: string, price: number
): Promise<{ ok?: boolean; error?: string }> {
  const { error } = await db.from('custom_product_options').update({ price }).eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}

export async function updateCustomProductOptionAction(
  id: string, label: string, price: number
): Promise<{ ok?: boolean; error?: string }> {
  const { error } = await db.from('custom_product_options').update({ label, price }).eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}

// Upsert by (product_type, category, label) — inserts if not yet in DB, updates if exists.
// sortOrder is the fixed position from the defaults array (keeps display order stable).
export async function upsertCustomProductOptionPriceAction(
  productType: string, category: string, label: string, price: number, sortOrder: number
): Promise<{ ok?: boolean; error?: string }> {
  const { data } = await db.from('custom_product_options')
    .select('id').eq('product_type', productType).eq('category', category).eq('label', label).maybeSingle()
  if (data) {
    const { error } = await db.from('custom_product_options').update({ price, sort_order: sortOrder }).eq('id', data.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await db.from('custom_product_options').insert({
      product_type: productType, category, label, value: '', price, sort_order: sortOrder,
    })
    if (error) return { error: error.message }
  }
  return { ok: true }
}

export async function uploadDesignFileAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null
    if (!file || file.size === 0) return { error: 'File kosong.' }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const isPdf = ext === 'pdf'
    const contentType = isPdf ? 'application/pdf' : (file.type || `image/${ext}`)
    const path = `custom-designs/${Date.now()}-${generateId(8)}.${ext}`
    const buf = Buffer.from(await file.arrayBuffer())
    const { error } = await db.storage.from('images').upload(path, buf, {
      upsert: false, contentType,
    })
    if (error) return { error: error.message }
    const { data: { publicUrl } } = db.storage.from('images').getPublicUrl(path)
    return { url: publicUrl }
  } catch (e) {
    console.error(e)
    return { error: 'Gagal mengupload file desain.' }
  }
}

export async function createCheckoutOrder(
  formData: FormData
): Promise<{ orderId: string; snapToken: string } | { error: string }> {
  try {
    const cartJSON = formData.get('cart') as string
    const rawItems = JSON.parse(cartJSON) as Array<{
      product: { id: string; title: string; price: string; bg: string }
      size: string
      quantity: number
      customSpec?: { depanUrl?: string; belakangUrl?: string }
    }>
    if (!rawItems.length) return { error: 'Keranjang kosong' }

    const items: OrderItem[] = rawItems.map((i) => ({
      productId: i.product.id, title: i.product.title, price: i.product.price,
      unitPrice: parsePrice(i.product.price), size: i.size, quantity: i.quantity, bg: i.product.bg,
      ...(i.customSpec?.depanUrl    ? { customDesignDepan:    i.customSpec.depanUrl }    : {}),
      ...(i.customSpec?.belakangUrl ? { customDesignBelakang: i.customSpec.belakangUrl } : {}),
    }))

    const kurirRaw = formData.get('kurir') as string | null
    const kurir = kurirRaw ? JSON.parse(kurirRaw) as { name: string; service: string; price: number } : undefined
    const itemsTotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const totalPrice = itemsTotal + (kurir?.price ?? 0)
    const orderId = generateId(6)
    const customer = {
      name: formData.get('name') as string, email: formData.get('email') as string,
      phone: formData.get('phone') as string, address: formData.get('address') as string,
      city: formData.get('city') as string, postalCode: formData.get('postalCode') as string,
      notes: (formData.get('notes') as string) || '',
      ...(kurir ? { kurir } : {}),
    }

    const snapToken = await createSnapToken(orderId, totalPrice, customer, items)
    await saveOrder({ id: orderId, createdAt: new Date().toISOString(), status: 'pending', customer, items, totalPrice, snapToken })
    return { orderId, snapToken }
  } catch (e) {
    console.error(e)
    return { error: 'Gagal memproses pesanan. Coba lagi.' }
  }
}

export async function lookupOrders(formData: FormData): Promise<Order[]> {
  const email = formData.get('email') as string
  if (!email) return []
  return getOrdersByEmail(email)
}

export async function registerUser(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const name     = (formData.get('name') as string).trim()
  const email    = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string

  if (!name || !email || !password) return { error: 'Semua field wajib diisi.' }
  if (password.length < 6) return { error: 'Password minimal 6 karakter.' }
  if (await getUserByEmail(email)) return { error: 'Email sudah terdaftar.' }

  await saveUser({ id: generateId(8), name, email, passwordHash: hashPassword(password), createdAt: new Date().toISOString() })

  const jar = await cookies()
  jar.set('user-session', email, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  redirect('/orders')
}

export async function loginUser(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const email    = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string
  const user = await getUserByEmail(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: 'Email atau password salah.' }
  }
  const jar = await cookies()
  jar.set('user-session', email, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  const callbackUrl = formData.get('callbackUrl') as string
  redirect(callbackUrl || '/orders')
}

export async function logoutUser() {
  const jar = await cookies()
  jar.delete('user-session')
  redirect('/login')
}

export async function adminUpdateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  await updateOrderStatus(orderId, status)
  revalidatePath('/admin/orders')
}

function resellerStatusToOrderStatus(s: ResellerOrderStatus): Order['status'] {
  if (s === 'delivered') return 'paid'
  if (s === 'cancelled') return 'failed'
  if (s === 'shipped') return 'shipped'
  if (s === 'confirmed' || s === 'processing') return 'processing'
  return 'pending'
}

function orderStatusToResellerStatus(s: Order['status']): ResellerOrderStatus {
  if (s === 'paid' || s === 'delivered') return 'delivered'
  if (s === 'failed' || s === 'expired') return 'cancelled'
  if (s === 'shipped') return 'shipped'
  if (s === 'processing') return 'processing'
  return 'pending'
}

export async function updateOrderStatusFormAction(formData: FormData) {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  const orderId = formData.get('orderId') as string
  const status = formData.get('status') as Order['status']
  await updateOrderStatus(orderId, status)
  // Sync back to reseller_orders if this is a reseller order
  const order = await getOrderById(orderId)
  if (order?.customer.email.endsWith('@reseller.internal')) {
    await updateResellerOrderStatus(orderId, orderStatusToResellerStatus(status))
  }
  revalidatePath('/admin/orders')
  revalidatePath('/admin/reseller')
}

export async function renewSnapToken(orderId: string): Promise<{ snapToken: string } | { error: string }> {
  try {
    const jar = await cookies()
    const email = jar.get('user-session')?.value
    if (!email) return { error: 'Tidak terautentikasi.' }
    const orders = await getOrdersByEmail(email)
    const order = orders.find((o) => o.id === orderId)
    if (!order) return { error: 'Pesanan tidak ditemukan.' }
    if (order.status !== 'pending') return { error: 'Pesanan ini sudah diproses.' }
    const retryMidtransId = `${orderId}-r${Date.now()}`
    const snapToken = await createSnapToken(retryMidtransId, order.totalPrice, order.customer, order.items)
    await saveOrder({ ...order, snapToken })
    return { snapToken }
  } catch (e) {
    console.error(e)
    return { error: 'Gagal memperbarui token pembayaran.' }
  }
}

export async function deleteUserOrder(orderId: string): Promise<{ error?: string }> {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  if (!email) return { error: 'Tidak terautentikasi.' }
  const orders = await getOrdersByEmail(email)
  if (!orders.find((o) => o.id === orderId)) return { error: 'Pesanan tidak ditemukan.' }
  await deleteOrder(orderId)
  revalidatePath('/orders')
  return {}
}

export async function updateProfile(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  if (!email) return { error: 'Sesi habis, silakan login ulang.' }
  const user = await getUserByEmail(email)
  if (!user) return { error: 'Akun tidak ditemukan.' }
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Nama tidak boleh kosong.' }
  await updateUser({ ...user, name })
  revalidatePath('/profile')
  return { success: true }
}

export async function changePassword(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  if (!email) return { error: 'Sesi habis, silakan login ulang.' }
  const user = await getUserByEmail(email)
  if (!user) return { error: 'Akun tidak ditemukan.' }
  const oldPassword = formData.get('oldPassword') as string
  const newPassword = formData.get('newPassword') as string
  if (!verifyPassword(oldPassword, user.passwordHash)) return { error: 'Password lama tidak sesuai.' }
  if (newPassword.length < 6) return { error: 'Password baru minimal 6 karakter.' }
  await updateUser({ ...user, passwordHash: hashPassword(newPassword) })
  return { success: true }
}

export async function saveContentAction(_prev: unknown, formData: FormData): Promise<{ ok: boolean }> {
  const raw = formData.get('content') as string
  const data = JSON.parse(raw) as ContentData
  await saveContent(data)
  revalidateTag('content', {})
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function deleteMemberAction(id: string) {
  await deleteUser(id)
  revalidatePath('/admin/members')
}

export async function generateResetLinkAction(
  email: string
): Promise<{ link?: string; error?: string }> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return { error: 'Unauthorized' }
  const user = await getUserByEmail(email)
  if (!user) return { error: 'User tidak ditemukan.' }
  const token = await createResetToken(email)
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return { link: `${base}/reset-password?token=${token}` }
}

export async function resetPasswordAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const token    = formData.get('token') as string
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm') as string
  if (password !== confirm)     return { error: 'Konfirmasi password tidak cocok.' }
  if (password.length < 6)      return { error: 'Password minimal 6 karakter.' }
  const email = await validateAndConsumeResetToken(token)
  if (!email)                   return { error: 'Link tidak valid atau sudah kedaluwarsa.' }
  const user = await getUserByEmail(email)
  if (!user)                    return { error: 'Akun tidak ditemukan.' }
  await updateUser({ ...user, passwordHash: hashPassword(password) })
  return { success: true }
}

export async function createRoleAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Nama role wajib diisi.' }
  const permissions = formData.getAll('permissions') as Permission[]
  await saveRole({ id: Date.now().toString(), name, permissions, locked: false })
  revalidatePath('/admin/roles')
  return {}
}

export async function updateRoleAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const id = formData.get('id') as string
  const role = await getRoleById(id)
  if (!role) return { error: 'Role tidak ditemukan.' }
  if (role.locked) return { error: 'Role ini tidak bisa diedit.' }
  const name = (formData.get('name') as string).trim()
  const permissions = formData.getAll('permissions') as Permission[]
  await saveRole({ ...role, name, permissions })
  revalidatePath('/admin/roles')
  return {}
}

export async function deleteRoleAction(id: string) {
  const role = await getRoleById(id)
  if (role?.locked) return
  await _deleteRole(id)
  revalidatePath('/admin/roles')
}

export async function createAdminAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const username = (formData.get('username') as string).trim()
  const password = (formData.get('password') as string).trim()
  const roleId = formData.get('roleId') as string
  if (!username || !password) return { error: 'Username dan password wajib diisi.' }
  if (password.length < 6) return { error: 'Password minimal 6 karakter.' }
  const exists = await getAdminByUsername(username)
  if (exists) return { error: 'Username sudah digunakan.' }
  await saveAdmin({ id: Date.now().toString(), username, passwordHash: hashAdminPassword(password), roleId, createdAt: new Date().toISOString() })
  revalidatePath('/admin/roles')
  return {}
}

export async function deleteAdminAction(id: string) {
  if (id === 'default-superadmin') return
  await _deleteAdmin(id)
  revalidatePath('/admin/roles')
}

export async function addManualEntryAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const date = (formData.get('date') as string).trim()
  const source = (formData.get('source') as string).trim() as RekapSource
  const platform = (formData.get('platform') as string).trim()
  const amount = parseInt(formData.get('amount') as string, 10)
  const note = (formData.get('note') as string | null)?.trim() || undefined

  if (!date || !source || !platform || isNaN(amount) || amount <= 0)
    return { error: 'Semua field wajib diisi dengan benar.' }
  if (!['marketplace', 'offline'].includes(source))
    return { error: 'Sumber tidak valid.' }

  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  const admin = adminId ? await getAdminById(adminId) : null

  await saveManualEntry({
    id: Date.now().toString(), date, source, platform, amount, note,
    filledBy: admin?.username, createdAt: new Date().toISOString(),
  })
  revalidatePath('/admin/rekap')
  return {}
}

export async function deleteManualEntryAction(id: string) {
  await deleteManualEntry(id)
  revalidatePath('/admin/rekap')
}

export async function addPembukuanAction(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const date = (formData.get('date') as string).trim()
  const type = (formData.get('type') as string).trim() as EntryType
  const category = (formData.get('category') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || undefined
  const amount = parseInt(formData.get('amount') as string, 10)
  const note = (formData.get('note') as string | null)?.trim() || undefined

  if (!date || !type || !category || isNaN(amount) || amount <= 0)
    return { error: 'Semua field wajib diisi dengan benar.' }
  if (!['pemasukan', 'pengeluaran'].includes(type))
    return { error: 'Tipe tidak valid.' }

  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  const admin = adminId ? await getAdminById(adminId) : null

  await savePembukuanEntry({ date, type, category, description, amount, note, filledBy: admin?.username })
  revalidatePath('/admin/pembukuan')
  return {}
}

export async function deletePembukuanAction(id: string) {
  await deletePembukuanEntry(id)
  revalidatePath('/admin/pembukuan')
}

export async function updatePricingAction(
  _prev: { ok?: boolean; error?: string },
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return { error: 'Unauthorized' }
  const items = await getPricingItems()
  await Promise.all(
    items.map(item => {
      const raw = formData.get(`price-${item.id}`) as string | null
      const val = parseInt(raw ?? '', 10)
      if (!isNaN(val) && val > 0)
        return upsertPricingItem({ id: item.id, type: item.type, label: item.label, price: val })
      return Promise.resolve()
    })
  )
  revalidatePath('/admin/pricing')
  revalidatePath('/custom')
  return { ok: true }
}

export async function addPricingItemAction(
  _prev: { ok?: boolean; error?: string },
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return { error: 'Unauthorized' }
  const type  = formData.get('type') as 'bahan' | 'sablon'
  const label = (formData.get('label') as string).trim()
  const price = parseInt(formData.get('price') as string, 10)
  if (!label) return { error: 'Label wajib diisi.' }
  if (isNaN(price) || price < 1000) return { error: 'Harga minimal Rp 1.000.' }
  await insertPricingItem(type, label, price)
  revalidatePath('/admin/pricing')
  revalidatePath('/custom')
  return { ok: true }
}

export async function deletePricingItemAction(id: string): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  await deletePricingItem(id)
  revalidatePath('/admin/pricing')
  revalidatePath('/custom')
}

export async function adjustStockAction(input: {
  productId: string
  productTitle: string
  size: string
  type: 'restock' | 'keluar' | 'koreksi'
  amount: number
  note: string
}): Promise<{ error?: string }> {
  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  if (!adminId) return { error: 'Unauthorized' }
  const admin = await getAdminById(adminId)
  if (!admin) return { error: 'Unauthorized' }
  return adjustStock(
    input.productId, input.productTitle, input.size,
    input.type, input.amount, input.note, admin.username,
  )
}

export async function updateProductPriceAction(
  productId: string,
  price: string,
): Promise<{ error?: string }> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return { error: 'Unauthorized' }
  const products = await getProducts()
  const updated = products.map(p => p.id === productId ? { ...p, price } : p)
  await saveProducts(updated)
  revalidatePath('/product')
  revalidatePath(`/product/${productId}`)
  return {}
}

export async function updateProductInfo(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  try {
    const products = await getProducts()
    const existing = products.find(p => p.id === id)
    if (!existing) return { error: 'Produk tidak ditemukan' }
    const colorsRaw = (formData.get('colors') as string | null) ?? ''
    const colors = colorsRaw.split(',').map(c => c.trim()).filter(Boolean)
    const priceResellerRaw = formData.get('price_reseller') as string | null
    const priceReseller = priceResellerRaw && priceResellerRaw.trim() !== ''
      ? parseInt(priceResellerRaw.trim(), 10) || undefined
      : undefined
    const updated = products.map(p =>
      p.id === id ? {
        ...p,
        tag: formData.get('tag') as string,
        title: formData.get('title') as string,
        bg: colors[0] ?? p.bg,
        colors: colors.length > 0 ? colors : p.colors,
        description: formData.get('description') as string,
        material: ((formData.get('material') as string | null) ?? '').split('\n').map(s => s.trim()).filter(Boolean),
        sizechart: parseSizechart(formData),
        sizes: formData.getAll('sizes') as string[],
        priceReseller,
        updatedAt: new Date().toISOString(),
      } : p
    )
    await saveProducts(updated)
    revalidatePath('/product')
    revalidatePath(`/product/${id}`)
    revalidatePath(`/admin/products/${id}/edit`)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Gagal menyimpan' }
  }
}

export async function updateProductPhotos(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  try {
    const products = await getProducts()
    const existing = products.find(p => p.id === id)
    if (!existing) return { error: 'Produk tidak ditemukan' }
    let image = existing.image
    const mainFile = formData.get('image') as File | null
    if (mainFile && mainFile.size > 0) image = await saveImage(mainFile, id, 'main')
    const images: string[] = ['', '', '', '']
    existing.images?.forEach((v, i) => { if (i < 4) images[i] = v })
    for (let i = 0; i < 4; i++) {
      const f = formData.get(`detail-${i}`) as File | null
      if (f && f.size > 0) images[i] = await saveImage(f, id, `detail-${i}`)
    }
    const updated = products.map(p =>
      p.id === id ? { ...p, image, images, updatedAt: new Date().toISOString() } : p
    )
    await saveProducts(updated)
    revalidatePath('/product')
    revalidatePath(`/product/${id}`)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Gagal menyimpan foto' }
  }
}

export async function upsertSizeEntryAction(input: {
  productId: string
  productTitle: string
  size: string
  quantity: number
  harga: number | null
  hpp: number | null
}): Promise<{ error?: string }> {
  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  if (!adminId) return { error: 'Unauthorized' }
  const admin = await getAdminById(adminId)
  if (!admin) return { error: 'Unauthorized' }
  const result = await upsertSizeEntry(
    input.productId, input.productTitle, input.size,
    input.quantity, input.harga, input.hpp, admin.username,
  )
  if (!result.error) {
    revalidatePath(`/admin/products/${input.productId}/edit`)
  }
  return result
}

// ── Reseller Auth ─────────────────────────────────────────────

export async function resellerLogin(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const username = (formData.get('username') as string).trim()
  const password = formData.get('password') as string
  const reseller = await getResellerByUsername(username)
  if (!reseller || !verifyResellerPassword(password, reseller.passwordHash)) {
    return { error: 'Username atau password salah.' }
  }
  if (!reseller.active) {
    return { error: 'Akun reseller ini tidak aktif. Hubungi admin.' }
  }
  const jar = await cookies()
  jar.set('reseller-token', reseller.id, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  redirect('/reseller/dashboard')
}

export async function resellerLogout(): Promise<void> {
  const jar = await cookies()
  jar.delete('reseller-token')
  redirect('/reseller/login')
}

// ── Reseller Orders ───────────────────────────────────────────

export async function createResellerOrderAction(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  try {
    const jar = await cookies()
    const resellerId = jar.get('reseller-token')?.value
    if (!resellerId) return { error: 'Sesi habis, silakan login ulang.' }
    const reseller = await getResellerById(resellerId)
    if (!reseller) return { error: 'Akun reseller tidak ditemukan.' }

    const customerName = (formData.get('customerName') as string).trim()
    const customerPhone = (formData.get('customerPhone') as string ?? '').trim()
    const customerAddress = (formData.get('customerAddress') as string ?? '').trim()
    const itemsJson = formData.get('itemsJson') as string

    if (!customerName) return { error: 'Nama customer wajib diisi.' }

    const items = JSON.parse(itemsJson) as Array<{
      productId: string; title: string; size: string; qty: number; unitPrice: number; subtotal: number
    }>
    if (!items.length) return { error: 'Keranjang kosong.' }

    const totalPrice = items.reduce((s, i) => s + i.subtotal, 0)
    const orderId = generateId(10)
    const createdAt = new Date().toISOString()

    await saveResellerOrder({
      id: orderId,
      resellerId: reseller.id,
      resellerUsername: reseller.username,
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalPrice,
      commission: 0,
      status: 'pending',
      note: '',
      createdAt,
    })

    // Mirror into main orders table so it counts toward revenue and admin status tracking
    const formatIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
    const orderItems: OrderItem[] = items.map(i => ({
      productId: i.productId,
      title: i.title,
      price: formatIDR(i.unitPrice),
      unitPrice: i.unitPrice,
      size: i.size,
      quantity: i.qty,
      bg: '',
    }))
    await saveOrder({
      id: orderId,
      createdAt,
      status: 'pending',
      customer: {
        name: customerName,
        email: `reseller:${reseller.username}@reseller.internal`,
        phone: customerPhone,
        address: customerAddress,
        city: '',
        postalCode: '',
        notes: `via reseller: ${reseller.username}`,
      },
      items: orderItems,
      totalPrice,
      snapToken: '',
    })

    revalidatePath('/reseller/dashboard/orders')
    revalidatePath('/reseller/dashboard')
    revalidatePath('/admin/reseller')
    revalidatePath('/admin/orders')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { error: e instanceof Error ? e.message : 'Gagal membuat pesanan.' }
  }
}

// ── Admin: Reseller CRUD ──────────────────────────────────────

export async function createResellerAction(
  _prev: { error?: string; ok?: boolean },
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return { error: 'Unauthorized' }

  const username = (formData.get('username') as string).trim()
  const password = (formData.get('password') as string).trim()
  const name = (formData.get('name') as string).trim()
  const phone = (formData.get('phone') as string ?? '').trim()
  const level = (formData.get('level') as string) || 'bronze'

  if (!username || !password || !name) return { error: 'Username, password, dan nama wajib diisi.' }
  if (password.length < 6) return { error: 'Password minimal 6 karakter.' }

  const exists = await getResellerByUsername(username)
  if (exists) return { error: 'Username sudah digunakan.' }

  await saveReseller({
    id: generateId(8),
    username,
    passwordHash: hashResellerPassword(password),
    name,
    phone,
    level: level as 'bronze' | 'silver' | 'gold',
    active: true,
    createdAt: new Date().toISOString(),
  })

  revalidatePath('/admin/reseller')
  return { ok: true }
}

export async function deleteResellerAction(id: string): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  await _deleteReseller(id)
  revalidatePath('/admin/reseller')
}

export async function updateResellerOrderStatusAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  const status = formData.get('status') as ResellerOrderStatus
  const commissionRaw = formData.get('commission') as string
  const commission = parseInt(commissionRaw, 10) || 0

  await updateResellerOrderStatus(id, status, commission)
  // Sync status to main orders table
  await updateOrderStatus(id, resellerStatusToOrderStatus(status))
  revalidatePath('/admin/reseller')
  revalidatePath('/admin/orders')
  return {}
}

export async function updateProductResellerPriceAction(
  productId: string,
  priceReseller: number | null,
): Promise<{ error?: string }> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return { error: 'Unauthorized' }
  const products = await getProducts()
  const updated = products.map(p =>
    p.id === productId
      ? { ...p, priceReseller: priceReseller ?? undefined }
      : p
  )
  await saveProducts(updated)
  revalidatePath('/product')
  revalidatePath(`/product/${productId}`)
  revalidatePath('/admin/reseller')
  return {}
}

// ── Order Discussion ──────────────────────────────────────────

export async function sendOrderMessageAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  if (!email) return { error: 'Sesi habis, silakan login ulang.' }
  const user = await getUserByEmail(email)
  if (!user) return { error: 'Pengguna tidak ditemukan.' }

  const orderId = formData.get('orderId') as string
  const message = (formData.get('message') as string ?? '').trim()
  if (!message) return { error: 'Pesan tidak boleh kosong.' }

  const orders = await getOrdersByEmail(email)
  if (!orders.find(o => o.id === orderId)) return { error: 'Pesanan tidak ditemukan.' }

  await sendOrderMessage({ id: generateId(12), orderId, sender: 'customer', senderName: user.name, message })
  revalidatePath('/orders')
  return {}
}

export async function adminSendOrderMessageAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  if (!adminId) return { error: 'Unauthorized' }
  const admin = await getAdminById(adminId)
  if (!admin) return { error: 'Admin tidak ditemukan.' }

  const orderId = formData.get('orderId') as string
  const message = (formData.get('message') as string ?? '').trim()
  if (!message) return { error: 'Pesan tidak boleh kosong.' }

  await sendOrderMessage({ id: generateId(12), orderId, sender: 'admin', senderName: admin.username, message })
  revalidatePath('/admin/orders')
  return {}
}

export async function getOrderMessagesAction(orderId: string): Promise<OrderMessage[]> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return []
  return getOrderMessages(orderId)
}

export async function markOrderMessagesReadAction(orderId: string): Promise<void> {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  if (!email) return
  const orders = await getOrdersByEmail(email)
  if (!orders.find(o => o.id === orderId)) return
  await markMessagesRead(orderId, 'admin')
  revalidatePath('/orders')
}

export async function adminMarkOrderMessagesReadAction(orderId: string): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  await markMessagesRead(orderId, 'customer')
}

export async function resellerSendOrderMessageAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const jar = await cookies()
  const resellerId = jar.get('reseller-token')?.value
  if (!resellerId) return { error: 'Sesi habis, silakan login ulang.' }
  const reseller = await getResellerById(resellerId)
  if (!reseller) return { error: 'Reseller tidak ditemukan.' }

  const orderId = formData.get('orderId') as string
  const message = (formData.get('message') as string ?? '').trim()
  if (!message) return { error: 'Pesan tidak boleh kosong.' }

  const orders = await getResellerOrders(resellerId)
  if (!orders.find(o => o.id === orderId)) return { error: 'Pesanan tidak ditemukan.' }

  await sendOrderMessage({ id: generateId(12), orderId, sender: 'customer', senderName: reseller.name, message })
  revalidatePath('/reseller/dashboard/orders')
  return {}
}

export async function resellerGetOrderMessagesAction(orderId: string): Promise<OrderMessage[]> {
  const jar = await cookies()
  if (!jar.get('reseller-token')) return []
  return getOrderMessages(orderId)
}

export async function resellerMarkOrderMessagesReadAction(orderId: string): Promise<void> {
  const jar = await cookies()
  if (!jar.get('reseller-token')) return
  await markMessagesRead(orderId, 'admin')
  revalidatePath('/reseller/dashboard/orders')
}

// ── RajaOngkir ───────────────────────────────────────────────────

export async function getShippingCostAction(destCityId: string): Promise<ShippingOption[]> {
  return fetchShippingCost(destCityId)
}

export async function getShippingCostByNameAction(regencyName: string): Promise<ShippingOption[]> {
  return fetchShippingCostByName(regencyName)
}

// ── Wilayah Indonesia (emsifa) ────────────────────────────────────

const EMSIFA = 'http://www.emsifa.com/api-wilayah-indonesia/api'
type WItem = { id: string; name: string }

async function fetchEmsifa(path: string): Promise<WItem[]> {
  try {
    const res = await fetch(`${EMSIFA}/${path}`, { cache: 'force-cache' })
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

export async function getProvincesAction():                     Promise<WItem[]> { return fetchEmsifa('provinces.json') }
export async function getRegenciesAction(provinceId: string):  Promise<WItem[]> { return fetchEmsifa(`regencies/${provinceId}.json`) }
export async function getDistrictsAction(regencyId: string):   Promise<WItem[]> { return fetchEmsifa(`districts/${regencyId}.json`) }
export async function getVillagesAction(districtId: string):   Promise<WItem[]> { return fetchEmsifa(`villages/${districtId}.json`) }

// ── Custom Products CMS ───────────────────────────────────────

export async function updateCustomProductImageAction(
  id: string,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return { error: 'Unauthorized' }

  const imageFile = formData.get('image') as File | null
  if (!imageFile || imageFile.size === 0) return { error: 'File tidak ditemukan' }

  const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `custom-products/${id}/bg.${ext}`
  const { error } = await db.storage
    .from('images')
    .upload(storagePath, Buffer.from(await imageFile.arrayBuffer()), {
      upsert: true,
      contentType: imageFile.type || `image/${ext}`,
    })
  if (error) return { error: error.message }
  const { data: { publicUrl } } = db.storage.from('images').getPublicUrl(storagePath)

  const { data: existing } = await db.from('content').select('value').eq('key', 'custom_product_images').maybeSingle()
  const images = (existing?.value ?? {}) as Record<string, string>
  images[id] = publicUrl
  await db.from('content').upsert({ key: 'custom_product_images', value: images })

  revalidateTag('custom-product-images', {})
  revalidatePath('/custom')
  return { url: publicUrl }
}


export async function updateProductConfigAction(
  _prev: Record<string, unknown>,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  try {
    const { upsertProductConfig } = await import('./product-config')
    const productType = formData.get('product_type') as string
    const entries = Array.from(formData.entries()).filter(([k]) => k !== 'product_type')
    await Promise.all(
      entries.map(([key, val]) => upsertProductConfig(productType, key, parseInt(val as string) || 0))
    )
    revalidatePath(`/custom/${productType}`)
    revalidatePath(`/admin/custom-products/${productType}`)
    return { ok: true }
  } catch (e) {
    return { error: String(e) }
  }
}
