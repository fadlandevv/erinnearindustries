import fs from 'fs'
import path from 'path'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

export type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

const FILE = path.join(process.cwd(), 'data', 'users.json')

export function getUsers(): User[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'))
  } catch {
    return []
  }
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function saveUser(user: User) {
  const users = getUsers()
  users.push(user)
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2))
}

export function updateUser(updated: User) {
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u))
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2))
}

export function deleteUser(id: string) {
  const users = getUsers().filter((u) => u.id !== id)
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2))
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64)
  return `${salt}:${derived.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const hashBuffer = Buffer.from(hash, 'hex')
  const derived = scryptSync(password, salt, 64)
  return timingSafeEqual(hashBuffer, derived)
}
