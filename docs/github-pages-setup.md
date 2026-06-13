# GitHub Pages Setup for StockLog Public Docs

StockLog has public static pages prepared under:

- `public-site/index.html`
- `public-site/privacy-policy/index.html`
- `public-site/support/index.html`

These pages are intended for App Store Connect/TestFlight:

- Privacy Policy URL
- Support URL

## Recommended Setup

If the repository supports GitHub Pages with a custom source folder or GitHub Actions, use one of these approaches:

1. Configure GitHub Pages to publish the static files in `public-site/`.
2. Use GitHub Actions to upload `public-site/` as the Pages artifact.

GitHub Pages settings are usually found under:

```text
Repository Settings > Pages
```

Recommended URLs after publishing:

```text
https://[owner].github.io/[repo]/privacy-policy/
https://[owner].github.io/[repo]/support/
```

Replace `[owner]` and `[repo]` with the real GitHub owner and repository name.

## Fallback if `/public-site` Cannot Be Served Directly

Some GitHub Pages configurations only support:

- repository root
- `/docs`
- GitHub Actions artifact

If `/public-site` cannot be selected directly, use one of these fallback paths:

1. Move or copy the public HTML files into `/docs` and serve GitHub Pages from `/docs`.
2. Add a GitHub Actions workflow later that publishes `public-site/` as the Pages artifact.
3. Serve from repository root only if it does not conflict with the app project.

GitHub Actions is the cleanest long-term option because it keeps public App Store pages separate from internal project docs.

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
