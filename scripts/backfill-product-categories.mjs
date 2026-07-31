// Assign categories to products that have none, matched by keyword against the product title.
// Dry run:  node scripts/backfill-product-categories.mjs
// Apply:    node scripts/backfill-product-categories.mjs --apply
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
)

// Category value (must match content.id.productPage.categories) -> title keywords
const RULES = {
  Tshirt: ['tshirt', 't-shirt', 'kaos'],
  Jacket: ['jacket', 'jaket', 'coach'],
  Totebag: ['totebag', 'tote bag'],
  Caps: ['cap', 'topi'],
  Basic: ['basic', 'hoodie', 'crewneck'],
}

function categorize(title) {
  const t = title.toLowerCase()
  return Object.entries(RULES)
    .filter(([, keywords]) => keywords.some((k) => t.includes(k)))
    .map(([category]) => category)
}

const apply = process.argv.includes('--apply')

const { data: products, error } = await db.from('products').select('id,title,categories')
if (error) {
  console.error('Failed to read products:', error.message)
  process.exit(1)
}

const missing = products.filter((p) => !p.categories || p.categories.length === 0)
console.log(`${products.length} products, ${missing.length} without categories\n`)

let unmatched = 0
for (const p of missing) {
  const categories = categorize(p.title)
  if (categories.length === 0) {
    console.log(`SKIP  ${p.id} | ${p.title} | no keyword match — set it manually in admin`)
    unmatched++
    continue
  }
  if (!apply) {
    console.log(`DRY   ${p.id} | ${p.title} -> ${JSON.stringify(categories)}`)
    continue
  }
  const { error: updateError } = await db.from('products').update({ categories }).eq('id', p.id)
  console.log(
    updateError
      ? `ERROR ${p.id} | ${p.title} | ${updateError.message}`
      : `OK    ${p.id} | ${p.title} -> ${JSON.stringify(categories)}`
  )
}

if (!apply) console.log('\nDry run — re-run with --apply to write these changes.')
if (unmatched > 0) console.log(`\n${unmatched} product(s) need a category picked by hand.`)
