# Sortly Product Import

This is a local/admin-only utility for importing the latest product snapshot from a Sortly transaction export into `public.products`.

It does not add an in-app uploader, app route, or UI. It uses authenticated Supabase RPCs and does not require a service-role key.

## Safety Rules

- Dry-run is the default.
- The script writes only when `--write` is passed.
- Use the production CSV carefully and keep a copy of the dry-run output.
- Use active products for matching by default.
- Archived products are not reactivated automatically.
- Real service-role keys must never be committed.
- Do not use service-role keys for this import.

## Required Migration

Before authenticated dry-run or write import, apply the import read RPC migration to the target Supabase project:

```bash
supabase db push
```

Or apply this SQL file manually in the Supabase SQL editor:

```text
supabase/migrations/013_import_products_read_rpc.sql
```

The migration adds `public.list_products_for_import()`, an authenticated-only RPC that requires an active admin or manager profile and returns active products in that user's organization for duplicate-safe import planning.

## Script

```bash
node scripts/import-sortly-products.mjs /path/to/sortly_export.csv
```

Default CSV path:

```text
/mnt/data/sortly_export.csv
```

The script loads Supabase connection values from `.env.local`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Sign in as an existing production admin or manager for authenticated dry-run and write import:

```bash
SORTLY_IMPORT_EMAIL="admin@example.com" \
SORTLY_IMPORT_PASSWORD="use-a-real-password-locally" \
node scripts/import-sortly-products.mjs /path/to/sortly_export.csv
```

Do not commit import passwords or service-role keys.

## Dry Run

Run dry-run first:

```bash
node scripts/import-sortly-products.mjs /mnt/data/sortly_export.csv
```

If you only need to verify CSV parsing and the latest snapshot count before authenticating against Supabase:

```bash
node scripts/import-sortly-products.mjs /mnt/data/sortly_export.csv --csv-only
```

CSV-only mode does not read Supabase, so create/update matching and duplicate checks are incomplete. Use a normal authenticated dry-run before writing.

Expected dry-run output includes:

- CSV columns detected
- column mapping
- transaction row count
- latest product snapshot count
- products to create
- products to update
- products skipped
- products with blank price
- possible duplicate active name warnings

The provided Sortly export is expected to collapse from about 202 transaction rows to about 14 latest product snapshots.

## Write Import

After reviewing dry-run output:

```bash
SORTLY_IMPORT_EMAIL="admin@example.com" \
SORTLY_IMPORT_PASSWORD="use-a-real-password-locally" \
node scripts/import-sortly-products.mjs /mnt/data/sortly_export.csv --write
```

The script writes through existing app RPCs:

- `create_product` for new products, including initial quantity
- `update_product` for existing product details
- `adjust_product_count` for existing product quantity changes

The app's normal `update_product` RPC intentionally does not change current quantity, so existing product quantity changes go through `adjust_product_count`. Normal app users should keep using Add Stock and Adjust Count after this one-time import.

No service-role key is needed or supported.

## Matching Rules

The script matches in this order:

1. Sortly ID stored in `source_notes`.
2. Active product name.
3. Create a missing product.

If multiple active products have the same normalized name, the script skips that product and prints a duplicate warning.

The import read RPC returns active products only, so archived products are not matched or reactivated automatically.

## Field Mapping

- Product name -> `products.name`
- Current quantity -> `products.current_quantity`
- Minimum/reorder quantity -> `products.minimum_quantity`
- Price/value -> `products.sale_price`
- Vendor/source/details -> `products.vendor` when a clear vendor/source column exists
- Sortly ID, barcode/QR, original item name, latest transaction date/type, folder/location, and transaction notes -> `products.source_notes`
- Unit label -> `products.unit_label`, defaulting to `units`

Blank prices are imported as `0` for now. Blank minimum/reorder quantities are imported as `0`.

## Expected Product Snapshot

The latest product snapshot from the current Sortly export should include approximately:

- Garlic Salt Blocks — 247 units — min 50 — $17.15
- Minex Pro G Mineral W/ Garlic — 64 units — min 50 — $45.70
- Minex Pro Mineral w/ Probiotien — 16 units — min 50 — $41.40
- Redmond Beef Mineral Mix — 100 units — min 25 — $18.61
- Redmond Mineral Salt (4 Medium) — 200 units — min 50 — $9.79
- Redmond Natural Livestock Mineral Conditioner, 50 lbs — 235 units — min 50 — $12.87
- Redmond SR50 Sea Mineral — 16 units — min 50 — $12.94
- Redmond Trace Mineral Salt with Garlic, 50 lbs — 209 units — min 50 — $17.41
- RumenEdge Tubs (Medium) — 4 units — min 12 — $123.70
- Salt Blocks — 69 units — min 50 — blank price / 0
- SweetPro 16 — 18 units — min 8 — $154.00
- SweetPro Cattle Kandi Stress — 3 units — min 1 — blank price / 0
- SweetPro FiberMate 20 — 6 units — min 8 — $154.00
- SweetPro FiberMate 20 Garlic — 0 units — min 8 — blank price / 0

## Known Ambiguities

Sortly transaction exports can vary by export settings. Confirm the dry-run column mapping before writing, especially:

- Whether `quantity` means current on-hand quantity or transaction movement quantity.
- Whether `value` means unit price or total inventory value.
- Whether folder/location should be treated as vendor or only source metadata.
- Whether Sortly ID is present and stable across exports.

## After Import

After a write import:

1. Run the Inventory screen smoke test.
2. Spot-check Product Detail for several imported products.
3. Run the product quantity verification query in `docs/production-smoke-test.md`.
4. Keep using app workflows for future inventory changes.
