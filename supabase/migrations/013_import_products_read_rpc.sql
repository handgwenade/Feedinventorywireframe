create or replace function public.list_products_for_import()
returns table (
  id uuid,
  category_id uuid,
  name text,
  unit_label text,
  current_quantity numeric,
  minimum_quantity numeric,
  sale_price numeric,
  vendor text,
  source_notes text,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_profile public.user_profiles%rowtype;
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
    raise exception 'Only admins and managers can list products for import.';
  end if;

  return query
  select
    p.id,
    p.category_id,
    p.name,
    p.unit_label,
    p.current_quantity,
    p.minimum_quantity,
    p.sale_price,
    p.vendor,
    p.source_notes,
    p.is_active
  from public.products as p
  where p.organization_id = v_user_profile.organization_id
    and p.is_active = true
  order by p.name;
end;
$$;

revoke all on function public.list_products_for_import() from public;
grant execute on function public.list_products_for_import() to authenticated;
