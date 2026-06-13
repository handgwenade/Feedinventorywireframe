# Invite Onboarding Backend

StockLog invite onboarding is being built in stages. The first backend action is the `create-invite` Supabase Edge Function.

## `create-invite`

Path:

```text
supabase/functions/create-invite/index.ts
```

The function lets an active admin or manager create a pending invitation for their own organization. It requires a valid authenticated user JWT in the `Authorization` header and uses `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `INVITE_CODE_PEPPER` only inside the Edge Function runtime.

Input:

```json
{
  "email": "operator@example.com",
  "role": "operator",
  "expiresInDays": 7
}
```

Rules:

- Email is normalized to lowercase.
- `expiresInDays` defaults to 7 and is capped at 30.
- Admins may invite `admin`, `manager`, `operator`, or `viewer`.
- Managers may invite `manager`, `operator`, or `viewer`.
- Managers may not invite admins.
- The caller's `organization_id` and `created_by` are derived from the authenticated profile, not request input.
- Plain invite codes are generated once and returned once.
- Invite codes are normalized by trimming, uppercasing, and removing spaces/hyphens before hashing.
- Codes are HMAC-hashed with `INVITE_CODE_PEPPER` before being stored in `public.user_invitations.code_hash`.
- Future `accept-invite` must use the same normalization and HMAC-SHA-256 process.
- The plain invite code is not logged.
- A pending invitation conflict returns a clear error instead of replacing the existing invite.

Success response shape:

```json
{
  "invitation": {
    "id": "uuid",
    "email": "operator@example.com",
    "role": "operator",
    "status": "pending",
    "organizationId": "uuid",
    "expiresAt": "2026-06-20T00:00:00.000Z",
    "createdAt": "2026-06-13T00:00:00.000Z"
  },
  "inviteCode": "ABCDEFGH"
}
```

## Still Unwired

- Manage Users does not call `create-invite` yet.
- SignUpFlow does not validate or accept invite codes yet.
- `accept-invite` does not exist yet.
- No auth users are created by invite creation.
- No invite emails are sent yet.
- Invite expiration is enforced by future accept-invite logic; this function stores `expires_at`.

## Deploy Later

Deploy the function after the migration exists in Supabase:

```sh
supabase functions deploy create-invite
```

Set required function secrets in the Supabase project:

```sh
supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... INVITE_CODE_PEPPER=...
```
