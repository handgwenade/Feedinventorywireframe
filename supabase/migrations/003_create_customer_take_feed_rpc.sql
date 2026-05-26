create or replace function public.create_customer_take_feed_invoice(
  p_account_id uuid,
  p_notes text,
  p_tax numeric,
  p_items jsonb
)
returns table (
  invoice_id uuid,
  display_number text,
  subtotal numeric,
  tax numeric,
  total numeric,
  balance_due numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_account public.accounts%rowtype;
  v_invoice_id uuid;
  v_display_number text;
  v_subtotal numeric := 0;
  v_tax numeric := coalesce(p_tax, 0);
  v_total numeric := 0;
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
    raise exception 'You do not have permission to create invoices.';
  end if;

  if v_tax < 0 then
    raise exception 'Tax cannot be negative.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one line item is required.';
  end if;

  select *
  into v_account
  from public.accounts
  where id = p_account_id
    and organization_id = v_user_profile.organization_id
    and account_type = 'customer'
    and is_active = true;

  if v_account.id is null then
    raise exception 'Customer account was not found.';
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::numeric;
    v_unit_price := (v_item->>'price')::numeric;

    if v_quantity <= 0 then
      raise exception 'Line item quantity must be greater than zero.';
    end if;

    if v_unit_price < 0 then
      raise exception 'Line item price cannot be negative.';
    end if;

    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  end loop;

  v_subtotal := round(v_subtotal, 2);
  v_tax := round(v_tax, 2);
  v_total := round(v_subtotal + v_tax, 2);
  v_display_number := 'INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

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
    'customer_invoice',
    p_account_id,
    v_subtotal,
    v_tax,
    v_total,
    v_total,
    'unpaid',
    nullif(p_notes, ''),
    auth.uid()
  )
  returning id into v_invoice_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'productId')::uuid;
    v_description := coalesce(nullif(v_item->>'name', ''), 'Product');
    v_quantity := (v_item->>'quantity')::numeric;
    v_unit_price := (v_item->>'price')::numeric;
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
      v_invoice_id,
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
      'customer_invoice',
      v_invoice_id,
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
    'invoice_created',
    'Created unpaid invoice ' || v_display_number || ' for ' || v_account.name,
    p_account_id,
    v_invoice_id,
    jsonb_build_object(
      'recordType', 'customer_invoice',
      'itemCount', jsonb_array_length(p_items),
      'subtotal', v_subtotal,
      'tax', v_tax,
      'total', v_total
    )
  );

  return query
  select
    v_invoice_id,
    v_display_number,
    v_subtotal,
    v_tax,
    v_total,
    v_total;
end;
$$;

revoke all on function public.create_customer_take_feed_invoice(uuid, text, numeric, jsonb) from public;
grant execute on function public.create_customer_take_feed_invoice(uuid, text, numeric, jsonb) to authenticated;
