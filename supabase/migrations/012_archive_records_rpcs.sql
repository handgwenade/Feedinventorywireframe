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
  'status_changed'
));

create or replace function public.archive_product(
  p_product_id uuid,
  p_reason text
)
returns table (
  id uuid,
  name text,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_product public.products%rowtype;
  v_archived_product public.products%rowtype;
  v_reason text;
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
    raise exception 'Only admins and managers can archive products.';
  end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');

  if v_reason is null then
    raise exception 'Archive reason is required.';
  end if;

  select p.*
  into v_product
  from public.products as p
  where p.id = p_product_id
    and p.organization_id = v_user_profile.organization_id
    and p.is_active = true
  for update;

  if v_product.id is null then
    raise exception 'Active product was not found.';
  end if;

  update public.products as p
  set is_active = false
  where p.id = v_product.id
  returning p.* into v_archived_product;

  insert into public.activity_logs as al (
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
    'product_archived',
    'Archived product ' || v_product.name,
    v_product.id,
    jsonb_build_object(
      'reason', v_reason,
      'productName', v_product.name,
      'quantityAtArchive', v_product.current_quantity
    )
  );

  return query
  select
    v_archived_product.id,
    v_archived_product.name,
    v_archived_product.is_active;
end;
$$;

create or replace function public.archive_customer_account(
  p_account_id uuid,
  p_reason text
)
returns table (
  id uuid,
  account_type text,
  name text,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_account public.accounts%rowtype;
  v_archived_account public.accounts%rowtype;
  v_reason text;
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
    raise exception 'Only admins and managers can archive customer accounts.';
  end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');

  if v_reason is null then
    raise exception 'Archive reason is required.';
  end if;

  select a.*
  into v_account
  from public.accounts as a
  where a.id = p_account_id
    and a.organization_id = v_user_profile.organization_id
    and a.is_active = true
  for update;

  if v_account.id is null then
    raise exception 'Active account was not found.';
  end if;

  if v_account.account_type <> 'customer' then
    raise exception 'Only customer accounts can be archived here.';
  end if;

  update public.accounts as a
  set is_active = false
  where a.id = v_account.id
  returning a.* into v_archived_account;

  insert into public.activity_logs as al (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    account_id,
    metadata
  )
  values (
    v_user_profile.organization_id,
    auth.uid(),
    'account_archived',
    'Archived customer account ' || v_account.name,
    v_account.id,
    jsonb_build_object(
      'reason', v_reason,
      'accountName', v_account.name
    )
  );

  return query
  select
    v_archived_account.id,
    v_archived_account.account_type,
    v_archived_account.name,
    v_archived_account.is_active;
end;
$$;

create or replace function public.archive_family_person(
  p_person_id uuid,
  p_reason text
)
returns table (
  id uuid,
  official_display_name text,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_person public.people%rowtype;
  v_archived_person public.people%rowtype;
  v_reason text;
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
    raise exception 'Only admins and managers can archive family/person records.';
  end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');

  if v_reason is null then
    raise exception 'Archive reason is required.';
  end if;

  select p.*
  into v_person
  from public.people as p
  where p.id = p_person_id
    and p.organization_id = v_user_profile.organization_id
    and p.is_active = true
  for update;

  if v_person.id is null then
    raise exception 'Active family/person record was not found.';
  end if;

  update public.people as p
  set is_active = false
  where p.id = v_person.id
  returning p.* into v_archived_person;

  insert into public.activity_logs as al (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    person_id,
    metadata
  )
  values (
    v_user_profile.organization_id,
    auth.uid(),
    'person_archived',
    'Archived family/person record ' || v_person.official_display_name,
    v_person.id,
    jsonb_build_object(
      'reason', v_reason,
      'personName', v_person.official_display_name
    )
  );

  return query
  select
    v_archived_person.id,
    v_archived_person.official_display_name,
    v_archived_person.is_active;
end;
$$;

revoke all on function public.archive_product(uuid, text) from public;
revoke all on function public.archive_customer_account(uuid, text) from public;
revoke all on function public.archive_family_person(uuid, text) from public;
grant execute on function public.archive_product(uuid, text) to authenticated;
grant execute on function public.archive_customer_account(uuid, text) to authenticated;
grant execute on function public.archive_family_person(uuid, text) to authenticated;
