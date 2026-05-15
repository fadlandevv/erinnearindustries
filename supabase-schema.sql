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
