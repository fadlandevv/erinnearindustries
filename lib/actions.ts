'use server'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getProducts, saveProducts, getServices, saveServices, getGallery, saveGallery, getShowcase, saveShowcase, saveContent, type ContentData } from './data'

async function saveImage(file: File, productId: string, slot: string): Promise<string> {
  const dir = path.join(process.cwd(), 'public', 'products', productId)
  fs.mkdirSync(dir, { recursive: true })
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${slot}.${ext}`
  fs.writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))
  return `/products/${productId}/${filename}`
}
import { saveOrder, getOrdersByEmail, deleteOrder, updateOrderStatus, type OrderItem, type Order } from './orders'
import { createSnapToken } from './midtrans'
import { getUserByEmail, getUserById, saveUser, updateUser, deleteUser, hashPassword, verifyPassword } from './users'
import {
  getAdminByUsername, getAdminById, saveAdmin, deleteAdmin as _deleteAdmin,
  getRoles, getRoleById, saveRole, deleteRole as _deleteRole,
  hashAdminPassword, verifyAdminPassword, type Permission,
} from './rbac'
import { saveManualEntry, deleteManualEntry, type RekapSource } from './rekap'
import { generateId } from './utils'

export async function login(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const username = (formData.get('username') as string).trim()
  const password = formData.get('password') as string
  const admin = getAdminByUsername(username)
  if (!admin || !verifyAdminPassword(password, admin.passwordHash)) {
    return { error: 'Username atau password salah.' }
  }
  const jar = await cookies()
  jar.set('admin-token', admin.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })
  redirect('/admin')
}

export async function logout() {
  const jar = await cookies()
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

  const products = getProducts()
  products.push({
    id,
    tag: formData.get('tag') as string,
    title: formData.get('title') as string,
    price: formData.get('price') as string,
    bg: colors[0] ?? '#f0ede8',
    colors: colors.length > 0 ? colors : undefined,
    description: formData.get('description') as string,
    material: (formData.get('material') as string).split('\n').map((s) => s.trim()).filter(Boolean),
    sizes: formData.getAll('sizes') as string[],
    ...(image ? { image } : {}),
    ...(images.some(Boolean) ? { images } : {}),
    updatedAt: new Date().toISOString(),
  })
  saveProducts(products)
  revalidatePath('/product')
  redirect('/admin/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const existing = getProducts().find((p) => p.id === id)

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

  const products = getProducts().map((p) =>
    p.id === id
      ? {
          ...p,
          tag: formData.get('tag') as string,
          title: formData.get('title') as string,
          price: formData.get('price') as string,
          bg: colors[0] ?? p.bg,
          colors: colors.length > 0 ? colors : p.colors,
          description: formData.get('description') as string,
          material: (formData.get('material') as string).split('\n').map((s) => s.trim()).filter(Boolean),
          sizes: formData.getAll('sizes') as string[],
          image,
          images,
          updatedAt: new Date().toISOString(),
        }
      : p
  )
  saveProducts(products)
  revalidatePath('/product')
  revalidatePath(`/product/${id}`)
  redirect('/admin/products')
}

export async function duplicateProduct(id: string) {
  const products = getProducts()
  const source = products.find((p) => p.id === id)
  if (!source) return
  const newId = Date.now().toString()
  products.push({
    ...source,
    id: newId,
    title: `${source.title} (Copy)`,
    image: undefined,
    images: undefined,
  })
  saveProducts(products)
  revalidatePath('/product')
  redirect(`/admin/products/${newId}/edit`)
}

export async function deleteProduct(id: string) {
  saveProducts(getProducts().filter((p) => p.id !== id))
  revalidatePath('/product')
  redirect('/admin/products')
}

export async function createService(formData: FormData) {
  const services = getServices()
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
  saveServices(services)
  revalidatePath('/service')
  redirect('/admin/services')
}

export async function updateService(id: string, formData: FormData) {
  const tag = (formData.get('tag') as string).trim()
  const featuresRaw = (formData.get('features') as string).trim()
  const features = featuresRaw ? featuresRaw.split('\n').map((l) => l.trim()).filter(Boolean) : undefined
  const services = getServices().map((s) =>
    s.id === id
      ? {
          ...s,
          icon: formData.get('icon') as string,
          title: formData.get('title') as string,
          desc: formData.get('desc') as string,
          tag: tag || null,
          longDesc: (formData.get('longDesc') as string).trim() || undefined,
          features: features?.length ? features : undefined,
        }
      : s
  )
  saveServices(services)
  revalidatePath('/service')
  revalidatePath(`/service/${id}`)
  redirect('/admin/services')
}

export async function updateShowcaseItem(
  itemId: string,
  formData: FormData
): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return

  const showcase = getShowcase()
  const item = showcase.find((s) => s.id === itemId)
  if (!item) return

  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    const dir = path.join(process.cwd(), 'public', 'showcase')
    fs.mkdirSync(dir, { recursive: true })
    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `item-${itemId}.${ext}`
    fs.writeFileSync(path.join(dir, filename), Buffer.from(await imageFile.arrayBuffer()))
    item.image = `/showcase/${filename}`
  }

  item.title = (formData.get('title') as string).trim() || item.title
  item.desc = (formData.get('desc') as string).trim() || item.desc
  item.buttonText = (formData.get('buttonText') as string).trim() || item.buttonText
  item.buttonHref = (formData.get('buttonHref') as string).trim() || item.buttonHref

  saveShowcase(showcase.map((s) => (s.id === itemId ? item : s)))
  revalidatePath('/')
}

export async function updateGallerySlot(
  slotId: string,
  formData: FormData
): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return

  const gallery = getGallery()
  const slot = gallery.find((g) => g.id === slotId)
  if (!slot) return

  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    const dir = path.join(process.cwd(), 'public', 'gallery')
    fs.mkdirSync(dir, { recursive: true })
    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `slot-${slotId}.${ext}`
    fs.writeFileSync(path.join(dir, filename), Buffer.from(await imageFile.arrayBuffer()))
    slot.image = `/gallery/${filename}`
  }

  const label = (formData.get('label') as string).trim()
  const sublabel = (formData.get('sublabel') as string).trim()
  if (label) slot.label = label
  if (sublabel) slot.sublabel = sublabel

  saveGallery(gallery.map((g) => (g.id === slotId ? slot : g)))
  revalidatePath('/')
}

export async function deleteService(id: string) {
  saveServices(getServices().filter((s) => s.id !== id))
  revalidatePath('/service')
  redirect('/admin/services')
}

function parsePrice(str: string): number {
  return parseInt(str.replace(/[^\d]/g, '')) || 0
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
    }>

    if (!rawItems.length) return { error: 'Keranjang kosong' }

    const items: OrderItem[] = rawItems.map((i) => ({
      productId: i.product.id,
      title: i.product.title,
      price: i.product.price,
      unitPrice: parsePrice(i.product.price),
      size: i.size,
      quantity: i.quantity,
      bg: i.product.bg,
    }))

    const totalPrice = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const orderId = generateId(6)

    const customer = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      postalCode: formData.get('postalCode') as string,
      notes: (formData.get('notes') as string) || '',
    }

    const snapToken = await createSnapToken(orderId, totalPrice, customer, items)

    saveOrder({
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      customer,
      items,
      totalPrice,
      snapToken,
    })

    return { orderId, snapToken }
  } catch (e) {
    console.error(e)
    return { error: 'Gagal memproses pesanan. Coba lagi.' }
  }
}

export async function lookupOrders(
  formData: FormData
): Promise<Order[]> {
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
  if (getUserByEmail(email)) return { error: 'Email sudah terdaftar.' }

  saveUser({
    id: generateId(8),
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  })

  const jar = await cookies()
  jar.set('user-session', email, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })
  redirect('/orders')
}

export async function loginUser(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const email    = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string

  const user = getUserByEmail(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: 'Email atau password salah.' }
  }

  const jar = await cookies()
  jar.set('user-session', email, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

  const callbackUrl = formData.get('callbackUrl') as string
  redirect(callbackUrl || '/orders')
}

export async function logoutUser() {
  const jar = await cookies()
  jar.delete('user-session')
  redirect('/login')
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<void> {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  updateOrderStatus(orderId, status)
  revalidatePath('/admin/orders')
}

export async function updateOrderStatusFormAction(formData: FormData) {
  const jar = await cookies()
  if (!jar.get('admin-token')) return
  const orderId = formData.get('orderId') as string
  const status = formData.get('status') as Order['status']
  updateOrderStatus(orderId, status)
  revalidatePath('/admin/orders')
}

export async function renewSnapToken(
  orderId: string
): Promise<{ snapToken: string } | { error: string }> {
  try {
    const jar = await cookies()
    const email = jar.get('user-session')?.value
    if (!email) return { error: 'Tidak terautentikasi.' }

    const order = getOrdersByEmail(email).find((o) => o.id === orderId)
    if (!order) return { error: 'Pesanan tidak ditemukan.' }
    if (order.status !== 'pending') return { error: 'Pesanan ini sudah diproses.' }

    // Use a new Midtrans order ID to avoid "duplicate order" rejection
    const retryMidtransId = `${orderId}-r${Date.now()}`
    const snapToken = await createSnapToken(retryMidtransId, order.totalPrice, order.customer, order.items)

    // Persist the fresh token so future retries also get a valid token
    saveOrder({ ...order, snapToken })

    return { snapToken }
  } catch (e) {
    console.error(e)
    return { error: 'Gagal memperbarui token pembayaran.' }
  }
}

export async function deleteUserOrder(
  orderId: string
): Promise<{ error?: string }> {
  const jar = await cookies()
  const email = jar.get('user-session')?.value
  if (!email) return { error: 'Tidak terautentikasi.' }

  const orders = getOrdersByEmail(email)
  if (!orders.find((o) => o.id === orderId)) return { error: 'Pesanan tidak ditemukan.' }

  deleteOrder(orderId)
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

  const user = getUserByEmail(email)
  if (!user) return { error: 'Akun tidak ditemukan.' }

  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Nama tidak boleh kosong.' }

  updateUser({ ...user, name })
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

  const user = getUserByEmail(email)
  if (!user) return { error: 'Akun tidak ditemukan.' }

  const oldPassword = formData.get('oldPassword') as string
  const newPassword = formData.get('newPassword') as string

  if (!verifyPassword(oldPassword, user.passwordHash)) {
    return { error: 'Password lama tidak sesuai.' }
  }
  if (newPassword.length < 6) {
    return { error: 'Password baru minimal 6 karakter.' }
  }

  updateUser({ ...user, passwordHash: hashPassword(newPassword) })
  return { success: true }
}

export async function saveContentAction(
  _prev: unknown,
  formData: FormData
): Promise<{ ok: boolean }> {
  const raw = formData.get('content') as string
  const data = JSON.parse(raw) as ContentData
  saveContent(data)
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function deleteMemberAction(id: string) {
  deleteUser(id)
  revalidatePath('/admin/members')
}

// ── Role actions ──────────────────────────────────────────────
export async function createRoleAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Nama role wajib diisi.' }
  const permissions = formData.getAll('permissions') as Permission[]
  const id = Date.now().toString()
  saveRole({ id, name, permissions, locked: false })
  revalidatePath('/admin/roles')
  return {}
}

export async function updateRoleAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const id = formData.get('id') as string
  const role = getRoleById(id)
  if (!role) return { error: 'Role tidak ditemukan.' }
  if (role.locked) return { error: 'Role ini tidak bisa diedit.' }
  const name = (formData.get('name') as string).trim()
  const permissions = formData.getAll('permissions') as Permission[]
  saveRole({ ...role, name, permissions })
  revalidatePath('/admin/roles')
  return {}
}

export async function deleteRoleAction(id: string) {
  const role = getRoleById(id)
  if (role?.locked) return
  _deleteRole(id)
  revalidatePath('/admin/roles')
}

// ── Admin account actions ─────────────────────────────────────
export async function createAdminAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const username = (formData.get('username') as string).trim()
  const password = (formData.get('password') as string).trim()
  const roleId = formData.get('roleId') as string
  if (!username || !password) return { error: 'Username dan password wajib diisi.' }
  if (password.length < 6) return { error: 'Password minimal 6 karakter.' }
  const exists = getAdminByUsername(username)
  if (exists) return { error: 'Username sudah digunakan.' }
  saveAdmin({
    id: Date.now().toString(),
    username,
    passwordHash: hashAdminPassword(password),
    roleId,
    createdAt: new Date().toISOString(),
  })
  revalidatePath('/admin/roles')
  return {}
}

export async function deleteAdminAction(id: string) {
  if (id === 'default-superadmin') return
  _deleteAdmin(id)
  revalidatePath('/admin/roles')
}

// ── Rekap manual entry actions ────────────────────────────────
export async function addManualEntryAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const date = (formData.get('date') as string).trim()
  const source = (formData.get('source') as string).trim() as RekapSource
  const platform = (formData.get('platform') as string).trim()
  const amount = parseInt(formData.get('amount') as string, 10)
  const note = (formData.get('note') as string | null)?.trim() || undefined

  if (!date || !source || !platform || isNaN(amount) || amount <= 0) {
    return { error: 'Semua field wajib diisi dengan benar.' }
  }
  if (!['marketplace', 'offline'].includes(source)) {
    return { error: 'Sumber tidak valid.' }
  }

  const jar = await cookies()
  const adminId = jar.get('admin-token')?.value
  const admin = adminId ? getAdminById(adminId) : null

  saveManualEntry({
    id: Date.now().toString(),
    date,
    source,
    platform,
    amount,
    note,
    filledBy: admin?.username,
    createdAt: new Date().toISOString(),
  })
  revalidatePath('/admin/rekap')
  return {}
}

export async function deleteManualEntryAction(id: string) {
  deleteManualEntry(id)
  revalidatePath('/admin/rekap')
}
