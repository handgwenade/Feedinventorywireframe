# Deployment

This app is a Vite/React frontend backed by Supabase. Vercel is the recommended deployment target unless the project later adopts another hosting setup.

## Vercel Settings

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: Vercel default is fine

The current `vite.config.ts` uses standard Vite output and does not require deployment-specific changes.

## Environment Variables

Required frontend variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Local development should use:

```bash
.env.local
```

Production should set these variables in the Vercel project dashboard.

Never commit real environment values. The frontend must only use the Supabase anon/publishable key. Do not expose the Supabase service role key in Vite, Vercel frontend env vars, or client-side code.

## Supabase Auth URLs

In Supabase Auth URL Configuration:

- Site URL should be the production domain.
- Redirect URLs should include the production domain and local dev URLs.

Example placeholders:

```text
https://YOUR-PRODUCTION-DOMAIN/**
http://localhost:5173/**
http://localhost:5174/**
```

Do not hardcode the production URL in the app unless a future auth flow requires it.

## Database Migrations

Migrations have been live-applied manually so far. For future deployments, prefer a repeatable Supabase CLI process:

```bash
supabase db push
```

Database migrations are not automatically rolled back when a Vercel deployment is rolled back. Treat SQL changes as forward migrations and test them before production use.

## Post-Deploy Smoke Test

After deploying, test with a real authenticated user and production-safe test records.

Use [production-smoke-test.md](production-smoke-test.md) for the full production checklist, including read tests, write tests, Supabase verification queries, and manual findings notes.

Review [known-limitations.md](known-limitations.md) before calling a release fully complete so expected gaps are not confused with new regressions.

## Rollback Notes

- App rollback is handled in Vercel by promoting or restoring a previous deployment.
- Database migrations are not automatically rolled back.
- If a migration needs reversal, create an explicit follow-up migration.

## Security Notes

- Keep RLS enabled.
- Keep write behavior behind audited RPCs where possible.
- Never expose the Supabase service role key in frontend code.
- Only `VITE_SUPABASE_ANON_KEY` belongs in frontend environment variables.
- Keep `.env`, `.env.local`, and `.env.*.local` ignored by Git.
