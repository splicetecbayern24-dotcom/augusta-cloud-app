create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  city text,
  address text,
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  customer_id uuid references customers(id) on delete restrict,
  project_name text,
  invoice_date date not null,
  due_date date,
  status text not null default 'offen',
  vat_rate numeric(5,2) not null default 19,
  net_amount numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  gross_amount numeric(12,2) not null default 0,
  recipient_email text,
  pdf_path text,
  created_at timestamptz default now()
);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  position_no int not null,
  description text not null,
  qty numeric(12,3) not null default 1,
  unit text not null default 'pauschal',
  unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0
);
