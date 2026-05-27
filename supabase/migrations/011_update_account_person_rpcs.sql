create or replace function public.update_customer_account(
  p_account_id uuid,
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
  v_existing_account public.accounts%rowtype;
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
    raise exception 'You do not have permission to update customer accounts.';
  end if;

  v_name := nullif(btrim(coalesce(p_name, '')), '');

  if v_name is null then
    raise exception 'Customer account name is required.';
  end if;

  select a.*
  into v_existing_account
  from public.accounts as a
  where a.id = p_account_id
    and a.organization_id = v_user_profile.organization_id
    and a.is_active = true
  for update;

  if v_existing_account.id is null then
    raise exception 'Account was not found.';
  end if;

  if v_existing_account.account_type <> 'customer' then
    raise exception 'Only customer accounts can be edited here.';
  end if;

  update public.accounts as a
  set
    name = v_name,
    phone = nullif(btrim(coalesce(p_phone, '')), ''),
    email = nullif(btrim(coalesce(p_email, '')), ''),
    billing_address = nullif(btrim(coalesce(p_billing_address, '')), ''),
    notes = nullif(btrim(coalesce(p_notes, '')), '')
  where a.id = v_existing_account.id
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
    'account_updated',
    'Updated customer account ' || v_account.name,
    v_account.id,
    jsonb_build_object(
      'accountType', v_account.account_type,
      'old', jsonb_build_object(
        'name', v_existing_account.name,
        'phone', v_existing_account.phone,
        'email', v_existing_account.email,
        'billingAddress', v_existing_account.billing_address,
        'notes', v_existing_account.notes
      ),
      'new', jsonb_build_object(
        'name', v_account.name,
        'phone', v_account.phone,
        'email', v_account.email,
        'billingAddress', v_account.billing_address,
        'notes', v_account.notes
      )
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

create or replace function public.update_family_person(
  p_person_id uuid,
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
  v_existing_person public.people%rowtype;
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
    raise exception 'You do not have permission to update family/person records.';
  end if;

  v_official_display_name := nullif(btrim(coalesce(p_official_display_name, '')), '');

  if v_official_display_name is null then
    raise exception 'Official display name is required.';
  end if;

  select p.*
  into v_existing_person
  from public.people as p
  where p.id = p_person_id
    and p.organization_id = v_user_profile.organization_id
    and p.is_active = true
  for update;

  if v_existing_person.id is null then
    raise exception 'Family/person record was not found.';
  end if;

  update public.people as p
  set
    official_display_name = v_official_display_name,
    phone = nullif(btrim(coalesce(p_phone, '')), ''),
    notes = nullif(btrim(coalesce(p_notes, '')), '')
  where p.id = v_existing_person.id
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
    'person_updated',
    'Updated family/person record ' || v_person.official_display_name,
    v_person.id,
    jsonb_build_object(
      'recordType', 'family_person',
      'old', jsonb_build_object(
        'officialDisplayName', v_existing_person.official_display_name,
        'phone', v_existing_person.phone,
        'notes', v_existing_person.notes
      ),
      'new', jsonb_build_object(
        'officialDisplayName', v_person.official_display_name,
        'phone', v_person.phone,
        'notes', v_person.notes
      )
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

revoke all on function public.update_customer_account(uuid, text, text, text, text, text) from public;
revoke all on function public.update_family_person(uuid, text, text, text) from public;
grant execute on function public.update_customer_account(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.update_family_person(uuid, text, text, text) to authenticated;
