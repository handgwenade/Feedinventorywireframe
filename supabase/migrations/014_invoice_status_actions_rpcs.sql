alter table public.invoice_records
  drop constraint if exists invoice_records_status_check;

alter table public.invoice_records
  add constraint invoice_records_status_check check (status in (
    'unpaid',
    'paid',
    'partial',
    'overdue',
    'internal',
    'track_only',
    'void',
    'written_off'
  ));

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
    'family_use_recorded',
    'payment_recorded',
    'account_created',
    'account_updated',
    'account_archived',
    'person_created',
    'person_updated',
    'person_archived',
    'product_created',
    'product_updated',
    'product_archived',
    'status_changed',
    'invoice_written_off',
    'invoice_voided'
  ));

create or replace function public.mark_invoice_written_off(
  p_invoice_record_id uuid,
  p_reason text
)
returns table (
  invoice_record_id uuid,
  display_number text,
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
  v_reason text;
  v_previous_balance_due numeric;
  v_new_notes text;
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
    raise exception 'Only admins and managers can mark invoices written off.';
  end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');

  if v_reason is null then
    raise exception 'Write-off reason is required.';
  end if;

  select ir.*
  into v_invoice
  from public.invoice_records as ir
  where ir.id = p_invoice_record_id
    and ir.organization_id = v_user_profile.organization_id
  for update;

  if v_invoice.id is null then
    raise exception 'Customer invoice not found.';
  end if;

  if v_invoice.record_type <> 'customer_invoice' then
    raise exception 'Only customer invoices can be written off.';
  end if;

  if v_invoice.status = 'void' then
    raise exception 'Cannot write off a void invoice.';
  end if;

  if v_invoice.balance_due <= 0 then
    raise exception 'Invoice has no balance due.';
  end if;

  v_previous_balance_due := v_invoice.balance_due;
  v_new_notes := btrim(coalesce(v_invoice.notes, ''));

  if v_new_notes = '' then
    v_new_notes := 'Write-off reason: ' || v_reason;
  else
    v_new_notes := v_new_notes || E'\n\nWrite-off reason: ' || v_reason;
  end if;

  update public.invoice_records as ir
  set balance_due = 0,
      status = 'written_off',
      notes = v_new_notes
  where ir.id = v_invoice.id
  returning ir.display_number, ir.balance_due, ir.status
  into v_invoice.display_number, v_invoice.balance_due, v_invoice.status;

  insert into public.activity_logs as al (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    invoice_record_id,
    metadata
  ) values (
    v_user_profile.organization_id,
    auth.uid(),
    'invoice_written_off',
    'Marked invoice ' || v_invoice.display_number || ' written off',
    v_invoice.id,
    jsonb_build_object(
      'previousBalance', v_previous_balance_due,
      'reason', v_reason
    )
  );

  return query
  select
    v_invoice.id,
    v_invoice.display_number,
    v_previous_balance_due,
    v_invoice.balance_due,
    v_invoice.status;
end;
$$;

revoke all on function public.mark_invoice_written_off(uuid, text) from public;
grant execute on function public.mark_invoice_written_off(uuid, text) to authenticated;

create or replace function public.void_invoice(
  p_invoice_record_id uuid,
  p_reason text
)
returns table (
  invoice_record_id uuid,
  display_number text,
  previous_status text,
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
  v_reason text;
  v_previous_balance_due numeric;
  v_previous_status text;
  v_new_notes text;
  v_has_payments boolean;
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
    raise exception 'Only admins and managers can void invoices.';
  end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');

  if v_reason is null then
    raise exception 'Void reason is required.';
  end if;

  select ir.*
  into v_invoice
  from public.invoice_records as ir
  where ir.id = p_invoice_record_id
    and ir.organization_id = v_user_profile.organization_id
  for update;

  if v_invoice.id is null then
    raise exception 'Customer invoice not found.';
  end if;

  if v_invoice.record_type <> 'customer_invoice' then
    raise exception 'Only customer invoices can be voided.';
  end if;

  if v_invoice.status = 'void' then
    raise exception 'Invoice is already void.';
  end if;

  select exists(
    select 1
    from public.payments as p
    where p.invoice_record_id = p_invoice_record_id
      and p.organization_id = v_user_profile.organization_id
  )
  into v_has_payments;

  if v_has_payments then
    raise exception 'Invoices with payments cannot be voided yet.';
  end if;

  v_previous_balance_due := v_invoice.balance_due;
  v_previous_status := v_invoice.status;
  v_new_notes := btrim(coalesce(v_invoice.notes, ''));

  if v_new_notes = '' then
    v_new_notes := 'Void reason: ' || v_reason;
  else
    v_new_notes := v_new_notes || E'\n\nVoid reason: ' || v_reason;
  end if;

  update public.invoice_records as ir
  set status = 'void',
      balance_due = 0,
      notes = v_new_notes
  where ir.id = v_invoice.id
  returning ir.display_number, ir.balance_due, ir.status
  into v_invoice.display_number, v_invoice.balance_due, v_invoice.status;

  insert into public.activity_logs as al (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    invoice_record_id,
    metadata
  ) values (
    v_user_profile.organization_id,
    auth.uid(),
    'invoice_voided',
    'Voided invoice ' || v_invoice.display_number,
    v_invoice.id,
    jsonb_build_object(
      'previousStatus', v_previous_status,
      'previousBalance', v_previous_balance_due,
      'reason', v_reason
    )
  );

  return query
  select
    v_invoice.id,
    v_invoice.display_number,
    v_previous_status,
    v_previous_balance_due,
    v_invoice.balance_due,
    v_invoice.status;
end;
$$;

revoke all on function public.void_invoice(uuid, text) from public;
grant execute on function public.void_invoice(uuid, text) to authenticated;
