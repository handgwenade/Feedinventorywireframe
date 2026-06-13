# Launch CSV Templates

Use these templates to prepare C&C launch data for a local dry run before importing approved rows into Supabase.

Templates live in:

- `import-templates/products.csv`
- `import-templates/accounts.csv`
- `import-templates/product_categories.csv`

## Commands

Dry run:

```bash
node scripts/import-launch-data.mjs
```

Write preview:

```bash
STOCKLOG_SUPABASE_URL=... STOCKLOG_SERVICE_ROLE_KEY=... STOCKLOG_TARGET_ORG_ID=... node scripts/import-launch-data.mjs --write
```

Confirm write:

```bash
STOCKLOG_SUPABASE_URL=... STOCKLOG_SERVICE_ROLE_KEY=... STOCKLOG_TARGET_ORG_ID=... node scripts/import-launch-data.mjs --write --confirm
```

Or point at a copied folder:

```bash
node scripts/import-launch-data.mjs ./path/to/launch-csvs
```

Dry run only reads CSV files and prints validation results. It does not connect to Supabase, write data, or require service-role secrets.

Write mode requires all three environment variables:

- `STOCKLOG_SUPABASE_URL`
- `STOCKLOG_SERVICE_ROLE_KEY`
- `STOCKLOG_TARGET_ORG_ID`

The service-role key is only for this local script. Never put it in frontend code, commit it, or paste it into docs or screenshots. The script does not print the key.

## Products CSV

Required columns:

- `name`
- `current_quantity`
- `minimum_quantity`
- `unit_label`
- `sale_price`

Optional columns:

- `category`
- `cost_per_unit`
- `sku`
- `vendor`
- `source_notes`

Rules:

- Product names must not be blank.
- Product names should be unique after trimming whitespace and ignoring case.
- `current_quantity` and `minimum_quantity` must be numbers greater than or equal to `0`.
- `sale_price` must be a number greater than or equal to `0`.
- Blank optional prices or costs can be left empty, but required `sale_price` should be filled before the live import.
- `category`, when present, should match a `name` in `product_categories.csv`.
- Existing products with the same name in the target organization are skipped in write mode. Updates can be added later with a future `--update` flag.

## Accounts CSV

Required columns:

- `account_type`
- `name`

Optional columns:

- `contact_name`
- `phone`
- `email`
- `billing_address`
- `notes`
- `is_active`

Rules:

- `account_type` must be `customer` or `k2`.
- Account names must not be blank.
- Include exactly one K2 account for launch.
- Customer rows with blank names are blocking errors.
- `is_active` can be `true`, `false`, `yes`, `no`, `1`, or `0`. Blank values default to active for dry-run counting.
- `contact_name` is preserved in account notes because the current Supabase table does not have a separate contact-name column.
- Existing accounts with the same `account_type` and `name` in the target organization are skipped in write mode.

## Product Categories CSV

Required columns:

- `name`

Optional columns:

- `slug`
- `sort_order`
- `is_active`

Rules:

- Category names must not be blank.
- Slugs should be lowercase URL-style values, such as `mineral` or `salt-blocks`.
- `sort_order`, when filled, must be a nonnegative whole number.
- `is_active` accepts the same boolean values as accounts.
- Blank slugs are generated from the category name.
- Existing categories with the same slug in the target organization are skipped in write mode.

## Recommended Workflow

1. Copy the templates to a working folder or edit the template files directly.
2. Replace example rows with the real C&C launch products, categories, and accounts.
3. Run `node scripts/import-launch-data.mjs`.
4. Fix every error and review warnings.
5. Run the write preview command and review inserted/skipped counts.
6. Run the confirm write command only after the CSV and preview are approved.
7. Keep the dry-run and write output with the launch import notes.

The importer currently writes only product categories, products, and accounts. It does not import invoices, payments, inventory history, or activity history.

Do not commit real CSV data, `.env` files, service-role keys, or production secrets.
