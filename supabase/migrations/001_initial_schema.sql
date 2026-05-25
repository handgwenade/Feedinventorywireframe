

-- StockLog initial schema
-- Schema only. No seed data.

create extension if not exists pgcrypto;

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Organizations / workspace ownership
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

-- User profiles extend Supabase Auth users.
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  display_name text not null,
  role text not null default 'operator',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_role_check check (role in ('admin', 'manager', 'operator', 'viewer'))
);

create index user_profiles_organization_id_idx on public.user_profiles(organization_id);

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

-- Product categories
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_categories_unique_slug_per_org unique (organization_id, slug)
);

create index product_categories_organization_id_idx on public.product_categories(organization_id);

create trigger set_product_categories_updated_at
before update on public.product_categories
for each row execute function public.set_updated_at();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  sku text,
  unit_label text not null default 'units',
  current_quantity numeric not null default 0,
  minimum_quantity numeric not null default 0,
  sale_price numeric not null default 0,
  cost_per_unit numeric,
  vendor text,
  source_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_current_quantity_nonnegative check (current_quantity >= 0),
  constraint products_minimum_quantity_nonnegative check (minimum_quantity >= 0),
  constraint products_sale_price_nonnegative check (sale_price >= 0),
  constraint products_cost_per_unit_nonnegative check (cost_per_unit is null or cost_per_unit >= 0)
);

create index products_organization_id_idx on public.products(organization_id);
create index products_category_id_idx on public.products(category_id);
create index products_active_idx on public.products(is_active);

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Accounts: outside customers and K2.
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  account_type text not null,
  name text not null,
  phone text,
  email text,
  billing_address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_account_type_check check (account_type in ('customer', 'k2'))
);

create index accounts_organization_id_idx on public.accounts(organization_id);
create index accounts_account_type_idx on public.accounts(account_type);
create index accounts_active_idx on public.accounts(is_active);

create trigger set_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

-- Controlled family/person records.
create table public.people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  official_display_name text not null,
  phone text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index people_organization_id_idx on public.people(organization_id);
create index people_active_idx on public.people(is_active);

create trigger set_people_updated_at
before update on public.people
for each row execute function public.set_updated_at();

-- Invoice records: customer invoices, K2 statements, family use records.
create table public.invoice_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  display_number text not null,
  record_type text not null,
  account_id uuid references public.accounts(id) on delete set null,
  person_id uuid references public.people(id) on delete set null,
  issue_date date not null default current_date,
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  balance_due numeric not null default 0,
  status text not null,
  notes text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_records_record_type_check check (record_type in ('customer_invoice', 'k2_statement', 'family_use')),
  constraint invoice_records_status_check check (status in ('unpaid', 'paid', 'partial', 'overdue', 'internal', 'track_only', 'void')),
  constraint invoice_records_amounts_nonnegative check (subtotal >= 0 and tax >= 0 and total >= 0 and balance_due >= 0),
  constraint invoice_records_customer_requires_account check (
    record_type <> 'customer_invoice' or account_id is not null
  ),
  constraint invoice_records_k2_requires_account check (
    record_type <> 'k2_statement' or account_id is not null
  ),
  constraint invoice_records_family_requires_person check (
    record_type <> 'family_use' or person_id is not null
  ),
  constraint invoice_records_unique_display_number_per_org unique (organization_id, display_number)
);

create index invoice_records_organization_id_idx on public.invoice_records(organization_id);
create index invoice_records_account_id_idx on public.invoice_records(account_id);
create index invoice_records_person_id_idx on public.invoice_records(person_id);
create index invoice_records_record_type_idx on public.invoice_records(record_type);
create index invoice_records_status_idx on public.invoice_records(status);
create index invoice_records_issue_date_idx on public.invoice_records(issue_date);

create trigger set_invoice_records_updated_at
before update on public.invoice_records
for each row execute function public.set_updated_at();

-- Invoice line items preserve historical price/description.
create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_record_id uuid not null references public.invoice_records(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  quantity numeric not null,
  unit_label text not null default 'units',
  unit_price numeric not null default 0,
  line_total numeric not null default 0,
  created_at timestamptz not null default now(),
  constraint invoice_line_items_quantity_positive check (quantity > 0),
  constraint invoice_line_items_amounts_nonnegative check (unit_price >= 0 and line_total >= 0)
);

create index invoice_line_items_organization_id_idx on public.invoice_line_items(organization_id);
create index invoice_line_items_invoice_record_id_idx on public.invoice_line_items(invoice_record_id);
create index invoice_line_items_product_id_idx on public.invoice_line_items(product_id);

-- Inventory movement ledger. Append-only by policy.
create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  transaction_type text not null,
  quantity_change numeric not null,
  quantity_before numeric not null,
  quantity_after numeric not null,
  unit_price numeric,
  source_record_type text,
  source_record_id uuid,
  notes text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint inventory_transactions_type_check check (transaction_type in ('take_feed', 'add_stock', 'adjust_count', 'correction')),
  constraint inventory_transactions_quantities_nonnegative check (quantity_before >= 0 and quantity_after >= 0),
  constraint inventory_transactions_quantity_change_not_zero check (quantity_change <> 0),
  constraint inventory_transactions_unit_price_nonnegative check (unit_price is null or unit_price >= 0)
);

create index inventory_transactions_organization_id_idx on public.inventory_transactions(organization_id);
create index inventory_transactions_product_id_idx on public.inventory_transactions(product_id);
create index inventory_transactions_transaction_type_idx on public.inventory_transactions(transaction_type);
create index inventory_transactions_created_at_idx on public.inventory_transactions(created_at);

-- Payment ledger. Append-only by policy.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_record_id uuid not null references public.invoice_records(id) on delete restrict,
  amount numeric not null,
  method text not null,
  reference_number text,
  notes text,
  received_by uuid references public.user_profiles(id) on delete set null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount > 0),
  constraint payments_method_check check (method in ('cash', 'check', 'card', 'transfer', 'other'))
);

create index payments_organization_id_idx on public.payments(organization_id);
create index payments_invoice_record_id_idx on public.payments(invoice_record_id);
create index payments_received_at_idx on public.payments(received_at);

-- Human-readable audit trail. Append-only by policy.
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.user_profiles(id) on delete set null,
  activity_type text not null,
  summary text not null,
  product_id uuid references public.products(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  person_id uuid references public.people(id) on delete set null,
  invoice_record_id uuid references public.invoice_records(id) on delete set null,
  inventory_transaction_id uuid references public.inventory_transactions(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  constraint activity_logs_type_check check (activity_type in (
    'take_feed',
    'add_stock',
    'adjust_count',
    'correction',
    'invoice_created',
    'payment_recorded',
    'account_created',
    'account_updated',
    'person_created',
    'person_updated',
    'product_created',
    'product_updated',
    'status_changed'
  ))
);

create index activity_logs_organization_id_idx on public.activity_logs(organization_id);
create index activity_logs_actor_user_id_idx on public.activity_logs(actor_user_id);
create index activity_logs_activity_type_idx on public.activity_logs(activity_type);
create index activity_logs_created_at_idx on public.activity_logs(created_at);
create index activity_logs_product_id_idx on public.activity_logs(product_id);
create index activity_logs_account_id_idx on public.activity_logs(account_id);
create index activity_logs_person_id_idx on public.activity_logs(person_id);
create index activity_logs_invoice_record_id_idx on public.activity_logs(invoice_record_id);

-- App settings
create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  setting_key text not null,
  setting_value jsonb not null,
  updated_by uuid references public.user_profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint app_settings_unique_key_per_org unique (organization_id, setting_key)
);

create index app_settings_organization_id_idx on public.app_settings(organization_id);

-- Utility helpers for RLS policies.
create or replace function public.current_user_profile()
returns public.user_profiles
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.user_profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.user_profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.current_user_can_write()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'manager', 'operator'), false);
$$;

create or replace function public.current_user_can_manage()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'manager'), false);
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- Enable RLS on every public table.
alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.accounts enable row level security;
alter table public.people enable row level security;
alter table public.invoice_records enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.app_settings enable row level security;

-- Organization policies
create policy "Users can read their organization"
on public.organizations
for select
to authenticated
using (id = public.current_organization_id());

create policy "Admins can update their organization"
on public.organizations
for update
to authenticated
using (id = public.current_organization_id() and public.current_user_is_admin())
with check (id = public.current_organization_id() and public.current_user_is_admin());

-- User profile policies
create policy "Users can read profiles in their organization"
on public.user_profiles
for select
to authenticated
using (organization_id = public.current_organization_id() or id = auth.uid());

create policy "Admins can insert profiles in their organization"
on public.user_profiles
for insert
to authenticated
with check (public.current_user_is_admin() and organization_id = public.current_organization_id());

create policy "Admins can update profiles in their organization"
on public.user_profiles
for update
to authenticated
using (public.current_user_is_admin() and organization_id = public.current_organization_id())
with check (public.current_user_is_admin() and organization_id = public.current_organization_id());

-- Shared setup table policies
create policy "Users can read product categories in their organization"
on public.product_categories
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Managers can manage product categories"
on public.product_categories
for all
to authenticated
using (organization_id = public.current_organization_id() and public.current_user_can_manage())
with check (organization_id = public.current_organization_id() and public.current_user_can_manage());

create policy "Users can read products in their organization"
on public.products
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Managers can manage products"
on public.products
for all
to authenticated
using (organization_id = public.current_organization_id() and public.current_user_can_manage())
with check (organization_id = public.current_organization_id() and public.current_user_can_manage());

create policy "Users can read accounts in their organization"
on public.accounts
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Managers can manage accounts"
on public.accounts
for all
to authenticated
using (organization_id = public.current_organization_id() and public.current_user_can_manage())
with check (organization_id = public.current_organization_id() and public.current_user_can_manage());

create policy "Users can read people in their organization"
on public.people
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Managers can manage people"
on public.people
for all
to authenticated
using (organization_id = public.current_organization_id() and public.current_user_can_manage())
with check (organization_id = public.current_organization_id() and public.current_user_can_manage());

-- Invoice policies
create policy "Users can read invoice records in their organization"
on public.invoice_records
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Writers can insert invoice records"
on public.invoice_records
for insert
to authenticated
with check (organization_id = public.current_organization_id() and public.current_user_can_write());

create policy "Managers can update invoice records"
on public.invoice_records
for update
to authenticated
using (organization_id = public.current_organization_id() and public.current_user_can_manage())
with check (organization_id = public.current_organization_id() and public.current_user_can_manage());

create policy "Users can read invoice line items in their organization"
on public.invoice_line_items
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Writers can insert invoice line items"
on public.invoice_line_items
for insert
to authenticated
with check (organization_id = public.current_organization_id() and public.current_user_can_write());

create policy "Managers can update invoice line items"
on public.invoice_line_items
for update
to authenticated
using (organization_id = public.current_organization_id() and public.current_user_can_manage())
with check (organization_id = public.current_organization_id() and public.current_user_can_manage());

-- Append-only inventory transaction policies
create policy "Users can read inventory transactions in their organization"
on public.inventory_transactions
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Writers can insert inventory transactions"
on public.inventory_transactions
for insert
to authenticated
with check (organization_id = public.current_organization_id() and public.current_user_can_write());

-- Append-only payment policies
create policy "Users can read payments in their organization"
on public.payments
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Writers can insert payments"
on public.payments
for insert
to authenticated
with check (organization_id = public.current_organization_id() and public.current_user_can_write());

-- Append-only activity log policies
create policy "Users can read activity logs in their organization"
on public.activity_logs
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Writers can insert activity logs"
on public.activity_logs
for insert
to authenticated
with check (organization_id = public.current_organization_id() and public.current_user_can_write());

-- Settings policies
create policy "Users can read settings in their organization"
on public.app_settings
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Admins can manage settings"
on public.app_settings
for all
to authenticated
using (organization_id = public.current_organization_id() and public.current_user_is_admin())
with check (organization_id = public.current_organization_id() and public.current_user_is_admin());