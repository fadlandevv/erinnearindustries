// Run: node scripts/seed.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config({ path: '.env.local' })

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
)

function read(file) {
  return JSON.parse(readFileSync(join(root, 'data', file), 'utf-8'))
}

async function seed() {
  console.log('🌱 Seeding database...')

  // Users
  const users = read('users.json')
  for (const u of users) {
    await db.from('users').upsert({ id: u.id, name: u.name, email: u.email, password_hash: u.passwordHash, created_at: u.createdAt })
  }
  console.log(`✓ users (${users.length})`)

  // Admins
  const admins = read('admins.json')
  for (const a of admins) {
    await db.from('admins').upsert({ id: a.id, username: a.username, password_hash: a.passwordHash, role_id: a.roleId, created_at: a.createdAt })
  }
  console.log(`✓ admins (${admins.length})`)

  // Roles
  const roles = read('roles.json')
  for (const r of roles) {
    await db.from('roles').upsert({ id: r.id, name: r.name, permissions: r.permissions, locked: r.locked ?? false })
  }
  console.log(`✓ roles (${roles.length})`)

  // Orders
  const orders = read('orders.json')
  for (const o of orders) {
    await db.from('orders').upsert({ id: o.id, created_at: o.createdAt, status: o.status, customer: o.customer, items: o.items, total_price: o.totalPrice, snap_token: o.snapToken ?? '' })
  }
  console.log(`✓ orders (${orders.length})`)

  // Products
  const products = read('products.json')
  for (const p of products) {
    await db.from('products').upsert({
      id: p.id, tag: p.tag, title: p.title, price: p.price, bg: p.bg,
      colors: p.colors ?? null, description: p.description,
      material: Array.isArray(p.material) ? p.material : [p.material],
      sizes: p.sizes, image: p.image ?? null, images: p.images ?? null,
    })
  }
  console.log(`✓ products (${products.length})`)

  // Services
  const services = read('services.json')
  for (const s of services) {
    await db.from('services').upsert({ id: s.id, icon: s.icon, title: s.title, description: s.desc, tag: s.tag ?? null, long_desc: s.longDesc ?? null, features: s.features ?? null })
  }
  console.log(`✓ services (${services.length})`)

  // Rekap manual
  const rekap = read('rekap-manual.json')
  for (const e of rekap) {
    await db.from('rekap_manual').upsert({ id: e.id, date: e.date, source: e.source, platform: e.platform, amount: e.amount, note: e.note ?? null, filled_by: e.filledBy ?? null, created_at: e.createdAt })
  }
  console.log(`✓ rekap_manual (${rekap.length})`)

  // Gallery
  const gallery = read('gallery.json')
  for (let i = 0; i < gallery.length; i++) {
    const g = gallery[i]
    await db.from('gallery').upsert({ id: g.id, image: g.image, label: g.label, sublabel: g.sublabel, sort_order: i })
  }
  console.log(`✓ gallery (${gallery.length})`)

  // Showcase
  const showcase = read('showcase.json')
  for (let i = 0; i < showcase.length; i++) {
    const s = showcase[i]
    await db.from('showcase').upsert({ id: s.id, image: s.image, title: s.title, description: s.desc, button_text: s.buttonText, button_href: s.buttonHref, sort_order: i })
  }
  console.log(`✓ showcase (${showcase.length})`)

  // Content
  const content = read('content.json')
  await db.from('content').upsert({ key: 'id', value: content.id })
  await db.from('content').upsert({ key: 'en', value: content.en })
  console.log('✓ content')

  console.log('\n✅ Seed selesai!')
}

seed().catch(console.error)
