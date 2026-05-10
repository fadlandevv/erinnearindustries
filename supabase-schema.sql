-- ─────────────────────────────────────────────
-- Erinnear Industries — Database Schema
-- Run this in Supabase SQL Editor
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
  image text,
  images text[],
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
