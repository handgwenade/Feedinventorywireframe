# StockLog Launch Data Import Plan for C&C Feed

Date: 2026-06-13

## Goal

Load C&C Feed's real launch data into Supabase so the live StockLog app starts with useful inventory, accounts, and working K2/customer workflows instead of an empty organization.

This is a plan only. Do not run imports directly against production until the CSVs have been reviewed, a backup exists, and a dry run has passed.

## Recommended Approach

Use the simplest safe import first:

1. Create or identify the C&C Feed organization.
2. Import product categories if C&C wants category filtering.
3. Import products/feed items with current stock quantities.
4. Create the K2 account.
5. Import active customer accounts.
6. Skip historical activity, invoices, and payments unless they are required for day-one operations.

The current app is already Supabase-backed and organization-scoped for operational data. The launch risk is blank initial data, not cross-user sharing.

## Minimum Viable Import for Beta Launch

The minimum useful beta import is:

- Product categories, optional but recommended.
- Products/feed items.
- Current stock quantities on each product.
- One active K2 account.
- Active customer accounts.
- Basic app settings/defaults only if the app starts reading `app_settings`.

Skip for beta unless C&C explicitly needs it:

- Historical inventory activity.
- Closed invoices.
- Full payment history.
- Old family/person records.
- Detailed historical invoice line items.

## Import Order

1. Confirm the target `organizations.id` for C&C Feed.
2. Confirm at least one admin `user_profiles` row exists for that organization.
3. Import `product_categories`.
4. Import `products` with current quantities.
5. Create initial `inventory_transactions` for opening stock if historical traceability is desired.
6. Import `accounts` for K2 and active customers.
7. Import open invoices and line items if needed.
8. Import payments only if importing invoices/payment history.
9. Insert app settings if wired.
10. Run validation queries.
11. Have C&C verify in the app before inviting wider users.

## Area Plans

### 1. Products / Feed Items

Source data needed from C&C:

- Product/feed item name.
- Current stock quantity.
- Unit label, such as `bags`, `blocks`, `tubs`, `tons`, or `units`.
- Sale price.
- Minimum quantity.
- Category, if used.

Target Supabase table/RPC:

- Preferred for a controlled script: `public.products`.
- App-style path: `create_product` RPC from `supabase/migrations/010_product_create_update_rpcs.sql`.

Required fields:

- `organization_id`
- `name`
- `unit_label`
- `current_quantity`
- `minimum_quantity`
- `sale_price`
- `is_active = true`

Optional fields:

- `category_id`
- `sku`
- `cost_per_unit`
- `vendor`
- `source_notes`

Validation checks:

- No blank product names.
- No duplicate names unless C&C intentionally stocks separate variants.
- Quantities are numeric and nonnegative.
- Minimum quantities are numeric and nonnegative.
- Sale prices are numeric and nonnegative.
- Units are consistent enough for reporting.
- Category names match the category CSV or are blank.

Risk/notes:

- If imported directly into `products`, initial stock does not automatically create an inventory ledger row. This is acceptable for a simple launch, but less complete for audit history.
- If imported through `create_product`, it creates an initial `inventory_transactions` row for positive current quantity.
- Product categories exist in schema, but current UI/report filters mostly infer categories from product names unless category joins are added later.

### 2. Current Stock Quantities

Source data needed from C&C:

- Product name or SKU.
- Physical count at cutoff time.
- Unit label.
- Count date/time.
- Who verified the count.

Target Supabase table/RPC:

- `public.products.current_quantity`.
- Optional opening ledger rows in `public.inventory_transactions`.
- App-style adjustment path: `adjust_product_count` RPC from `supabase/migrations/008_adjust_product_count_rpc.sql`.

Required fields:

- Product match key, ideally SKU or exact product name.
- `current_quantity`

Optional fields:

- Count note.
- Verified by.
- Count timestamp.

Validation checks:

- Every stock row matches exactly one product.
- No negative quantities.
- Total inventory value spot-checks match C&C expectations.
- Low-stock report looks plausible after import.

Risk/notes:

- Current quantity is the operational source of truth in the app.
- Historical movement is optional. The app can start with opening quantities and record activity from launch forward.

### 3. Product Categories

Source data needed from C&C:

- Category names, such as Blocks, Mineral, Tubs, Salt, Supplement.
- Desired display order.

Target Supabase table/RPC:

- `public.product_categories`.

Required fields:

- `organization_id`
- `name`
- `slug`
- `sort_order`
- `is_active = true`

Optional fields:

- None currently needed.

Validation checks:

- Unique slug per organization.
- Every product category reference resolves to a category.
- Sort order is stable.

Risk/notes:

- Categories are supported by schema, but not deeply surfaced everywhere in UI.
- If C&C does not have clean categories yet, skip category import and import products without `category_id`.

### 4. K2 Account

Source data needed from C&C:

- Confirm desired K2 account display name, likely `K2`.
- Optional notes.

Target Supabase table/RPC:

- `public.accounts`, `account_type = 'k2'`.

Required fields:

- `organization_id`
- `account_type = 'k2'`
- `name`
- `is_active = true`

Optional fields:

- `phone`
- `email`
- `billing_address`
- `notes`

Validation checks:

- Exactly one active K2 account exists for the C&C organization unless there is an intentional reason for more.
- K2 take-feed workflow can create a statement after import.

Risk/notes:

- The K2 statement RPC requires an active K2 account and fails if none exists.
- This should be part of the minimum beta import.

### 5. Customer Accounts

Source data needed from C&C:

- Customer/account name.
- Phone.
- Email.
- Billing address.
- Notes.
- Active/inactive status.

Target Supabase table/RPC:

- `public.accounts`, `account_type = 'customer'`.
- App-style path: `create_customer_account` RPC from `supabase/migrations/009_create_account_person_rpcs.sql`.

Required fields:

- `organization_id`
- `account_type = 'customer'`
- `name`
- `is_active`

Optional fields:

- `phone`
- `email`
- `billing_address`
- `notes`

Validation checks:

- No blank names.
- Duplicate customer names reviewed before import.
- Active customers appear in Accounts and Choose Customer screens.
- Archived/inactive customers are not visible in normal pickers unless intentionally supported.

Risk/notes:

- Customer accounts are needed for customer invoices.
- Import active customers first. Inactive historical customers can wait.

### 6. Open Invoices / Balances

Source data needed from C&C:

- Invoice number or display number.
- Customer account.
- Issue date.
- Line items, if available.
- Subtotal, tax, total, balance due.
- Status: unpaid, partial, paid, overdue, void, etc.
- Notes.

Target Supabase table/RPC:

- `public.invoice_records`.
- `public.invoice_line_items`.

Required fields:

- `organization_id`
- `display_number`
- `record_type = 'customer_invoice'`
- `account_id`
- `issue_date`
- `subtotal`
- `tax`
- `total`
- `balance_due`
- `status`

Optional fields:

- `notes`
- `created_by`
- Detailed `invoice_line_items`

Validation checks:

- Every invoice account maps to exactly one customer account.
- `total = subtotal + tax`.
- `balance_due <= total`.
- Status matches balance.
- Display numbers are unique per organization.
- Unpaid invoice report total matches C&C's expected open balance.

Risk/notes:

- Importing open balances without line items is possible but less useful in invoice detail.
- If historical invoice detail is messy, beta can start without old invoices and only track new StockLog invoices from launch.

### 7. Payment History

Source data needed from C&C:

- Payment date.
- Invoice number.
- Amount.
- Method: cash, check, card, transfer, other.
- Reference/check number.
- Notes.

Target Supabase table/RPC:

- `public.payments`.
- If applying payments to imported open invoices, also update `invoice_records.balance_due` and `status`.

Required fields:

- `organization_id`
- `invoice_record_id`
- `amount`
- `method`
- `received_at`

Optional fields:

- `reference_number`
- `notes`
- `received_by`

Validation checks:

- Every payment maps to an imported invoice.
- Payment total by invoice does not exceed invoice total unless intentionally correcting legacy data.
- Payment report total matches C&C source report.
- Invoice balances after payments match expected open balances.

Risk/notes:

- Payment history is not required if only open balances are imported as current balances.
- Importing payments increases reconciliation complexity.

### 8. Inventory Activity / History

Source data needed from C&C:

- Historical stock additions.
- Historical feed taken.
- Product.
- Quantity change.
- Quantity before/after, if available.
- Source invoice/statement, if available.
- Date/time.
- Notes.

Target Supabase table/RPC:

- `public.inventory_transactions`.
- `public.activity_logs`.

Required fields:

- `organization_id`
- `product_id`
- `transaction_type`
- `quantity_change`
- `quantity_before`
- `quantity_after`
- `created_at`

Optional fields:

- `unit_price`
- `source_record_type`
- `source_record_id`
- `notes`
- `created_by`
- Matching `activity_logs` entries.

Validation checks:

- Quantity chain reconciles to current product quantity.
- No impossible negative after-counts.
- Activity dates are sane.
- Product IDs resolve.

Risk/notes:

- Historical inventory import is the highest-effort, highest-risk import.
- Recommended beta path is to import opening quantities and start activity history from launch day.

### 9. App Settings / Defaults

Source data needed from C&C:

- Default landing screen.
- Low-stock alert preference.
- Product sort preference.
- Invoice due terms.
- Tax default.
- Print/PDF preferences.

Target Supabase table/RPC:

- `public.app_settings`.

Required fields:

- `organization_id`
- `setting_key`
- `setting_value`

Optional fields:

- `updated_by`

Validation checks:

- Setting keys are unique per organization.
- JSON values are valid.
- UI actually reads the setting before relying on it.

Risk/notes:

- Current Settings UI is local-only and does not read/write `app_settings`.
- Do not spend launch time importing settings until the UI uses them.

## Recommended CSV Templates

### `product_categories.csv`

```csv
name,slug,sort_order,is_active
Blocks,blocks,1,true
Mineral,mineral,2,true
Tubs,tubs,3,true
Salt,salt,4,true
Supplement,supplement,5,true
```

### `products.csv`

```csv
name,sku,category_slug,unit_label,current_quantity,minimum_quantity,sale_price,cost_per_unit,vendor,source_notes,is_active
Garlic Salt Blocks,,blocks,units,247,25,17.15,12.50,,Opening launch import,true
```

### `accounts.csv`

```csv
account_type,name,phone,email,billing_address,notes,is_active
k2,K2,,,,Separate cattle-side account,true
customer,Anderson Cattle Co.,555-123-4567,anderson@example.com,,Launch import,true
```

### `open_invoices.csv`

```csv
display_number,account_name,issue_date,subtotal,tax,total,balance_due,status,notes
INV-1001,Anderson Cattle Co.,2026-06-01,171.50,0,171.50,171.50,unpaid,Imported open balance
```

### `invoice_line_items.csv`

```csv
display_number,product_name,description,quantity,unit_label,unit_price,line_total
INV-1001,Garlic Salt Blocks,Garlic Salt Blocks,10,units,17.15,171.50
```

### `payments.csv`

```csv
display_number,received_at,amount,method,reference_number,notes
INV-1001,2026-06-05,50.00,check,1234,Imported payment
```

### `opening_inventory_transactions.csv`

```csv
product_name,transaction_type,quantity_change,quantity_before,quantity_after,unit_price,notes,created_at
Garlic Salt Blocks,add_stock,247,0,247,,Opening launch quantity,2026-06-13T08:00:00-06:00
```

### `app_settings.csv`

```csv
setting_key,setting_value_json
low_stock_alerts_enabled,{"enabled":true}
default_product_sort,{"value":"name_asc"}
```

## Launch Checklist

Before import:

- Confirm target Supabase project.
- Confirm production `organizations.id` for C&C Feed.
- Confirm first admin can log in and has active `user_profiles` row.
- Export all C&C source data to CSV.
- Review CSVs for duplicates, blanks, invalid numbers, and stale records.
- Take a Supabase backup or snapshot.
- Run a dry run in a staging Supabase project.

During import:

- Import in the defined order.
- Record imported row counts.
- Save import logs.
- Stop on first validation failure.
- Do not invite wider users until validation passes.

After import:

- Admin logs into app.
- Confirm Inventory count and value.
- Confirm Low Stock report.
- Confirm K2 workflow can create a statement.
- Confirm customer invoice workflow can create an invoice.
- Confirm Accounts list has expected active customers.
- Confirm Reports load without errors.
- Confirm no demo/mock records appear.

## Rollback / Safety Plan

Preferred safety approach:

- Dry run against staging first.
- Back up production before import.
- Include an `import_batch_id` in `source_notes`, `notes`, or metadata where possible.
- Keep source CSVs immutable after approval.

If import must be rolled back:

1. Disable app access or pause user testing.
2. Restore from Supabase backup if the import touched many tables or relationships.
3. For small controlled imports, delete rows by organization and batch marker in reverse order:
   - `payments`
   - `invoice_line_items`
   - `invoice_records`
   - `inventory_transactions`
   - `activity_logs`
   - `products`
   - `product_categories`
   - non-user `accounts`
   - `app_settings`
4. Re-run validation queries.
5. Re-import only after corrected CSVs are approved.

Important:

- Avoid manual partial deletes unless foreign-key relationships are fully understood.
- Do not delete `organizations`, `user_profiles`, or auth users as part of normal data rollback.

## Validation Queries to Prepare

Prepare SQL checks before importing:

- Count products by organization.
- Count active accounts by type.
- Sum product inventory value.
- Find products with negative or null quantities.
- Find duplicate product names.
- Find duplicate customer names.
- Confirm exactly one active K2 account.
- Count open invoices and sum balance due.
- Find invoice rows with missing account IDs.
- Find line items with missing invoice IDs.
- Confirm all imported rows have the target `organization_id`.

## Final Recommendation

For beta/App Store readiness, do not attempt to recreate full history unless C&C needs historical invoices in the app on day one. The safer launch path is:

1. Import products with current quantities.
2. Create the K2 account.
3. Import active customers.
4. Start all invoice, payment, and inventory activity history from StockLog launch day.
