create or replace function public.add_product_stock(
  p_product_id uuid,
  p_quantity_added numeric,
  p_vendor_note text,
  p_notes text
)
returns table (
  product_id uuid,
  product_name text,
  quantity_added numeric,
  quantity_before numeric,
  quantity_after numeric,
  unit_label text,
  inventory_transaction_id uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_product public.products%rowtype;
  v_quantity_before numeric;
  v_quantity_after numeric;
  v_inventory_transaction_id uuid;
  v_transaction_notes text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into v_user_profile
  from public.user_profiles
  where id = auth.uid()
    and is_active = true;

  if v_user_profile.id is null or v_user_profile.organization_id is null then
    raise exception 'Active user profile with organization is required.';
  end if;

  if v_user_profile.role not in ('admin', 'manager', 'operator') then
    raise exception 'You do not have permission to add stock.';
  end if;

  if p_quantity_added is null or p_quantity_added <= 0 then
    raise exception 'Quantity added must be greater than zero.';
  end if;

  select *
  into v_product
  from public.products
  where id = p_product_id
    and organization_id = v_user_profile.organization_id
    and is_active = true
  for update;

  if v_product.id is null then
    raise exception 'Product was not found.';
  end if;

  v_quantity_before := v_product.current_quantity;
  v_quantity_after := v_quantity_before + p_quantity_added;
  v_transaction_notes := nullif(
    concat_ws(
      E'\n',
      case
        when nullif(p_vendor_note, '') is not null
          then 'Vendor/source: ' || nullif(p_vendor_note, '')
        else null
      end,
      nullif(p_notes, '')
    ),
    ''
  );

  update public.products
  set current_quantity = v_quantity_after
  where id = v_product.id;

  insert into public.inventory_transactions (
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
    p_quantity_added,
    v_quantity_before,
    v_quantity_after,
    'add_stock',
    null,
    v_transaction_notes,
    auth.uid()
  )
  returning id into v_inventory_transaction_id;

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
    'add_stock',
    'Added ' || p_quantity_added || ' ' || v_product.unit_label || ' to ' || v_product.name || '. New quantity: ' || v_quantity_after || ' ' || v_product.unit_label || '.',
    v_product.id,
    v_inventory_transaction_id,
    jsonb_build_object(
      'quantityAdded', p_quantity_added,
      'quantityBefore', v_quantity_before,
      'quantityAfter', v_quantity_after,
      'vendorNote', nullif(p_vendor_note, ''),
      'notes', nullif(p_notes, '')
    )
  );

  return query
  select
    v_product.id,
    v_product.name,
    p_quantity_added,
    v_quantity_before,
    v_quantity_after,
    v_product.unit_label,
    v_inventory_transaction_id;
end;
$$;

revoke all on function public.add_product_stock(uuid, numeric, text, text) from public;
grant execute on function public.add_product_stock(uuid, numeric, text, text) to authenticated;
