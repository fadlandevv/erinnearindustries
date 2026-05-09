import { randomBytes } from 'crypto'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateId(length: number): string {
  const bytes = randomBytes(length)
  return Array.from(bytes, b => CHARS[b % CHARS.length]).join('')
}
