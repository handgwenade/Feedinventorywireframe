# GitHub Pages Setup for StockLog Public Docs

StockLog has public static pages prepared under:

- `public-site/index.html`
- `public-site/privacy-policy/index.html`
- `public-site/support/index.html`

These pages are intended for App Store Connect/TestFlight:

- Privacy Policy URL
- Support URL

## Recommended Setup

This repo includes a GitHub Actions workflow at:

```text
.github/workflows/pages.yml
```

The workflow publishes `public-site/` as the GitHub Pages artifact when files under `public-site/**` change on `main`.

In GitHub, enable Pages with:

```text
Settings -> Pages -> Source: GitHub Actions
```

Expected URLs after deployment:

```text
https://handgwenade.github.io/Feedinventorywireframe/
https://handgwenade.github.io/Feedinventorywireframe/privacy-policy/
https://handgwenade.github.io/Feedinventorywireframe/support/
```

Use these App Store Connect fields:

```text
Privacy Policy URL: https://handgwenade.github.io/Feedinventorywireframe/privacy-policy/
Support URL: https://handgwenade.github.io/Feedinventorywireframe/support/
```

## Fallback if GitHub Actions Pages Is Not Available

Some GitHub Pages configurations only support:

- repository root
- `/docs`
- GitHub Actions artifact, if enabled

If GitHub Actions Pages cannot be enabled, use one of these fallback paths:

1. Move or copy the public HTML files into `/docs` and serve GitHub Pages from `/docs`.
2. Serve from repository root only if it does not conflict with the app project.

GitHub Actions remains the preferred option because it keeps public App Store pages separate from internal project docs.

## Values to Finalize Before Publishing

Update the public HTML pages before using them in App Store Connect:

- Effective date.
- Support email.
- Support hours.
- Operator/legal entity.
- Mailing address, if applicable.
- Export/deletion request process.
- Final published Privacy Policy URL.
- Final published Support URL.

## Safety Notes

- Do not include service-role keys, Supabase secrets, invite hashes, private export files, or real customer data.
- Do not publish private C&C/customer/product CSV contents.
- Keep pages static and simple so they can be reviewed by App Store Connect without logging in.
