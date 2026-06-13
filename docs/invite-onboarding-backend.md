# Invite Onboarding Backend

StockLog invite onboarding is being built in stages. The backend now has Edge Functions for creating and accepting invitations.

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

- Manage Users can call `create-invite`, but invite emails are not sent yet.
- SignUpFlow can call `accept-invite` from the "Join an existing ranch" path.
- No auth users are created by invite creation.
- No invite emails are sent yet.
- New-ranch setup has a backend foundation in `create-ranch`, and the signup UI can call it from the "Set up a new ranch" path.

## `accept-invite`

Path:

```text
supabase/functions/accept-invite/index.ts
```

The function lets an invited user submit their invite code, email, name, and password. It uses service-role credentials inside the Edge Function runtime to create the Supabase auth user, create the matching `public.user_profiles` row, and mark the invitation accepted.

Input:

```json
{
  "fullName": "Operator User",
  "email": "operator@example.com",
  "password": "strong-password",
  "inviteCode": "ABCDEFGH"
}
```

Rules:

- Accepts only `POST` and handles CORS `OPTIONS`.
- Requires `fullName`, valid `email`, `password` of at least 8 characters, and `inviteCode`.
- Email is normalized to lowercase.
- Invite codes are normalized by trimming, uppercasing, and removing spaces/hyphens.
- Invite codes are HMAC-hashed with `INVITE_CODE_PEPPER`, using the same process as `create-invite`.
- The invite must be pending, unexpired, and tied to the submitted email.
- The user profile role and organization come from the invite, not request input.
- If profile creation fails after auth user creation, the function attempts to delete the auth user.
- The function does not return `code_hash`, password, pepper, or service-role details.

Success response shape:

```json
{
  "organizationId": "uuid",
  "role": "operator",
  "displayName": "Operator User",
  "email": "operator@example.com"
}
```

## Deploy Later

Deploy the functions after the migration exists in Supabase:

```sh
supabase functions deploy create-invite
supabase functions deploy accept-invite
```

Set required function secrets in the Supabase project. `create-invite` currently uses Supabase's standard names, while `accept-invite` uses StockLog-prefixed names:

```sh
supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... INVITE_CODE_PEPPER=...
supabase secrets set STOCKLOG_SUPABASE_URL=... STOCKLOG_SERVICE_ROLE_KEY=... INVITE_CODE_PEPPER=...
```
