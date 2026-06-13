# Ranch Onboarding Backend

StockLog's new-ranch onboarding foundation is handled by the `create-ranch` Supabase Edge Function.

## `create-ranch`

Path:

```text
supabase/functions/create-ranch/index.ts
```

The function lets a brand-new user create the first StockLog organization/ranch and become that organization's active admin profile.

Input:

```json
{
  "ranchName": "C&C Feed",
  "fullName": "Gwen Johnson",
  "email": "gwen@example.com",
  "password": "strong-password"
}
```

Rules:

- Accepts only `POST` and handles CORS `OPTIONS`.
- Uses `STOCKLOG_SUPABASE_URL` and `STOCKLOG_SERVICE_ROLE_KEY` inside the Edge Function runtime.
- Requires `ranchName`, `fullName`, a valid `email`, and a password of at least 8 characters.
- Normalizes email by trimming and lowercasing.
- Creates the Supabase auth user with the service-role admin API.
- Creates `public.organizations` with `name = ranchName`.
- Creates `public.user_profiles` with:
  - `id = auth user id`
  - `organization_id = new organization id`
  - `display_name = fullName`
  - `role = admin`
  - `is_active = true`
- Does not log or return the password.
- If the auth user already exists, returns a safe sign-in-oriented error.

Success response shape:

```json
{
  "organizationId": "uuid",
  "ranchName": "C&C Feed",
  "role": "admin",
  "displayName": "Gwen Johnson",
  "email": "gwen@example.com"
}
```

Cleanup behavior:

- If organization creation fails after auth user creation, the function attempts to delete the auth user.
- If profile creation fails after auth user and organization creation, the function attempts to delete both the auth user and organization.
- If cleanup fails, the function logs only non-sensitive ids and returns a safe support-style error.

## Still Unwired

- The signup UI can call `create-ranch` from the "Set up a new ranch" path.
- No new-ranch rate limiting, CAPTCHA, allowlist, or abuse controls are wired yet.
- No default `app_settings` rows are created yet.
- Invite creation and invite acceptance are unchanged.

## Deploy Later

Deploy the function:

```sh
supabase functions deploy create-ranch
```

Set required function secrets:

```sh
supabase secrets set STOCKLOG_SUPABASE_URL=... STOCKLOG_SERVICE_ROLE_KEY=...
```
