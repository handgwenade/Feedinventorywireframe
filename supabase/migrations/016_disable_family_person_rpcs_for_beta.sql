-- Disable legacy family/person RPCs for beta.
--
-- Family/person workflows are removed from the active app. Keep the function
-- signatures in place so stale clients fail with a clear message instead of
-- mutating old family/person data.

create or replace function public.create_family_take_feed_use(
  p_person_id uuid,
  p_notes text,
  p_items jsonb
)
returns table (
  family_use_id uuid,
  display_number text,
  subtotal numeric,
  total numeric,
  person_id uuid,
  person_name text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  raise exception 'Family/person workflows are disabled for beta.';
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
begin
  raise exception 'Family/person workflows are disabled for beta.';
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
begin
  raise exception 'Family/person workflows are disabled for beta.';
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
begin
  raise exception 'Family/person workflows are disabled for beta.';
end;
$$;

revoke all on function public.create_family_take_feed_use(uuid, text, jsonb) from public;
revoke all on function public.create_family_person(text, text, text) from public;
revoke all on function public.update_family_person(uuid, text, text, text) from public;
revoke all on function public.archive_family_person(uuid, text) from public;

grant execute on function public.create_family_take_feed_use(uuid, text, jsonb) to authenticated;
grant execute on function public.create_family_person(text, text, text) to authenticated;
grant execute on function public.update_family_person(uuid, text, text, text) to authenticated;
grant execute on function public.archive_family_person(uuid, text) to authenticated;
