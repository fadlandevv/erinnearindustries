const API_KEY      = process.env.RAJAONGKIR_API_KEY        ?? ''
const ORIGIN_CITY  = process.env.RAJAONGKIR_ORIGIN_CITY_ID ?? ''
const BASE         = 'https://api.rajaongkir.com/starter'
const WEIGHT_GRAMS = 500

const COURIERS = ['jne', 'pos', 'tiki']

export type RajaCity = {
  city_id:   string
  city_name: string
  province:  string
  type:      string
}

export type ShippingOption = {
  id:          string
  courier:     string
  service:     string
  description: string
  price:       number
  etd:         string
}

function fetchTimeout(url: string, opts: RequestInit, ms = 5000): Promise<Response> {
  const ctrl  = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer))
}

export async function fetchCities(): Promise<RajaCity[]> {
  if (!API_KEY) return []
  try {
    const res = await fetchTimeout(`${BASE}/city`, {
      headers: { key: API_KEY },
      next: { revalidate: 86400 },
    })
    const json = await res.json()
    return (json.rajaongkir?.results ?? []) as RajaCity[]
  } catch (err) {
    console.error('[RajaOngkir] fetchCities error:', err)
    return []
  }
}

export async function fetchShippingCost(destCityId: string): Promise<ShippingOption[]> {
  if (!API_KEY || !ORIGIN_CITY) return []
  try {
    const allResults = await Promise.all(
      COURIERS.map(async (courier) => {
        const body = new URLSearchParams({
          origin:      ORIGIN_CITY,
          destination: destCityId,
          weight:      String(WEIGHT_GRAMS),
          courier,
        })
        const res = await fetchTimeout(`${BASE}/cost`, {
          method:  'POST',
          headers: { key: API_KEY, 'content-type': 'application/x-www-form-urlencoded' },
          body:    body.toString(),
        })
        const json = await res.json()
        const r = json.rajaongkir?.results?.[0]
        if (!r) return []

        return (r.costs as Array<{
          service:     string
          description: string
          cost:        { value: number; etd: string }[]
        }>).map(c => ({
          id:          `${courier}-${c.service}`.toLowerCase(),
          courier:     r.name as string,
          service:     c.service,
          description: c.description,
          price:       c.cost[0]?.value ?? 0,
          etd:         c.cost[0]?.etd   ? `${c.cost[0].etd} hari kerja` : '',
        }))
      })
    )
    return allResults.flat()
  } catch (err) {
    console.error('[RajaOngkir] fetchShippingCost error:', err)
    return []
  }
}

// Single server-side call: city list + name matching + cost fetch combined
export async function fetchShippingCostByName(regencyName: string): Promise<ShippingOption[]> {
  if (!API_KEY || !ORIGIN_CITY) {
    console.warn('[RajaOngkir] RAJAONGKIR_API_KEY or RAJAONGKIR_ORIGIN_CITY_ID not set')
    return []
  }
  try {
    const cities = await fetchCities()
    console.log(`[RajaOngkir] cities loaded: ${cities.length}, matching: "${regencyName}"`)
    if (cities.length === 0) return []

    const up     = regencyName.toUpperCase()
    const isKota = up.startsWith('KOTA ')
    const name   = up.replace(/^(KAB\.\s*|KOTA\s*|KABUPATEN\s*)/i, '').trim()
    const match  = cities.find(c => isKota
      ? c.type === 'Kota'      && c.city_name.toUpperCase() === name
      : c.type === 'Kabupaten' && c.city_name.toUpperCase() === name
    )

    if (!match) {
      console.warn(`[RajaOngkir] no match for "${regencyName}" (normalized: "${name}", isKota: ${isKota})`)
      return []
    }
    console.log(`[RajaOngkir] matched: ${match.city_name} id=${match.city_id}`)
    return await fetchShippingCost(match.city_id)
  } catch (err) {
    console.error('[RajaOngkir] fetchShippingCostByName error:', err)
    return []
  }
}
