create or replace function public.record_invoice_payment(
  p_invoice_record_id uuid,
  p_amount numeric,
  p_method text,
  p_reference_number text,
  p_notes text
)
returns table (
  payment_id uuid,
  invoice_record_id uuid,
  display_number text,
  amount numeric,
  method text,
  previous_balance_due numeric,
  new_balance_due numeric,
  status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_invoice public.invoice_records%rowtype;
  v_payment_id uuid;
  v_method text;
  v_previous_balance_due numeric;
  v_new_balance_due numeric;
  v_new_status text;
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
    raise exception 'You do not have permission to record payments.';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero.';
  end if;

  v_method := lower(trim(coalesce(p_method, '')));

  if v_method not in ('cash', 'check', 'card', 'transfer', 'other') then
    raise exception 'Invalid payment method.';
  end if;

  select *
  into v_invoice
  from public.invoice_records
  where id = p_invoice_record_id
    and organization_id = v_user_profile.organization_id
  for update;

  if v_invoice.id is null then
    raise exception 'Invoice was not found.';
  end if;

  if v_invoice.record_type <> 'customer_invoice' then
    raise exception 'Payments are only supported for customer invoices.';
  end if;

  if v_invoice.status = 'void' then
    raise exception 'Cannot record payment on a void invoice.';
  end if;

  v_previous_balance_due := coalesce(v_invoice.balance_due, 0);

  if p_amount > v_previous_balance_due then
    raise exception 'Payment amount cannot exceed balance due.';
  end if;

  v_new_balance_due := round(v_previous_balance_due - p_amount, 2);
  v_new_status := case when v_new_balance_due = 0 then 'paid' else 'partial' end;

  insert into public.payments (
    organization_id,
    invoice_record_id,
    amount,
    method,
    reference_number,
    notes,
    received_by
  )
  values (
    v_user_profile.organization_id,
    v_invoice.id,
    round(p_amount, 2),
    v_method,
    nullif(p_reference_number, ''),
    nullif(p_notes, ''),
    auth.uid()
  )
  returning id into v_payment_id;

  update public.invoice_records
  set
    balance_due = v_new_balance_due,
    status = v_new_status
  where id = v_invoice.id;

  insert into public.activity_logs (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    invoice_record_id,
    payment_id,
    metadata
  )
  values (
    v_user_profile.organization_id,
    auth.uid(),
    'payment_recorded',
    'Recorded payment ' || to_char(round(p_amount, 2), 'FM$999999999990.00') || ' for invoice ' || v_invoice.display_number,
    v_invoice.id,
    v_payment_id,
    jsonb_build_object(
      'method', v_method,
      'amount', round(p_amount, 2),
      'previousBalance', v_previous_balance_due,
      'newBalance', v_new_balance_due
    )
  );

  return query
  select
    v_payment_id,
    v_invoice.id,
    v_invoice.display_number,
    round(p_amount, 2),
    v_method,
    v_previous_balance_due,
    v_new_balance_due,
    v_new_status;
end;
$$;

revoke all on function public.record_invoice_payment(uuid, numeric, text, text, text) from public;
grant execute on function public.record_invoice_payment(uuid, numeric, text, text, text) to authenticated;
