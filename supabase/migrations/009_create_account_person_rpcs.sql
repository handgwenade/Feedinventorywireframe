create or replace function public.create_customer_account(
  p_name text,
  p_phone text,
  p_email text,
  p_billing_address text,
  p_notes text
)
returns table (
  id uuid,
  account_type text,
  name text,
  phone text,
  email text,
  billing_address text,
  notes text,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_account public.accounts%rowtype;
  v_name text;
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

  if v_user_profile.role not in ('admin', 'manager', 'operator') then
    raise exception 'You do not have permission to create customer accounts.';
  end if;

  v_name := nullif(btrim(coalesce(p_name, '')), '');

  if v_name is null then
    raise exception 'Customer account name is required.';
  end if;

  insert into public.accounts as a (
    organization_id,
    account_type,
    name,
    phone,
    email,
    billing_address,
    notes,
    is_active
  )
  values (
    v_user_profile.organization_id,
    'customer',
    v_name,
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_email, '')), ''),
    nullif(btrim(coalesce(p_billing_address, '')), ''),
    nullif(btrim(coalesce(p_notes, '')), ''),
    true
  )
  returning a.* into v_account;

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
    'account_created',
    'Created customer account ' || v_account.name,
    v_account.id,
    jsonb_build_object(
      'accountType', v_account.account_type,
      'name', v_account.name
    )
  );

  return query
  select
    v_account.id,
    v_account.account_type,
    v_account.name,
    v_account.phone,
    v_account.email,
    v_account.billing_address,
    v_account.notes,
    v_account.is_active;
end;
$$;

create or replace function public.create_family_person(
  p_official_display_name text,
  p_phone text,
  p_notes text
)
returns table (
  id uuid,
  official_display_name text,
  phone text,
  notes text,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
  v_person public.people%rowtype;
  v_official_display_name text;
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

  if v_user_profile.role not in ('admin', 'manager', 'operator') then
    raise exception 'You do not have permission to create family/person records.';
  end if;

  v_official_display_name := nullif(btrim(coalesce(p_official_display_name, '')), '');

  if v_official_display_name is null then
    raise exception 'Official display name is required.';
  end if;

  insert into public.people as p (
    organization_id,
    official_display_name,
    phone,
    notes,
    is_active
  )
  values (
    v_user_profile.organization_id,
    v_official_display_name,
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_notes, '')), ''),
    true
  )
  returning p.* into v_person;

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
    'person_created',
    'Created family/person record ' || v_person.official_display_name,
    v_person.id,
    jsonb_build_object(
      'recordType', 'family_person',
      'name', v_person.official_display_name
    )
  );

  return query
  select
    v_person.id,
    v_person.official_display_name,
    v_person.phone,
    v_person.notes,
    v_person.is_active;
end;
$$;

revoke all on function public.create_customer_account(text, text, text, text, text) from public;
revoke all on function public.create_family_person(text, text, text) from public;
grant execute on function public.create_customer_account(text, text, text, text, text) to authenticated;
grant execute on function public.create_family_person(text, text, text) to authenticated;
