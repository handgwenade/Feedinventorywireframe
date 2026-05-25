-- StockLog seed data
-- Setup data only. No invoices, payments, inventory transactions, or activity logs yet.

with stocklog_org as (
  select id
  from public.organizations
  where name = 'StockLog'
  limit 1
), categories as (
  insert into public.product_categories (organization_id, name, slug, sort_order)
  select stocklog_org.id, category.name, category.slug, category.sort_order
  from stocklog_org
  cross join (
    values
      ('Salt', 'salt', 10),
      ('Mineral', 'mineral', 20),
      ('Tubs', 'tubs', 30),
      ('Blocks', 'blocks', 40)
  ) as category(name, slug, sort_order)
  on conflict (organization_id, slug) do update
  set name = excluded.name,
      sort_order = excluded.sort_order,
      is_active = true,
      updated_at = now()
  returning id, organization_id, slug
), all_categories as (
  select id, organization_id, slug from categories
  union
  select product_categories.id, product_categories.organization_id, product_categories.slug
  from public.product_categories
  join stocklog_org on stocklog_org.id = product_categories.organization_id
), seeded_products as (
  insert into public.products (
    organization_id,
    category_id,
    name,
    sku,
    unit_label,
    current_quantity,
    minimum_quantity,
    sale_price,
    cost_per_unit,
    vendor,
    source_notes,
    is_active
  )
  select
    stocklog_org.id,
    all_categories.id,
    product.name,
    product.sku,
    product.unit_label,
    product.current_quantity,
    product.minimum_quantity,
    product.sale_price,
    product.cost_per_unit,
    product.vendor,
    product.source_notes,
    true
  from stocklog_org
  join (
    values
      ('Garlic Salt Blocks', 'blocks', 'GARLIC-SALT-BLOCKS', 'units', 247, 50, 17.15, null::numeric, null::text, 'Seeded from wireframe mock data'),
      ('Redmond Mineral Salt', 'salt', 'REDMOND-MINERAL-SALT', 'units', 200, 50, 9.79, null::numeric, null::text, 'Seeded from wireframe mock data'),
      ('SweetPro FiberMate 20', 'tubs', 'SWEETPRO-FIBERMATE-20', 'units', 6, 8, 154.00, null::numeric, null::text, 'Seeded from wireframe mock data'),
      ('RumenEdge Tubs', 'tubs', 'RUMENEDGE-TUBS', 'units', 4, 12, 123.70, null::numeric, null::text, 'Seeded from wireframe mock data')
  ) as product(name, category_slug, sku, unit_label, current_quantity, minimum_quantity, sale_price, cost_per_unit, vendor, source_notes)
    on true
  join all_categories
    on all_categories.organization_id = stocklog_org.id
   and all_categories.slug = product.category_slug
  where not exists (
    select 1
    from public.products existing_product
    where existing_product.organization_id = stocklog_org.id
      and existing_product.name = product.name
  )
  returning id
), seeded_accounts as (
  insert into public.accounts (
    organization_id,
    account_type,
    name,
    phone,
    email,
    notes,
    is_active
  )
  select
    stocklog_org.id,
    account.account_type,
    account.name,
    account.phone,
    account.email,
    account.notes,
    true
  from stocklog_org
  cross join (
    values
      ('customer', 'Anderson Cattle Co.', '(555) 123-4567', 'anderson@example.com', 'Seeded from wireframe mock data'),
      ('customer', 'Johnson Ranch', '(555) 234-5678', null, 'Seeded from wireframe mock data'),
      ('k2', 'K2', null, null, 'Separate cattle-side account')
  ) as account(account_type, name, phone, email, notes)
  where not exists (
    select 1
    from public.accounts existing_account
    where existing_account.organization_id = stocklog_org.id
      and existing_account.name = account.name
  )
  returning id
), seeded_people as (
  insert into public.people (
    organization_id,
    official_display_name,
    phone,
    notes,
    is_active
  )
  select
    stocklog_org.id,
    person.official_display_name,
    person.phone,
    person.notes,
    true
  from stocklog_org
  cross join (
    values
      ('Bill Johnson', null, 'Seeded from wireframe mock data'),
      ('Tessie Geringer', null, 'Seeded from wireframe mock data')
  ) as person(official_display_name, phone, notes)
  where not exists (
    select 1
    from public.people existing_person
    where existing_person.organization_id = stocklog_org.id
      and existing_person.official_display_name = person.official_display_name
  )
  returning id
)
insert into public.app_settings (
  organization_id,
  setting_key,
  setting_value
)
select
  stocklog_org.id,
  setting.setting_key,
  setting.setting_value::jsonb
from stocklog_org
cross join (
  values
    ('low_stock_alerts', 'true'),
    ('default_tax_enabled', 'false'),
    ('default_tax_rate', '0.08'),
    ('invoice_number_prefix', '"INV"'),
    ('k2_statement_prefix', '"K2"'),
    ('family_use_prefix', '"FAM"')
) as setting(setting_key, setting_value)
on conflict (organization_id, setting_key) do update
set setting_value = excluded.setting_value,
    updated_at = now();
