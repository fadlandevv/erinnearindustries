-- ─────────────────────────────────────────────
-- Erinnear Industries — Database Schema
-- Run this once in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / IF NOT EXISTS)
-- ─────────────────────────────────────────────

create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists admins (
  id text primary key,
  username text unique not null,
  password_hash text not null,
  role_id text not null,
  created_at timestamptz default now()
);

create table if not exists roles (
  id text primary key,
  name text not null,
  permissions text[] default '{}',
  locked boolean default false
);

create table if not exists orders (
  id text primary key,
  created_at timestamptz default now(),
  status text not null default 'pending',
  customer jsonb not null,
  items jsonb not null,
  total_price integer not null,
  snap_token text default ''
);

create table if not exists products (
  id text primary key,
  tag text,
  title text not null,
  price text not null,
  bg text default '#f0ede8',
  colors text[],
  description text,
  material text[],
  sizes text[],
  sizechart text,
  image text,
  images text[],
  price_usd numeric,
  updated_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists services (
  id text primary key,
  icon text,
  title text not null,
  description text,
  tag text,
  long_desc text,
  features text[],
  created_at timestamptz default now()
);

create table if not exists rekap_manual (
  id text primary key,
  date date not null,
  source text not null,
  platform text not null,
  amount integer not null,
  note text,
  filled_by text,
  created_at timestamptz default now()
);

create table if not exists gallery (
  id text primary key,
  image text,
  label text,
  sublabel text,
  sort_order integer default 0
);

create table if not exists showcase (
  id text primary key,
  image text,
  title text,
  description text,
  button_text text,
  button_href text,
  sort_order integer default 0
);

create table if not exists content (
  key text primary key,
  value jsonb not null
);

create table if not exists custom_pricing (
  id text primary key,
  type text not null check (type in ('bahan', 'sablon')),
  label text not null,
  price integer not null default 0,
  updated_at timestamptz default now()
);

create table if not exists custom_product_options (
  id uuid primary key default gen_random_uuid(),
  product_type text not null,
  category text not null check (category in ('color','bahan','size')),
  label text not null,
  value text not null default '',
  price integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);
create index if not exists custom_product_options_idx
  on custom_product_options(product_type, category, sort_order);

create table if not exists admin_access_log (
  id text primary key,
  admin_id text not null default '',
  username text not null,
  action text not null check (action in ('login', 'logout', 'login_failed')),
  ip text not null default 'unknown',
  created_at timestamptz default now()
);

create index if not exists admin_access_log_created_at_idx on admin_access_log (created_at desc);

create table if not exists password_reset_tokens (
  token text primary key,
  user_email text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

create table if not exists warehouse_stock (
  id uuid default gen_random_uuid() primary key,
  product_id text not null,
  size text not null,
  quantity integer not null default 0,
  harga integer,
  hpp integer,
  updated_at timestamptz default now(),
  unique(product_id, size)
);

create table if not exists warehouse_log (
  id uuid default gen_random_uuid() primary key,
  product_id text not null,
  product_title text not null,
  size text not null,
  quantity_change integer not null,
  quantity_after integer not null,
  type text not null check (type in ('restock', 'keluar', 'koreksi')),
  note text,
  admin_username text not null,
  created_at timestamptz default now()
);

create index if not exists warehouse_stock_product_idx on warehouse_stock (product_id);
create index if not exists warehouse_log_created_at_idx on warehouse_log (created_at desc);

-- ── Reseller tables ──────────────────────────────────────────

create table if not exists resellers (
  id text primary key,
  username text unique not null,
  password_hash text not null,
  name text not null,
  phone text default '',
  level text not null default 'bronze',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists reseller_orders (
  id text primary key,
  reseller_id text not null,
  reseller_username text not null,
  customer_name text not null,
  customer_phone text default '',
  customer_address text default '',
  items jsonb not null default '[]',
  total_price integer not null default 0,
  commission integer not null default 0,
  status text not null default 'pending',
  note text default '',
  created_at timestamptz default now()
);

create index if not exists reseller_orders_reseller_idx on reseller_orders (reseller_id);
create index if not exists reseller_orders_created_at_idx on reseller_orders (created_at desc);

-- ── Add price_reseller to products ───────────────────────────

alter table products add column if not exists price_reseller integer;

-- ── Order discussion messages ─────────────────────────────────

create table if not exists order_messages (
  id text primary key,
  order_id text not null references orders(id) on delete cascade,
  sender text not null check (sender in ('customer', 'admin')),
  sender_name text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table order_messages add column if not exists is_read boolean default false;

create index if not exists order_messages_order_idx on order_messages (order_id, created_at);

-- ── Pembukuan (bookkeeping) ───────────────────────────────────

create table if not exists pembukuan (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text not null check (type in ('pemasukan', 'pengeluaran')),
  category text not null,
  description text,
  amount bigint not null,
  note text,
  filled_by text,
  created_at timestamptz not null default now()
);

create index if not exists pembukuan_date_idx on pembukuan (date);

-- ── Custom Products (kartu pilih produk di /custom) ──────────

create table if not exists custom_products (
  id text primary key,
  name text not null,
  sub text not null default '',
  desc_short text not null default '',
  href text not null,
  bg text not null default '#1a1209',
  image text,
  icon_svg text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Seed data (6 produk awal dari kode lama)
insert into custom_products (id, name, sub, desc_short, href, bg, icon_svg, sort_order) values
  ('tshirt',          'Kaos',   'T-Shirt',    'Sablon bebas depan & belakang', '/custom/tshirt',          '#f5ede0', '<path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>',            0),
  ('totebag',         'Totebag','Kanvas',      'Sablon satu atau dua sisi',     '/custom/totebag',         '#e4ede6', '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',                                                                           1),
  ('amplop-packaging','Amplop', 'Packaging',  'Packaging berlogo produkmu',     '/custom/amplop-packaging','#e0eaf5', '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',                                                                          2),
  ('coach-jacket',    'Coach',  'Jacket',      'Jaket tipis sablon & bordir',   '/custom/coach-jacket',    '#ede8f5', '<path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/><line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="3 2"/>', 3),
  ('hoodie',          'Hoodie', 'Fleece',      'Custom depan belakang lengan',  '/custom/hoodie',          '#f5e6e9', '<path d="M20.38 3.46L16 2c0 2.21-1.79 4-4 4S8 4.21 8 2L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/><path d="M9 22v-3a3 3 0 016 0v3" stroke-dasharray="2 1.5"/>', 4),
  ('jersey',          'Jersey', 'Sublimasi',   'Full-print sesuai desainmu',    '/custom/jersey',          '#e8f0e4', '<path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/><line x1="6" y1="10" x2="6" y2="20"/><line x1="18" y1="10" x2="18" y2="20"/>', 5)
on conflict (id) do nothing;
