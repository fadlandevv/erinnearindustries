import { db } from './db'
import { getOrders } from './orders'

export type RekapSource = 'marketplace' | 'offline'

export type ManualEntry = {
  id: string
  date: string
  source: RekapSource
  platform: string
  amount: number
  note?: string
  filledBy?: string
  createdAt: string
}

export type PeriodRow = {
  key: string
  label: string
  subLabel?: string
  web: number
  marketplace: number
  offline: number
  total: number
  webOrders: number
}

const PAID_STATUSES = new Set(['paid', 'processing', 'shipped', 'delivered'])

export async function getManualEntries(): Promise<ManualEntry[]> {
  const { data } = await db.from('rekap_manual').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(row => ({
    id: row.id,
    date: row.date,
    source: row.source as RekapSource,
    platform: row.platform,
    amount: row.amount,
    note: row.note ?? undefined,
    filledBy: row.filled_by ?? undefined,
    createdAt: row.created_at,
  }))
}

export async function saveManualEntry(entry: ManualEntry): Promise<void> {
  await db.from('rekap_manual').upsert({
    id: entry.id,
    date: entry.date,
    source: entry.source,
    platform: entry.platform,
    amount: entry.amount,
    note: entry.note ?? null,
    filled_by: entry.filledBy ?? null,
    created_at: entry.createdAt,
  })
}

export async function deleteManualEntry(id: string): Promise<void> {
  await db.from('rekap_manual').delete().eq('id', id)
}

// ── Date helpers ────────────────────────────────────────────────────

function isoWeek(d: Date): { y: number; w: number } {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = dt.getUTCDay() || 7
  dt.setUTCDate(dt.getUTCDate() + 4 - day)
  const jan1 = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1))
  return { y: dt.getUTCFullYear(), w: Math.ceil(((dt.getTime() - jan1.getTime()) / 86400000 + 1) / 7) }
}

function weekStartDate(y: number, w: number): Date {
  const jan4 = new Date(Date.UTC(y, 0, 4))
  const day = jan4.getUTCDay() || 7
  return new Date(Date.UTC(y, 0, 4 - day + 1 + (w - 1) * 7))
}

const IDX = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function fmtDate(d: Date) {
  return `${d.getUTCDate()} ${IDX[d.getUTCMonth()]}`
}

// ── Compute all three periods ─────────────────────────────────────

export async function computeRekap() {
  const orders = (await getOrders()).filter(o => PAID_STATUSES.has(o.status))
  const manual = await getManualEntries()
  const now = new Date()

  function emptyRow(key: string, label: string, subLabel?: string): PeriodRow {
    return { key, label, subLabel, web: 0, marketplace: 0, offline: 0, total: 0, webOrders: 0 }
  }

  // ── Weekly: last 12 weeks ──────────────────────────────────────
  const weekMap = new Map<string, PeriodRow>()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i * 7)
    const { y, w } = isoWeek(d)
    const key = `${y}-W${String(w).padStart(2, '0')}`
    if (!weekMap.has(key)) {
      const start = weekStartDate(y, w)
      const end = new Date(start); end.setUTCDate(start.getUTCDate() + 6)
      weekMap.set(key, emptyRow(key, `W${w} ${y}`, `${fmtDate(start)} – ${fmtDate(end)} ${end.getUTCFullYear()}`))
    }
  }

  for (const o of orders) {
    const { y, w } = isoWeek(new Date(o.createdAt))
    const key = `${y}-W${String(w).padStart(2, '0')}`
    const row = weekMap.get(key)
    if (row) { row.web += o.totalPrice; row.total += o.totalPrice; row.webOrders++ }
  }

  for (const e of manual) {
    const { y, w } = isoWeek(new Date(e.date))
    const key = `${y}-W${String(w).padStart(2, '0')}`
    const row = weekMap.get(key)
    if (row) { row[e.source] += e.amount; row.total += e.amount }
  }

  // ── Monthly: last 12 months ───────────────────────────────────
  const monthMap = new Map<string, PeriodRow>()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, emptyRow(key, `${IDX[d.getMonth()]} ${d.getFullYear()}`))
  }

  for (const o of orders) {
    const d = new Date(o.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '00')}`
    const row = monthMap.get(key)
    if (row) { row.web += o.totalPrice; row.total += o.totalPrice; row.webOrders++ }
  }

  for (const e of manual) {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '00')}`
    const row = monthMap.get(key)
    if (row) { row[e.source] += e.amount; row.total += e.amount }
  }

  // ── Yearly ────────────────────────────────────────────────────
  const allYears = new Set<number>([now.getFullYear()])
  orders.forEach(o => allYears.add(new Date(o.createdAt).getFullYear()))
  manual.forEach(e => allYears.add(new Date(e.date).getFullYear()))

  const yearMap = new Map<string, PeriodRow>()
  ;[...allYears].sort().forEach(y => yearMap.set(String(y), emptyRow(String(y), String(y))))

  for (const o of orders) {
    const key = String(new Date(o.createdAt).getFullYear())
    const row = yearMap.get(key)
    if (row) { row.web += o.totalPrice; row.total += o.totalPrice; row.webOrders++ }
  }

  for (const e of manual) {
    const key = String(new Date(e.date).getFullYear())
    const row = yearMap.get(key)
    if (row) { row[e.source] += e.amount; row.total += e.amount }
  }

  return {
    mingguan: [...weekMap.values()],
    bulanan: [...monthMap.values()],
    tahunan: [...yearMap.values()],
  }
}
