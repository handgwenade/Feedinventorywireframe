# StockLog Data Persistence Audit

Date: 2026-06-13

## Summary

Most operational StockLog data is now persisted in Supabase and scoped by organization through RLS. Invited users with active `user_profiles` rows in the same `organization_id` should automatically see the same products, stock counts, accounts, invoices, payments, and activity as other users in that organization.

The main launch gap is not sharing between invited users. The gap is initial data: a newly created ranch has no products, K2 account, customer accounts, product categories, settings, invoices, payments, or activity until those records are created or imported for that organization.

## Audit Table

| Area | Source today | Organization-scoped? | Shared between users? | Risk | Recommended next step |
|---|---|---:|---:|---|---|
| Products / feed items | Supabase `products`; `productsService.list/create/update/archive` in `src/app/services/productsService.ts`; UI in `InventoryList.tsx`, `ProductDetail.tsx`, `ProductForm.tsx` | Yes. `products.organization_id` in `supabase/migrations/001_initial_schema.sql`; RLS filters by `current_organization_id()` | Yes, for active users in same org | New ranches start empty. `src/app/data/mockData.ts` still contains product examples but is not imported by app code | Build an org import/seed flow for products and optional categories before App Store launch |
| Stock quantities | Supabase `products.current_quantity`; stock changes via `add_product_stock`, `adjust_product_count`, and take-feed RPCs; services in `inventoryService.ts`, `takeFeedService.ts` | Yes. Products and `inventory_transactions` both have `organization_id`; RPCs verify active profile/org | Yes | In-progress cart quantities are local route state until submit; reload during flow loses cart but does not corrupt persisted stock | Keep submit-only persistence; consider draft cart persistence later if needed |
| Inventory activity/history | Supabase `inventory_transactions` and `activity_logs`; services in `inventoryTransactionsService.ts`, `activityService.ts`; screens `ProductDetail.tsx`, `ActivityHistory.tsx` | Yes. Both tables have `organization_id`; RLS filters reads | Yes | Activity enrichment calls only active products/accounts/people/invoices, so archived/deleted related names can display as unknown in some cases | Add archive-aware lookup helpers or denormalized names in activity metadata if historical fidelity matters |
| Accounts / customers / K2 | Supabase `accounts`; `accountsService.ts`; screens `AccountsList.tsx`, `ChooseCustomer.tsx`, `AddAccountPerson.tsx`, `EditAccountPerson.tsx` | Yes. `accounts.organization_id`; RPCs write with caller org | Yes | New ranches do not automatically get a K2 account. K2 statement RPC requires an active K2 account and will fail if none exists | Add default K2 account creation in new-ranch setup or first-run setup |
| People / family records | Supabase `people`; `peopleService.ts`; family/person routes are disabled for beta in `App.tsx` and migration `016_disable_family_person_rpcs.sql` | Yes | Yes, if re-enabled | UI has legacy report filters/labels for family/person, but active routes point to disabled screens | Keep disabled for beta or remove legacy filters/copy before launch |
| Invoices | Supabase `invoice_records` and `invoice_line_items`; `invoicesService.ts`; screens `InvoicesList.tsx`, `InvoiceDetail.tsx`, report screens | Yes. Both invoice tables have `organization_id`; RLS filters reads; RPCs write with caller org | Yes | `invoicesService.list()` excludes `family_use`, so legacy family records are not shown in normal invoice lists | Confirm this is intentional for beta; document as legacy behavior |
| Payments | Supabase `payments`; `paymentsService.ts`; screens `RecordPayment.tsx`, `PaymentRecorded.tsx`, `ReportPaymentsReceived.tsx` | Yes. `payments.organization_id`; payment RPC validates invoice/org | Yes | Payment success screen is route-state only after write; refresh can lose the confirmation state, but persisted payment remains | Accept for beta or add post-write redirect by payment/invoice id |
| Reports | Computed client-side from Supabase service reads; `ReportsList.tsx`, `ReportInventorySummary.tsx`, `ReportLowStock.tsx`, `ReportCustomerSales.tsx`, `ReportK2Use.tsx`, `ReportUnpaidInvoices.tsx`, `ReportPaymentsReceived.tsx` | Yes, inherited from underlying Supabase reads | Yes | Date filter chips are mostly UI-only; some report category filters infer category from product name because categories are not surfaced | Implement real report date filters and product category joins after data import is stable |
| User management | Supabase `user_profiles` and `user_invitations`; `userManagementService.ts`; `ManageUsers.tsx` | Yes | Yes for org admins/managers, subject to RLS | Frontend cannot read auth emails for existing profiles; shows "Email not available" | Add a backend admin read path if profile email display is needed |
| Settings | Local React state only in `Settings.tsx`; `app_settings` table exists but is not used | Table is org-scoped, UI is not persisted | No | Settings toggles reset and do not affect other users | Wire `app_settings` after core operational launch work |
| Mock/static data | `src/app/data/mockData.ts` contains demo users/products/accounts/invoices/payments/activity; current app code does not import it | No | No | Could be accidentally reused later; `EditUser.tsx` still has route fallback mock user, and some fallback copy mentions C&C Feed or Anderson Cattle Co. | Remove or quarantine mock data and replace direct-route fallbacks with empty/error states before App Store build |

## Questions Answered

### 1. Which data is currently read/written from Supabase?

- Products are read from `products` and written via `create_product`, `update_product`, and `archive_product` in `src/app/services/productsService.ts`.
- Stock adjustments are written via `add_product_stock` and `adjust_product_count` in `src/app/services/inventoryService.ts`.
- Take-feed customer/K2 flows write invoices, line items, inventory transactions, and activity through `src/app/services/takeFeedService.ts`.
- Accounts are read/written through `src/app/services/accountsService.ts`.
- Invoices and line items are read through `src/app/services/invoicesService.ts`; invoice status actions use RPCs.
- Payments are read/written through `src/app/services/paymentsService.ts`.
- Activity history is read through `src/app/services/activityService.ts`.
- Manage Users reads `user_profiles` and `user_invitations` through `src/app/services/userManagementService.ts`.

### 2. Which data is still mock/local/static/session-only?

- `src/app/data/mockData.ts` is static mock data. Current `rg` audit found no app imports from it.
- `src/app/components/EditUser.tsx` is local/mock; it falls back to a hardcoded Operator user and local permission toggles.
- `src/app/components/Settings.tsx` is local-only and explicitly says settings do not save to Supabase yet.
- In-progress carts and confirmation screens use route state in flows such as `AddProducts.tsx`, `K2AddProducts.tsx`, `ReviewInvoice.tsx`, `RecordPayment.tsx`, `InvoiceCreated.tsx`, and `PaymentRecorded.tsx`. The final submitted records persist, but the transient cart/confirmation state does not.
- Some fallback text is still ranch-specific, including `ProfileMenu.tsx` defaulting to `C&C Feed`, `InvoiceDetail.tsx` email text mentioning C&C Feed, and `ReviewInvoice.tsx` / `PaymentDetails.tsx` defaulting to Anderson Cattle Co. when directly navigated without route state.

### 3. Which records include `organization_id`?

The main org-scoped records are:

- `user_profiles`
- `product_categories`
- `products`
- `accounts`
- `people`
- `invoice_records`
- `invoice_line_items`
- `inventory_transactions`
- `payments`
- `activity_logs`
- `app_settings`
- `user_invitations`

These are defined in `supabase/migrations/001_initial_schema.sql` and `supabase/migrations/017_create_user_invitations.sql`.

### 4. Which screens filter by the signed-in user's `organization_id`?

The frontend usually does not add `organization_id` filters manually. Instead, Supabase RLS filters table reads by `public.current_organization_id()`, and security-definer RPCs fetch the active caller profile and write with `v_user_profile.organization_id`.

Examples:

- `productsService.list()` selects active `products`; RLS scopes rows.
- `accountsService.listActive()` selects active `accounts`; RLS scopes rows.
- `invoicesService.list()` selects `invoice_records`, `invoice_line_items`, `accounts`, and `people`; each table's RLS scopes rows.
- RPCs such as `create_customer_take_feed_invoice`, `create_k2_take_feed_statement`, `add_product_stock`, and `create_customer_account` explicitly validate the active caller profile and organization before writing.

### 5. If an invited user logs into the same organization, which data will they see automatically?

An invited user with `user_profiles.organization_id` matching the organization and `is_active = true` will automatically see org-scoped operational data allowed by RLS:

- Products and current stock quantities
- Accounts/customers/K2 accounts
- Invoices and invoice line items
- Payments
- Activity logs and inventory transactions
- Reports derived from those rows

Role-based writes are limited by RLS/RPC logic. Viewers can read but should not be able to write; operators can write operational records where allowed; managers/admins can manage more setup data.

### 6. Which data needs one-time migration/import before App Store launch?

- Existing real product/feed inventory rows and current quantities into `products`.
- Initial inventory ledger entries into `inventory_transactions` if historical movement is needed.
- Existing customers and K2 account into `accounts`.
- Open invoices, invoice line items, balances, and payment history into `invoice_records`, `invoice_line_items`, and `payments` if needed.
- Optional product categories into `product_categories`.
- Optional org settings into `app_settings` once Settings is wired.

New ranch signups currently create only `organizations` and an admin `user_profiles` row. They do not create default inventory, K2 account, product categories, or settings.

### 7. Are there places where mock data could accidentally appear in production?

Yes, mostly as direct-route fallbacks or static reference files:

- `src/app/data/mockData.ts` is still present, though unused by current imports.
- `src/app/components/EditUser.tsx` contains a hardcoded fallback user and local-only permission toggles.
- `src/app/components/Settings.tsx` contains local-only placeholder settings.
- `src/app/components/ProfileMenu.tsx`, `InvoiceDetail.tsx`, `ReviewInvoice.tsx`, and `PaymentDetails.tsx` still contain C&C/Anderson fallback copy.
- Reference/empty/disabled screens are static by design.

### 8. Are there places where data could leak across organizations?

No obvious leak was found in the audited operational flows. Reads are protected by RLS on org-scoped tables, and write RPCs validate the active user's profile and organization. Direct `.eq('id', ...)` lookups are still subject to RLS, so a guessed ID from another organization should not return a row to the anon client.

Residual risks to keep in mind:

- Any future service-role Edge Function must explicitly enforce organization checks, because service role bypasses RLS.
- Historical display fidelity can degrade if activity enrichment only looks up active related records.
- The current app relies on RLS rather than explicit frontend `organization_id` filters, so RLS regression tests are important before launch.

## Top Recommended Fixes

1. Build a one-time org import/seed path for products, current stock, K2 account, customers, open invoices, payments, and optional categories.
2. Remove or quarantine `src/app/data/mockData.ts` and replace `EditUser.tsx` / direct-route fallback demo data with real empty/error states.
3. Wire default new-ranch setup to create required defaults, especially a K2 account and any needed `app_settings`, or clearly gate K2 flows until setup is complete.
