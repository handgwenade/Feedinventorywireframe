-- Invite records for StockLog onboarding.
--
-- Plain invite codes are never stored in this table. Only code_hash is stored.
-- code_hash is intended to be checked later by backend/Edge Function code.
-- Invite acceptance must be handled by backend service-role code later so auth user
-- creation, profile creation, and invite acceptance can be coordinated safely.

create table public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null,
  code_hash text not null,
  status text not null default 'pending',
  created_by uuid references public.user_profiles(id) on delete set null,
  accepted_by uuid references public.user_profiles(id) on delete set null,
  revoked_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  last_sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint user_invitations_role_check check (role in ('admin', 'manager', 'operator', 'viewer')),
  constraint user_invitations_status_check check (status in ('pending', 'accepted', 'revoked', 'expired')),
  constraint user_invitations_email_not_blank check (nullif(btrim(email), '') is not null),
  constraint user_invitations_code_hash_not_blank check (nullif(btrim(code_hash), '') is not null)
);

comment on table public.user_invitations is
  'Invite records for StockLog onboarding. Plain invite codes are never stored; only code_hash is stored.';

comment on column public.user_invitations.code_hash is
  'Hashed invite code. Must only be checked by backend/Edge Function code, not by anon client queries.';

comment on column public.user_invitations.status is
  'Invite lifecycle state. Prefer revoke/expire over deleting invite rows.';

create index user_invitations_organization_id_idx
on public.user_invitations(organization_id);

create index user_invitations_lower_email_idx
on public.user_invitations(lower(email));

create index user_invitations_status_expires_at_idx
on public.user_invitations(status, expires_at);

create index user_invitations_code_hash_idx
on public.user_invitations(code_hash);

create unique index user_invitations_unique_pending_email_per_org_idx
on public.user_invitations(organization_id, lower(email))
where status = 'pending';

alter table public.user_invitations enable row level security;

create policy "Admins and managers can read invitations in their organization"
on public.user_invitations
for select
to authenticated
using (
  organization_id = public.current_organization_id()
  and public.current_user_role() in ('admin', 'manager')
);

create policy "Admins can insert invitations in their organization"
on public.user_invitations
for insert
to authenticated
with check (
  organization_id = public.current_organization_id()
  and public.current_user_role() = 'admin'
);

create policy "Managers can insert non-admin invitations in their organization"
on public.user_invitations
for insert
to authenticated
with check (
  organization_id = public.current_organization_id()
  and public.current_user_role() = 'manager'
  and role in ('manager', 'operator', 'viewer')
);

create policy "Admins can update invitations in their organization"
on public.user_invitations
for update
to authenticated
using (
  organization_id = public.current_organization_id()
  and public.current_user_role() = 'admin'
)
with check (
  organization_id = public.current_organization_id()
  and public.current_user_role() = 'admin'
);

create policy "Managers can update non-admin invitations in their organization"
on public.user_invitations
for update
to authenticated
using (
  organization_id = public.current_organization_id()
  and public.current_user_role() = 'manager'
  and role in ('manager', 'operator', 'viewer')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_user_role() = 'manager'
  and role in ('manager', 'operator', 'viewer')
);

grant select (
  id,
  organization_id,
  email,
  role,
  status,
  created_by,
  accepted_by,
  revoked_by,
  created_at,
  expires_at,
  accepted_at,
  revoked_at,
  last_sent_at,
  metadata
) on public.user_invitations to authenticated;

grant insert, update on public.user_invitations to authenticated;
