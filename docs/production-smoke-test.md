# Production Smoke Test

Use this checklist after a production deployment to confirm StockLog (app) / C&C Feed (organization) Inventory can read and write the core production workflows.

Run smoke tests with intentionally small test records and low quantities. Do not use real customer transactions unless the test is also a real business event.

## Pre-Test Setup

Tester:

Date:

Production URL:

Supabase project:

Vercel deployment:

### Confirm Production URL

- [ ] Open the production Vercel URL.
- [ ] Confirm the app loads without console-blocking errors.
- [ ] Confirm the URL is the intended production domain, not a preview deployment.

### Confirm Supabase Auth URLs

In Supabase Auth URL Configuration:

- [ ] Site URL is set to the production domain.
- [ ] Redirect URLs include the production domain.
- [ ] Redirect URLs include local development URLs used by the project.
- [ ] Login and logout flows return to the expected production URL.

### Confirm Vercel Environment Variables

In the Vercel production environment:

- [ ] `VITE_SUPABASE_URL` points to the production Supabase project.
- [ ] `VITE_SUPABASE_ANON_KEY` is set.
- [ ] No service role or secret key is exposed to frontend environment variables.
- [ ] The latest production deployment was built after any environment variable changes.

### Test Data Rules

- [ ] Use clearly named test records, such as `Smoke Test Customer` or `Smoke Test Product`.
- [ ] Use low quantities, usually `1`.
- [ ] Use a test payment amount, usually `$1`.
- [ ] Record product names, account names, and invoice IDs created during the test.
- [ ] Archive test products, customers, and family people at the end where the app allows it.

## Login Test

- [ ] Open the production URL.
- [ ] Log in with a production test/admin user.
- [ ] Confirm the authenticated app shell loads.
- [ ] Confirm the signed-in user/profile menu appears.
- [ ] Sign out.
- [ ] Log back in successfully.

Pass / Fail:

Notes:

## Read Tests

### Dashboard

- [ ] Dashboard loads.
- [ ] Inventory summary values appear.
- [ ] Recent activity or workflow cards appear.

Pass / Fail:

Notes:

### Inventory

- [ ] Inventory list loads.
- [ ] Active products are visible.
- [ ] Quantities display.
- [ ] Product search/filter controls work where available.

Pass / Fail:

Notes:

### Product Detail

- [ ] Open a product from Inventory.
- [ ] Product detail loads.
- [ ] Quantity, minimum quantity, pricing, and status fields display as expected for the current role.
- [ ] Recent product activity or transactions display where available.

Pass / Fail:

Notes:

### Accounts

- [ ] Accounts list loads.
- [ ] Customer accounts are visible.
- [ ] K2 account is visible where applicable.
- [ ] Family/person records are reachable from the expected area.

Pass / Fail:

Notes:

### Account Detail

- [ ] Open a customer account detail page.
- [ ] Contact details, balance, and related records load.
- [ ] Open a K2 account/detail view where applicable.
- [ ] Open a family/person detail view where applicable.

Pass / Fail:

Notes:

### Invoices

- [ ] Invoices list loads.
- [ ] Recent invoices/statements/use records appear.
- [ ] Status and balance values display.

Pass / Fail:

Notes:

### Invoice Detail

- [ ] Open a recent customer invoice.
- [ ] Line items, totals, payments, balance, and status display.
- [ ] Open a K2 statement or family use record where applicable.

Pass / Fail:

Notes:

### Reports

- [ ] Reports page loads.
- [ ] Inventory, sales/payment, customer, K2, and family sections display where applicable.
- [ ] Confirm any static/wireframe report sections are noted in the findings.

Pass / Fail:

Notes:

### Activity History

- [ ] Activity History loads.
- [ ] Recent activity is visible.
- [ ] Activity details open where available.
- [ ] User, action, and related record context are understandable.

Pass / Fail:

Notes:

## Write Tests

Record IDs and names for every item created during these tests.

### Create Customer Invoice With 1 Unit

- [ ] Start Take Feed.
- [ ] Choose Customer.
- [ ] Select or create a clearly named test customer.
- [ ] Add one product with quantity `1`.
- [ ] Submit the invoice.
- [ ] Confirm the invoice detail page or confirmation state appears.
- [ ] Confirm inventory quantity decreased by `1`.
- [ ] Confirm Activity History records the action.

Pass / Fail:

Record ID:

Notes:

### Record $1 Payment

- [ ] Open the customer invoice created above.
- [ ] Record a `$1` payment.
- [ ] Confirm invoice balance/status updates correctly.
- [ ] Confirm payment appears on the invoice detail page.
- [ ] Confirm Activity History records the payment.

Pass / Fail:

Record ID:

Notes:

### K2 Statement With 1 Unit

- [ ] Start Take Feed.
- [ ] Choose K2.
- [ ] Add one product with quantity `1`.
- [ ] Submit the K2 statement.
- [ ] Confirm inventory quantity decreased by `1`.
- [ ] Confirm the K2 record appears in invoices/statements where expected.
- [ ] Confirm Activity History records the action.

Pass / Fail:

Record ID:

Notes:

### Family Use With 1 Unit

- [ ] Start Take Feed.
- [ ] Choose Family.
- [ ] Select a clearly named test family person or an existing safe test person.
- [ ] Add one product with quantity `1`.
- [ ] Submit the family use record.
- [ ] Confirm inventory quantity decreased by `1`.
- [ ] Confirm the family use record appears where expected.
- [ ] Confirm Activity History records the action.

Pass / Fail:

Record ID:

Notes:

### Add Stock +1

- [ ] Open Add Stock.
- [ ] Select a product safe for testing.
- [ ] Add quantity `1`.
- [ ] Submit the stock addition.
- [ ] Confirm inventory quantity increased by `1`.
- [ ] Confirm Activity History records the action.

Pass / Fail:

Record ID:

Notes:

### Adjust Count By 1

- [ ] Open Adjust Count for a product safe for testing.
- [ ] Adjust the count by `1`.
- [ ] Submit the adjustment.
- [ ] Confirm the product quantity changed correctly.
- [ ] Confirm Activity History records the action.

Pass / Fail:

Record ID:

Notes:

### Create, Edit, And Archive Test Product

- [ ] Create a product named clearly as a smoke test product.
- [ ] Confirm it appears in Inventory.
- [ ] Edit at least one safe field, such as notes, minimum quantity, or display name.
- [ ] Confirm the edit persists after refresh.
- [ ] Archive the test product.
- [ ] Confirm archived product behavior matches the app's expected UI.
- [ ] Confirm Activity History records create/edit/archive actions where applicable.

Pass / Fail:

Product ID:

Notes:

### Create, Edit, And Archive Test Customer

- [ ] Create a customer named clearly as a smoke test customer.
- [ ] Confirm it appears in Accounts.
- [ ] Edit at least one safe field, such as phone, email, address, or notes.
- [ ] Confirm the edit persists after refresh.
- [ ] Archive the test customer.
- [ ] Confirm archived customer behavior matches the app's expected UI.
- [ ] Confirm Activity History records create/edit/archive actions where applicable.

Pass / Fail:

Customer ID:

Notes:

### Create, Edit, And Archive Test Family Person

- [ ] Create a family person named clearly as a smoke test person.
- [ ] Confirm the person appears where family people are managed or selected.
- [ ] Edit at least one safe field.
- [ ] Confirm the edit persists after refresh.
- [ ] Archive the test family person.
- [ ] Confirm archived person behavior matches the app's expected UI.
- [ ] Confirm Activity History records create/edit/archive actions where applicable.

Pass / Fail:

Person ID:

Notes:

## Supabase Verification Queries

Run these in the Supabase SQL editor for the production project after the UI smoke test. Adjust selected columns if the schema changes.

### Latest Invoice Records

```sql
select *
from invoice_records
order by created_at desc
limit 10;
```

Expected:

- [ ] Customer invoice appears.
- [ ] K2 statement appears.
- [ ] Family use record appears.
- [ ] Totals, balances, account/person references, and statuses look correct.

### Latest Invoice Line Items

```sql
select *
from invoice_line_items
order by created_at desc
limit 20;
```

Expected:

- [ ] Line items exist for the smoke-test customer invoice.
- [ ] Line items exist for the smoke-test K2 statement.
- [ ] Line items exist for the smoke-test family use record.
- [ ] Product IDs, quantities, and unit prices look correct.

### Latest Payments

```sql
select *
from payments
order by created_at desc
limit 10;
```

Expected:

- [ ] The `$1` smoke-test payment appears.
- [ ] Payment is linked to the expected customer invoice.
- [ ] Payment method, amount, and timestamp look correct.

### Latest Inventory Transactions

```sql
select *
from inventory_transactions
order by created_at desc
limit 25;
```

Expected:

- [ ] Customer invoice inventory decrease appears.
- [ ] K2 statement inventory decrease appears.
- [ ] Family use inventory decrease appears.
- [ ] Add stock increase appears.
- [ ] Adjust count transaction appears.
- [ ] Quantities and related records look correct.

### Latest Activity Logs

```sql
select *
from activity_logs
order by created_at desc
limit 25;
```

Expected:

- [ ] Invoice, payment, stock, adjustment, product, account, and person actions appear.
- [ ] Activity entries include useful actor/action/record context.
- [ ] No unexpected errors or missing audit entries are visible.

### Product Quantities

Replace the product names with the products used during the smoke test.

```sql
select id, name, current_quantity, minimum_quantity, is_active, updated_at
from products
where name in (
  'Smoke Test Product',
  'REPLACE_WITH_EXISTING_TEST_PRODUCT_NAME'
)
order by name;
```

Expected:

- [ ] Product quantities match the expected net result of the smoke test.
- [ ] Archived test product has the expected inactive/archived state.
- [ ] No unrelated product quantity changed unexpectedly.

## Pass/Fail Checklist

- [ ] Production URL and Auth configuration are correct.
- [ ] Vercel production environment variables are correct.
- [ ] Login works.
- [ ] All read screens load.
- [ ] Customer invoice creates correctly.
- [ ] Customer payment records correctly.
- [ ] K2 statement creates correctly.
- [ ] Family use record creates correctly.
- [ ] Add Stock updates inventory correctly.
- [ ] Adjust Count updates inventory correctly.
- [ ] Product create/edit/archive works.
- [ ] Customer create/edit/archive works.
- [ ] Family person create/edit/archive works.
- [ ] Supabase verification queries match the UI results.
- [ ] Activity History includes the expected audit entries.
- [ ] Any static/wireframe areas are documented below.

Overall result:

- [ ] Pass
- [ ] Fail

## Manual Findings

Finding:

Severity:

Screen/workflow:

Steps to reproduce:

Expected:

Actual:

Notes:

---

Finding:

Severity:

Screen/workflow:

Steps to reproduce:

Expected:

Actual:

Notes:
