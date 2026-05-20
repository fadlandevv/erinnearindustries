// Shared types and constants — safe to import in client components (no Node.js APIs)

export type Permission =
  | 'dashboard' | 'products' | 'services' | 'content'
  | 'showcase' | 'gallery' | 'orders' | 'rekap' | 'members' | 'roles'
  | 'pricing' | 'access_log' | 'warehouse' | 'reseller' | 'pembukuan'

export const ALL_PERMISSIONS: Permission[] = [
  'dashboard', 'products', 'services', 'content',
  'showcase', 'gallery', 'orders', 'rekap', 'members', 'roles',
  'pricing', 'access_log', 'warehouse', 'reseller', 'pembukuan',
]

export const PERMISSION_LABELS: Record<Permission, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  services: 'Services',
  content: 'Content',
  showcase: 'Showcase',
  gallery: 'Gallery',
  orders: 'Orders',
  rekap: 'Rekap',
  members: 'Account Member',
  roles: 'Role Access',
  pricing: 'Pricing Custom Order',
  access_log: 'Access Log',
  warehouse: 'Warehouse',
  reseller: 'Reseller',
  pembukuan: 'Pembukuan',
}

export type Role = {
  id: string
  name: string
  permissions: Permission[]
  locked?: boolean
}

export type AdminAccount = {
  id: string
  username: string
  passwordHash: string
  roleId: string
  createdAt: string
}
