

# StockLog Backend Plan

StockLog is the app for C&C Feed inventory workflows. This document defines the first backend plan before creating Supabase tables or wiring the React app to live data.

### Naming

- **App name:** StockLog (the product/wireframe name used throughout the code and UI)
- **Organization / tenant name:** C&C Feed (the business/workspace record stored in `public.organizations`)
- **K2:** a separate cattle-side account/person entry (an internal account type, not the organization)

## Current state

The app is currently a Vite/React wireframe using shared mock data, shared TypeScript types, shared calculation helpers, and an initial Supabase service layer.

Completed mock-data wiring includes:

- Dashboard
- Inventory
- Product detail
- Accounts
- Invoices
- Reports
- Take Feed workflows
- Add Stock workflows
- Adjust Count workflow
- Payment screens
- Activity history/detail

Backend setup has started. Supabase has been created, the initial schema has been applied, the first organization/admin profile has been bootstrapped, and setup seed data has been inserted.

Completed backend milestones:

- Supabase project created for StockLog
- `.env.local` configured locally and ignored by Git
- Initial schema migration created and applied
- First `organizations` row created for C&C Feed
- First `user_profiles` row created for Gwen Johnson as `admin`
- Setup seed data inserted for product categories, products, accounts, people, and app settings
- `@supabase/supabase-js` installed
- `src/app/services/supabaseClient.ts` added
- `src/app/services/productsService.ts` added

## Backend recommendation

Use Supabase with Postgres.

Why Supabase/Postgres fits this app:

- Inventory, invoices, payments, and line items are relational data.
- Postgres supports reporting well.
- Supabase includes auth, row-level security, SQL migrations, and a browser-safe client.
- Inventory and payment history need audit-friendly records, not loose document blobs.

Avoid putting business logic directly inside random React components. Components should eventually call a service layer, and the service layer should decide whether data comes from mock data or Supabase.

## Frontend environment variables

Local Vite environment file:

```bash
.env.local
```

Required variables:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=use_the_sb_publishable_key_here
```

Rules:

- Use the `sb_publishable...` key in the frontend.
- Never use the `sb_secret...` key in the frontend.
- Never commit `.env`, `.env.local`, or `.env.*.local`.

See `docs/deployment.md` for production environment variables and Supabase Auth redirect URL configuration.

## Core domain model

The mock data has become the draft domain model. Backend tables should map closely to these concepts:

- users
- roles
- product_categories
- products
- accounts
- people
- inventory_transactions
- invoice_records
- invoice_line_items
- payments
- activity_logs
- app_settings

Optional later tables:

- vendors
- product_price_history
- attachments
- audit_corrections
- report_exports

## Data ownership model

The first version can assume one business/workspace. However, the schema should be ready for future multi-business use by including a `business_id` or `organization_id` on most records.

Recommended table:

### organizations

Represents the business/workspace using the app.

Fields:

- id uuid primary key
- name text not null
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Most business records should include:

- organization_id uuid not null references organizations(id)

This prevents a painful migration later if the app ever supports multiple businesses.

## Users and permissions

### user_profiles

Supabase Auth stores the actual login user in `auth.users`. The app should store app-specific user data in `user_profiles`.

Fields:

- id uuid primary key references auth.users(id)
- organization_id uuid references organizations(id)
- display_name text not null
- role text not null
- is_active boolean not null default true
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Recommended roles:

- admin
- manager
- operator
- viewer

Permission principles:

- Admin can manage users, settings, products, accounts, people, invoices, payments, and corrections.
- Manager can manage inventory, accounts, invoices, payments, and corrections.
- Operator can record normal feed movement, add stock, and create records.
- Viewer can read reports and activity only.

Do not build a complicated permissions engine until the workflow needs it. Start with role checks.

## Product tables

### product_categories

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- name text not null
- slug text not null
- sort_order integer not null default 0
- is_active boolean not null default true
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

### products

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- category_id uuid references product_categories(id)
- name text not null
- sku text
- unit_label text not null default 'units'
- current_quantity numeric not null default 0
- minimum_quantity numeric not null default 0
- sale_price numeric not null default 0
- cost_per_unit numeric
- vendor text
- source_notes text
- is_active boolean not null default true
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Notes:

- `current_quantity` can be stored for speed.
- Inventory changes must still create `inventory_transactions`.
- Cost visibility should be permission-based later.

## Account and person tables

### accounts

Used for outside customers and K2.

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- account_type text not null
- name text not null
- phone text
- email text
- billing_address text
- notes text
- is_active boolean not null default true
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Allowed `account_type` values:

- customer
- k2

### people

Used for controlled family/person records.

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- official_display_name text not null
- phone text
- notes text
- is_active boolean not null default true
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Optional later:

- aliases text[]

Rule:

Family use should link to one controlled person record when possible. Avoid duplicate people records.

## Inventory transactions

### inventory_transactions

Append-only record of inventory movement.

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- product_id uuid not null references products(id)
- transaction_type text not null
- quantity_change numeric not null
- quantity_before numeric not null
- quantity_after numeric not null
- unit_price numeric
- source_record_type text
- source_record_id uuid
- notes text
- created_by uuid references user_profiles(id)
- created_at timestamptz not null default now()

Allowed `transaction_type` values:

- take_feed
- add_stock
- adjust_count
- correction

Rules:

- This table is append-only.
- Do not delete inventory transactions.
- Corrections should create new transactions.
- Product `current_quantity` should be updated as part of the same logical action that creates the transaction.

## Invoice tables

### invoice_records

Used for customer invoices, K2 statements, and family use records.

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- display_number text not null
- record_type text not null
- account_id uuid references accounts(id)
- person_id uuid references people(id)
- issue_date date not null default current_date
- subtotal numeric not null default 0
- tax numeric not null default 0
- total numeric not null default 0
- balance_due numeric not null default 0
- status text not null
- notes text
- created_by uuid references user_profiles(id)
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Allowed `record_type` values:

- customer_invoice
- k2_statement
- family_use

Allowed `status` values:

- unpaid
- paid
- partial
- overdue
- internal
- track_only
- void

Rules:

- Customer invoices may have payments.
- K2 statements are internal transfer records.
- Family use records are usually track-only unless the business decides to collect payment.
- Records should not be hard-deleted. Use status `void` if needed.

### invoice_line_items

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- invoice_record_id uuid not null references invoice_records(id)
- product_id uuid references products(id)
- description text not null
- quantity numeric not null
- unit_label text not null default 'units'
- unit_price numeric not null default 0
- line_total numeric not null default 0
- created_at timestamptz not null default now()

Rules:

- Line items should preserve the sale price used at the time.
- Do not rely on the current product price to reconstruct old invoices.

## Payment tables

### payments

Append-only record of payment events.

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- invoice_record_id uuid not null references invoice_records(id)
- amount numeric not null
- method text not null
- reference_number text
- notes text
- received_by uuid references user_profiles(id)
- received_at timestamptz not null default now()
- created_at timestamptz not null default now()

Allowed `method` values:

- cash
- check
- card
- transfer
- other

Rules:

- Payments are append-only.
- If a payment is wrong, create a correction/refund record later instead of deleting it.
- Updating invoice balance should happen alongside payment creation.

## Activity logs

### activity_logs

Human-readable audit trail for important changes.

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- actor_user_id uuid references user_profiles(id)
- activity_type text not null
- summary text not null
- product_id uuid references products(id)
- account_id uuid references accounts(id)
- person_id uuid references people(id)
- invoice_record_id uuid references invoice_records(id)
- inventory_transaction_id uuid references inventory_transactions(id)
- payment_id uuid references payments(id)
- metadata jsonb
- created_at timestamptz not null default now()

Allowed `activity_type` values:

- take_feed
- add_stock
- adjust_count
- correction
- invoice_created
- payment_recorded
- account_created
- account_updated
- person_created
- person_updated
- product_created
- product_updated
- status_changed

Rules:

- Activity logs are append-only.
- They are not the source of truth; they are the audit trail.
- Source-of-truth records are products, transactions, invoices, payments, accounts, and people.

## App settings

### app_settings

Fields:

- id uuid primary key
- organization_id uuid not null references organizations(id)
- setting_key text not null
- setting_value jsonb not null
- updated_by uuid references user_profiles(id)
- updated_at timestamptz not null default now()

Possible settings:

- low_stock_alerts
- default_tax_enabled
- default_tax_rate
- invoice_number_prefix
- k2_statement_prefix
- family_use_prefix

## Bootstrap strategy

The initial RLS plan creates a chicken-and-egg problem: admin users can manage profiles and organizations, but the first organization and first admin profile do not exist yet.

For the first backend version, use a manual bootstrap process instead of weakening RLS:

1. Create the first Supabase Auth user.
2. Manually insert the first `organizations` row in the Supabase SQL editor.
3. Manually insert the first `user_profiles` row linked to that auth user with role `admin`.
4. After that first admin exists, normal app/admin workflows can manage users and setup records.

This keeps the public app from allowing random organization creation or self-appointed admins.

Later, StockLog can add a proper onboarding function or invite system for new organizations and users.

## Row-level security plan

RLS should be enabled on all public tables.

Initial simple policy approach:

- Authenticated users can read rows for their organization.
- Admin and manager roles can insert/update most setup records.
- Operators can insert inventory transactions, invoice records, line items, payments, and activity logs.
- Viewers can only read.

Tables that should be append-only by policy:

- inventory_transactions
- payments
- activity_logs

Append-only means:

- allow insert
- allow select
- do not allow update or delete for normal app users

## Service-layer migration plan

Current direct imports:

```ts
import { products } from '../data/mockData';
```

Target pattern:

```ts
import { productsService } from '../services/productsService';
```

Recommended service files:

- src/app/services/supabaseClient.ts
- src/app/services/productsService.ts
- src/app/services/accountsService.ts
- src/app/services/peopleService.ts
- src/app/services/inventoryService.ts
- src/app/services/invoicesService.ts
- src/app/services/paymentsService.ts
- src/app/services/activityService.ts

Phase 1 services can still return mock data. Phase 2 services can call Supabase.

This avoids rewriting every component again when the backend goes live.

## Implementation phases

### Phase 1: Schema and seed data — complete

- Created Supabase SQL migration.
- Created tables.
- Enabled RLS.
- Added basic policies.
- Bootstrapped first organization/admin profile.
- Seeded product categories, products, customers, K2 account, people, and app settings.

### Phase 2: Service layer with mock backend compatibility — in progress

- Added Supabase client service.
- Added initial products service.
- Next: test live product reads without swapping the UI yet.
- Then move mock-data reads behind services screen by screen.
- Keep app behavior unchanged during service migration.
- Build and verify routes after each change.

### Phase 3: Read from Supabase

- Products list/detail reads from Supabase.
- Accounts/people reads from Supabase.
- Reports read from Supabase views or service aggregations.

### Phase 4: Write workflows

- Take Feed creates invoice/statement/family record, line items, inventory transactions, and activity logs.
- Add Stock creates inventory transactions and activity logs.
- Adjust Count creates inventory transactions and activity logs.
- Record Payment creates payment and activity log, then updates invoice balance/status.

### Phase 5: Auth and permissions

- Enable Supabase Auth.
- Create user profiles.
- Apply role-aware RLS policies.
- Add login/session behavior to app.

## Reporting strategy

Start with service-layer aggregations for reports while the dataset is small.

Later, add SQL views for:

- inventory summary
- low stock
- unpaid invoices
- customer sales
- k2 use
- family use
- payments received

## Open questions

- Should K2 have a balance, or always be treated as internal/settled?
- Should family use ever create collectable balances, or always remain track-only?
- Should taxes be enabled by default for customer invoices?
- Does C&C need vendor purchase records now, or later?
- Should cost per unit be stored immediately or delayed until permissions are built?
- What invoice numbering format should StockLog use?
- What should the first-admin bootstrap process look like once onboarding is no longer manual?

## Immediate next step

Test the new `productsService.list()` read path against Supabase without changing production UI behavior. After the live read is confirmed, begin migrating components from direct `mockData` imports to service calls in small batches.
