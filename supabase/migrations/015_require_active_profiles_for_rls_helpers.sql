-- Require active app profiles for shared RLS helpers.
--
-- Frontend guards can hide the app from disabled users, but RLS must also avoid
-- treating an inactive authenticated user as a valid organization member.
-- These helpers now return null/false unless the auth user has an active
-- public.user_profiles row.

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.user_profiles
  where auth.uid() is not null
    and id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_profiles
  where auth.uid() is not null
    and id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.current_user_can_write()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'manager', 'operator'), false);
$$;

create or replace function public.current_user_can_manage()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'manager'), false);
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;
