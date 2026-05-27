alter table public.activity_logs
drop constraint if exists activity_logs_type_check;

alter table public.activity_logs
add constraint activity_logs_type_check check (activity_type in (
  'take_feed',
  'add_stock',
  'adjust_count',
  'correction',
  'invoice_created',
  'k2_statement_created',
  'payment_recorded',
  'account_created',
  'account_updated',
  'person_created',
  'person_updated',
  'product_created',
  'product_updated',
  'status_changed'
));

create or replace function public.create_k2_take_feed_statement(
  p_notes text,
  p_items jsonb
)
returns table (
  statement_id uuid,
  display_number text,
  subtotal numeric,
  total numeric,
  account_id uuid,
  account_name text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_k2_account public.accounts%rowtype;
  v_statement_id uuid;
  v_display_number text;
  v_subtotal numeric := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id uuid;
  v_description text;
  v_quantity numeric;
  v_unit_price numeric;
  v_unit_label text;
  v_line_total numeric;
  v_quantity_after numeric;
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
    raise exception 'You do not have permission to create K2 statements.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one line item is required.';
  end if;

  select *
  into v_k2_account
  from public.accounts
  where organization_id = v_user_profile.organization_id
    and account_type = 'k2'
    and is_active = true
  order by name
  limit 1;

  if v_k2_account.id is null then
    raise exception 'Active K2 account was not found.';
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    if coalesce(v_item->>'productId', '') = '' then
      raise exception 'Line item product is required.';
    end if;

    v_quantity := nullif(v_item->>'quantity', '')::numeric;
    v_unit_price := nullif(v_item->>'price', '')::numeric;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Line item quantity must be greater than zero.';
    end if;

    if v_unit_price is null or v_unit_price < 0 then
      raise exception 'Line item price cannot be negative.';
    end if;

    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  end loop;

  v_subtotal := round(v_subtotal, 2);
  v_display_number := 'K2-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.invoice_records (
    organization_id,
    display_number,
    record_type,
    account_id,
    subtotal,
    tax,
    total,
    balance_due,
    status,
    notes,
    created_by
  )
  values (
    v_user_profile.organization_id,
    v_display_number,
    'k2_statement',
    v_k2_account.id,
    v_subtotal,
    0,
    v_subtotal,
    0,
    'internal',
    nullif(p_notes, ''),
    auth.uid()
  )
  returning id into v_statement_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'productId')::uuid;
    v_description := coalesce(nullif(v_item->>'name', ''), 'Product');
    v_quantity := nullif(v_item->>'quantity', '')::numeric;
    v_unit_price := nullif(v_item->>'price', '')::numeric;
    v_unit_label := coalesce(nullif(v_item->>'unitLabel', ''), 'units');
    v_line_total := round(v_quantity * v_unit_price, 2);

    select *
    into v_product
    from public.products
    where id = v_product_id
      and organization_id = v_user_profile.organization_id
      and is_active = true
    for update;

    if v_product.id is null then
      raise exception 'Product was not found.';
    end if;

    if v_product.current_quantity < v_quantity then
      raise exception 'Not enough inventory for %.', v_product.name;
    end if;

    v_quantity_after := v_product.current_quantity - v_quantity;

    insert into public.invoice_line_items (
      organization_id,
      invoice_record_id,
      product_id,
      description,
      quantity,
      unit_label,
      unit_price,
      line_total
    )
    values (
      v_user_profile.organization_id,
      v_statement_id,
      v_product.id,
      v_description,
      v_quantity,
      v_unit_label,
      v_unit_price,
      v_line_total
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
      unit_price,
      source_record_type,
      source_record_id,
      notes,
      created_by
    )
    values (
      v_user_profile.organization_id,
      v_product.id,
      'take_feed',
      -v_quantity,
      v_product.current_quantity,
      v_quantity_after,
      v_unit_price,
      'k2_statement',
      v_statement_id,
      nullif(p_notes, ''),
      auth.uid()
    );
  end loop;

  insert into public.activity_logs (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    account_id,
    invoice_record_id,
    metadata
  )
  values (
    v_user_profile.organization_id,
    auth.uid(),
    'k2_statement_created',
    'Created K2 statement ' || v_display_number || ' for ' || v_k2_account.name,
    v_k2_account.id,
    v_statement_id,
    jsonb_build_object(
      'recordType', 'k2_statement',
      'itemCount', jsonb_array_length(p_items),
      'subtotal', v_subtotal,
      'total', v_subtotal
    )
  );

  return query
  select
    v_statement_id,
    v_display_number,
    v_subtotal,
    v_subtotal,
    v_k2_account.id,
    v_k2_account.name;
end;
$$;

revoke all on function public.create_k2_take_feed_statement(text, jsonb) from public;
grant execute on function public.create_k2_take_feed_statement(text, jsonb) to authenticated;
