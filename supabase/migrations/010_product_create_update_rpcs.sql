create or replace function public.create_product(
  p_name text,
  p_category_id uuid,
  p_unit_label text,
  p_current_quantity numeric,
  p_minimum_quantity numeric,
  p_sale_price numeric,
  p_vendor text,
  p_source_notes text
)
returns table (
  id uuid,
  category_id uuid,
  name text,
  sku text,
  unit_label text,
  current_quantity numeric,
  minimum_quantity numeric,
  sale_price numeric,
  cost_per_unit numeric,
  vendor text,
  source_notes text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_product public.products%rowtype;
  v_category public.product_categories%rowtype;
  v_inventory_transaction_id uuid;
  v_name text;
  v_unit_label text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select up.*
  into v_user_profile
  from public.user_profiles as up
  where up.id = auth.uid()
    and up.is_active = true;

  if v_user_profile.id is null or v_user_profile.organization_id is null then
    raise exception 'Active user profile with organization is required.';
  end if;

  if v_user_profile.role not in ('admin', 'manager') then
    raise exception 'Only admins and managers can create products.';
  end if;

  v_name := nullif(btrim(coalesce(p_name, '')), '');
  v_unit_label := nullif(btrim(coalesce(p_unit_label, '')), '');

  if v_name is null then
    raise exception 'Product name is required.';
  end if;

  if v_unit_label is null then
    raise exception 'Unit label is required.';
  end if;

  if p_current_quantity is null or p_current_quantity < 0 then
    raise exception 'Current quantity must be zero or greater.';
  end if;

  if p_minimum_quantity is null or p_minimum_quantity < 0 then
    raise exception 'Minimum quantity must be zero or greater.';
  end if;

  if p_sale_price is null or p_sale_price < 0 then
    raise exception 'Sale price must be zero or greater.';
  end if;

  if p_category_id is not null then
    select pc.*
    into v_category
    from public.product_categories as pc
    where pc.id = p_category_id
      and pc.organization_id = v_user_profile.organization_id
      and pc.is_active = true;

    if v_category.id is null then
      raise exception 'Product category was not found.';
    end if;
  end if;

  insert into public.products as p (
    organization_id,
    category_id,
    name,
    unit_label,
    current_quantity,
    minimum_quantity,
    sale_price,
    vendor,
    source_notes,
    is_active
  )
  values (
    v_user_profile.organization_id,
    p_category_id,
    v_name,
    v_unit_label,
    p_current_quantity,
    p_minimum_quantity,
    p_sale_price,
    nullif(btrim(coalesce(p_vendor, '')), ''),
    nullif(btrim(coalesce(p_source_notes, '')), ''),
    true
  )
  returning p.* into v_product;

  if p_current_quantity > 0 then
    insert into public.inventory_transactions as it (
      organization_id,
      product_id,
      transaction_type,
      quantity_change,
      quantity_before,
      quantity_after,
      source_record_type,
      source_record_id,
      notes,
      created_by
    )
    values (
      v_user_profile.organization_id,
      v_product.id,
      'add_stock',
      p_current_quantity,
      0,
      p_current_quantity,
      'product_created',
      null,
      'Initial product quantity',
      auth.uid()
    )
    returning it.id into v_inventory_transaction_id;
  end if;

  insert into public.activity_logs (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    product_id,
    inventory_transaction_id,
    metadata
  )
  values (
    v_user_profile.organization_id,
    auth.uid(),
    'product_created',
    'Created product ' || v_product.name,
    v_product.id,
    v_inventory_transaction_id,
    jsonb_build_object(
      'name', v_product.name,
      'categoryId', v_product.category_id,
      'unitLabel', v_product.unit_label,
      'initialQuantity', v_product.current_quantity,
      'minimumQuantity', v_product.minimum_quantity,
      'salePrice', v_product.sale_price,
      'vendor', v_product.vendor,
      'sourceNotes', v_product.source_notes
    )
  );

  return query
  select
    v_product.id,
    v_product.category_id,
    v_product.name,
    v_product.sku,
    v_product.unit_label,
    v_product.current_quantity,
    v_product.minimum_quantity,
    v_product.sale_price,
    v_product.cost_per_unit,
    v_product.vendor,
    v_product.source_notes,
    v_product.is_active,
    v_product.created_at,
    v_product.updated_at;
end;
$$;

create or replace function public.update_product(
  p_product_id uuid,
  p_name text,
  p_category_id uuid,
  p_unit_label text,
  p_minimum_quantity numeric,
  p_sale_price numeric,
  p_vendor text,
  p_source_notes text
)
returns table (
  id uuid,
  category_id uuid,
  name text,
  sku text,
  unit_label text,
  current_quantity numeric,
  minimum_quantity numeric,
  sale_price numeric,
  cost_per_unit numeric,
  vendor text,
  source_notes text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_existing_product public.products%rowtype;
  v_product public.products%rowtype;
  v_category public.product_categories%rowtype;
  v_name text;
  v_unit_label text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select up.*
  into v_user_profile
  from public.user_profiles as up
  where up.id = auth.uid()
    and up.is_active = true;

  if v_user_profile.id is null or v_user_profile.organization_id is null then
    raise exception 'Active user profile with organization is required.';
  end if;

  if v_user_profile.role not in ('admin', 'manager') then
    raise exception 'Only admins and managers can update products.';
  end if;

  v_name := nullif(btrim(coalesce(p_name, '')), '');
  v_unit_label := nullif(btrim(coalesce(p_unit_label, '')), '');

  if v_name is null then
    raise exception 'Product name is required.';
  end if;

  if v_unit_label is null then
    raise exception 'Unit label is required.';
  end if;

  if p_minimum_quantity is null or p_minimum_quantity < 0 then
    raise exception 'Minimum quantity must be zero or greater.';
  end if;

  if p_sale_price is null or p_sale_price < 0 then
    raise exception 'Sale price must be zero or greater.';
  end if;

  select p.*
  into v_existing_product
  from public.products as p
  where p.id = p_product_id
    and p.organization_id = v_user_profile.organization_id
    and p.is_active = true
  for update;

  if v_existing_product.id is null then
    raise exception 'Product was not found.';
  end if;

  if p_category_id is not null then
    select pc.*
    into v_category
    from public.product_categories as pc
    where pc.id = p_category_id
      and pc.organization_id = v_user_profile.organization_id
      and pc.is_active = true;

    if v_category.id is null then
      raise exception 'Product category was not found.';
    end if;
  end if;

  update public.products as p
  set
    name = v_name,
    category_id = p_category_id,
    unit_label = v_unit_label,
    minimum_quantity = p_minimum_quantity,
    sale_price = p_sale_price,
    vendor = nullif(btrim(coalesce(p_vendor, '')), ''),
    source_notes = nullif(btrim(coalesce(p_source_notes, '')), '')
  where p.id = v_existing_product.id
  returning p.* into v_product;

  insert into public.activity_logs (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    product_id,
    metadata
  )
  values (
    v_user_profile.organization_id,
    auth.uid(),
    'product_updated',
    'Updated product ' || v_product.name,
    v_product.id,
    jsonb_build_object(
      'name', v_product.name,
      'categoryId', v_product.category_id,
      'unitLabel', v_product.unit_label,
      'minimumQuantity', v_product.minimum_quantity,
      'salePrice', v_product.sale_price,
      'vendor', v_product.vendor,
      'sourceNotes', v_product.source_notes
    )
  );

  return query
  select
    v_product.id,
    v_product.category_id,
    v_product.name,
    v_product.sku,
    v_product.unit_label,
    v_product.current_quantity,
    v_product.minimum_quantity,
    v_product.sale_price,
    v_product.cost_per_unit,
    v_product.vendor,
    v_product.source_notes,
    v_product.is_active,
    v_product.created_at,
    v_product.updated_at;
end;
$$;

revoke all on function public.create_product(text, uuid, text, numeric, numeric, numeric, text, text) from public;
revoke all on function public.update_product(uuid, text, uuid, text, numeric, numeric, text, text) from public;
grant execute on function public.create_product(text, uuid, text, numeric, numeric, numeric, text, text) to authenticated;
grant execute on function public.update_product(uuid, text, uuid, text, numeric, numeric, text, text) to authenticated;
