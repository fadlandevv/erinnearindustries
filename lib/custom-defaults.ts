export type ColorOption = { label: string; value: string }
export type PriceOption = { label: string; price: number }

export const DEFAULT_COLORS: ColorOption[] = [
  { label: 'Putih',  value: '#FFFFFF' },
  { label: 'Krem',   value: '#f5f0e8' },
  { label: 'Abu',    value: '#d1d5db' },
  { label: 'Hitam',  value: '#1a1a1a' },
  { label: 'Navy',   value: '#1e3a5f' },
  { label: 'Olive',  value: '#6b7c3d' },
]

export const DEFAULT_SIZES: Record<string, string[]> = {
  tshirt:         ['S', 'M', 'L', 'XL', 'XXL'],
  'coach-jacket': ['S', 'M', 'L', 'XL', 'XXL'],
  hoodie:         ['S', 'M', 'L', 'XL', 'XXL'],
  jersey:         ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
}

export const DEFAULT_BAHANS: Record<string, PriceOption[]> = {
  tshirt:         [
    { label: 'Cotton Combed',    price: 65000 },
    { label: 'Cotton Bamboo',    price: 65000 },
    { label: 'Drifit Polyester', price: 50000 },
    { label: 'Fleece',           price: 80000 },
    { label: 'Linen',            price: 70000 },
  ],
  'coach-jacket': [
    { label: 'Taslan',    price: 0 },
    { label: 'Parasut',   price: 0 },
    { label: 'Polyester', price: 0 },
    { label: 'Nylon',     price: 0 },
  ],
  hoodie: [
    { label: 'Fleece',        price: 0 },
    { label: 'Baby Terry',    price: 0 },
    { label: 'French Terry',  price: 0 },
    { label: 'Cotton Fleece', price: 0 },
  ],
  jersey: [
    { label: 'Drifit',          price: 0 },
    { label: 'Polyester',       price: 0 },
    { label: 'Micro Polyester', price: 0 },
    { label: 'Hyget',           price: 0 },
  ],
  totebag: [
    { label: 'Canvas',   price: 0 },
    { label: 'Spunbond', price: 0 },
    { label: 'Drill',    price: 0 },
  ],
}
