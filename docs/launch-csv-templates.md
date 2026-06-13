# Launch CSV Templates

Use these templates to prepare C&C launch data for a local dry run before any Supabase import exists.

Templates live in:

- `import-templates/products.csv`
- `import-templates/accounts.csv`
- `import-templates/product_categories.csv`

Run the dry run with:

```bash
node scripts/import-launch-data.mjs
```

Or point at a copied folder:

```bash
node scripts/import-launch-data.mjs ./path/to/launch-csvs
```

The script only reads CSV files and prints validation results. It does not connect to Supabase, write data, or require service-role secrets.

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

## Recommended Workflow

1. Copy the templates to a working folder or edit the template files directly.
2. Replace example rows with the real C&C launch products, categories, and accounts.
3. Run `node scripts/import-launch-data.mjs`.
4. Fix every error and review warnings.
5. Keep the dry-run output with the launch import notes.

This is a preparation step only. A future write importer should reuse these validated CSVs and write through authenticated app-safe Supabase paths.
