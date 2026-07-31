/*
  Ongkir cadangan.

  Dipakai ketika RajaOngkir tidak mengembalikan pilihan (API key kosong, API
  down, atau nama kota tidak cocok). Konstanta ini di-import client (untuk
  menampilkan pilihan) DAN server (untuk memvalidasi harga saat checkout),
  jadi keduanya selalu memakai angka yang sama. Jangan duplikasi nilainya.
*/

export type FallbackCourier = {
  id: string
  name: string
  service: string
  etd: string
  price: number
}

export const FALLBACK_COURIERS: FallbackCourier[] = [
  { id: 'jne-reg',  name: 'JNE',           service: 'REG',          etd: '2–3 hari kerja', price: 15000 },
  { id: 'jnt-ez',   name: 'J&T Express',   service: 'Express',      etd: '1–2 hari kerja', price: 14000 },
  { id: 'sicepat',  name: 'SiCepat',       service: 'REG',          etd: '2–3 hari kerja', price: 13000 },
  { id: 'anteraja', name: 'AnterAja',      service: 'Reguler',      etd: '3–5 hari kerja', price: 10000 },
  { id: 'pos',      name: 'Pos Indonesia', service: 'Kilat Khusus', etd: '3–5 hari kerja', price:  9000 },
]
