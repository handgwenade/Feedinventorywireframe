create or replace function public.adjust_product_count(
  p_product_id uuid,
  p_new_quantity numeric,
  p_reason text,
  p_notes text
)
returns table (
  product_id uuid,
  product_name text,
  quantity_before numeric,
  quantity_after numeric,
  quantity_change numeric,
  unit_label text,
  reason text,
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
  v_quantity_change numeric;
  v_inventory_transaction_id uuid;
  v_reason text;
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

  if v_user_profile.role not in ('admin', 'manager') then
    raise exception 'Only admins and managers can adjust inventory counts.';
  end if;

  if p_new_quantity is null or p_new_quantity < 0 then
    raise exception 'New quantity must be zero or greater.';
  end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');

  if v_reason is null then
    raise exception 'Adjustment reason is required.';
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
  v_quantity_after := p_new_quantity;
  v_quantity_change := v_quantity_after - v_quantity_before;

  if v_quantity_change = 0 then
    raise exception 'New quantity matches current quantity.';
  end if;

  v_transaction_notes := nullif(
    concat_ws(
      E'\n',
      'Reason: ' || v_reason,
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
    'adjust_count',
    v_quantity_change,
    v_quantity_before,
    v_quantity_after,
    'adjust_count',
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
    'adjust_count',
    'Adjusted ' || v_product.name || ' from ' || v_quantity_before || ' to ' || v_quantity_after || ' ' || v_product.unit_label || '. Reason: ' || v_reason || '.',
    v_product.id,
    v_inventory_transaction_id,
    jsonb_build_object(
      'reason', v_reason,
      'notes', nullif(p_notes, ''),
      'quantityBefore', v_quantity_before,
      'quantityAfter', v_quantity_after,
      'quantityChange', v_quantity_change
    )
  );

  return query
  select
    v_product.id,
    v_product.name,
    v_quantity_before,
    v_quantity_after,
    v_quantity_change,
    v_product.unit_label,
    v_reason,
    v_inventory_transaction_id;
end;
$$;

revoke all on function public.adjust_product_count(uuid, numeric, text, text) from public;
grant execute on function public.adjust_product_count(uuid, numeric, text, text) to authenticated;
