# StockLog Organization Data Export

Use this local script to export current organization-scoped StockLog data from Supabase into CSV files. The exported files can help build reviewed launch import CSVs from live organization data instead of older Sortly data.

## Command

Help:

```bash
node scripts/export-org-data.mjs --help
```

Export:

```bash
STOCKLOG_SUPABASE_URL=... STOCKLOG_SERVICE_ROLE_KEY=... STOCKLOG_TARGET_ORG_ID=... node scripts/export-org-data.mjs
```

## Required Environment Variables

- `STOCKLOG_SUPABASE_URL`
- `STOCKLOG_SERVICE_ROLE_KEY`
- `STOCKLOG_TARGET_ORG_ID`

The service-role key is used only by this local read-only script. Do not put it in frontend code, commit it, paste it into docs, or share terminal output that contains it. The script does not print the key.

## Output Folder

Each run creates a timestamped folder:

```text
private-export/org-data-YYYY-MM-DD-HHMM/
```

`private-export/` is ignored by git. Treat everything in this folder as private operational data.

## Validated C&C Launch Snapshot

The current validated C&C export snapshot is:

```text
private-export/org-data-2026-06-13-1136
```

Dry-run validation passed after duplicate test products were removed from the launch CSV preparation flow:

- 19 products
- 4 product categories
- 3 customer accounts
- 1 K2 account

This folder is covered by the `private-export/` gitignore rule. Do not commit or reference private CSV contents. Do not write this export back into the same organization unless intentionally testing duplicate-skip behavior. Use it as the launch snapshot and as source material for a future production organization import.

## Exported CSVs

Always exported when the required tables exist:

- `products.csv`
- `accounts.csv`

Optional exports, skipped gracefully if the table is unavailable:

- `product_categories.csv`
- `invoices.csv` from `invoice_records`
- `payments.csv`

Every query is scoped with:

```text
organization_id = STOCKLOG_TARGET_ORG_ID
```

The script also writes a `README.md` inside the output folder with row counts and handling notes.

## Safety Notes

- The script does not write to Supabase.
- The script does not export secrets.
- User invitation `code_hash` values are never exported.
- Do not commit real CSV exports or `.env` files.
- Use exported data as source material for reviewed launch import CSVs, not as an automatic production restore.
