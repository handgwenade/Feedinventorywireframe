# C&C Feed Inventory Wireframe

A mobile-first feed inventory and invoicing app prototype for C&C Feed Inventory.

This repo contains the Figma Make code export plus project documentation for the C&C Feed Inventory app concept.

## Project Purpose

C&C Feed Inventory is designed to help a small feed-side business track feed/mineral inventory, record who takes feed, create invoices/statements/use records, and track payments.

The main goal is low-friction recording. The app should make it faster to record feed movement than to ignore it.

## Business Rules

- C&C owns the feed/mineral inventory.
- K2 is a separate cattle-side account that may use/draw feed from C&C.
- Family use is tracked separately by controlled person records, not free-typed names.
- Customer, K2, and Family activity should stay separated in reports.
- Activity History should act as an audit trail.
- Cost per unit is role-based and hidden from Operators/View Only users.

## Core Workflows

- Home
- Take Feed
  - Customer
  - K2
  - Family
- Add Stock
- Inventory
- Invoices
- Accounts
- Activity History
- Reports
- Profile / Settings
- Login and utility states

## Navigation

Bottom nav:

- Home
- Inventory
- Take Feed
- Invoices
- Accounts

Top-right user icon:

- Profile
- Current role
- Settings
- Sign out
- Admin tools, if allowed

## Prototype / Design

Primary Figma file:

https://www.figma.com/design/7zFLuQwCXdcpTX1aWuTnBq/Sell-Feed-Workflow-Wireframe

See also:

```text
wireframes/figma-links.md

Project Documentation

Key docs:
- docs/project-context.md
- docs/workflow-map.md
- docs/user-testing-checklist.md

Planned future docs:

- docs/mvp-build-spec.md
- docs/data-model.md
- docs/permissions-matrix.md
- docs/open-questions.md
- data/product-field-map.md
- data/sample-data.md

Current Code Stack

This code was exported from Figma Make.

Current stack:

- Vite
- React
- TypeScript
- Tailwind CSS
- Radix / shadcn-style components
- Running Locally

Install dependencies:

npm i

Start the development server:

npm run dev

## Deployment

Vercel is the recommended deployment target for the current Vite app.

- Build command: `npm run build`
- Output directory: `dist`
- Required environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

See [docs/deployment.md](docs/deployment.md) for Vercel setup, Supabase Auth redirect URLs, smoke tests, rollback notes, and security guidance.

Important Note

The current code is a prototype foundation, not final production app logic.

The final app still needs deliberate development for:

- database schema
- authentication
- roles and permissions
- real inventory transactions
- invoice/payment logic
- activity history
- CSV import
- reporting
