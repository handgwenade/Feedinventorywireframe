# StockLog Project Context

## Project Purpose

StockLog is a mobile-first feed inventory and invoicing app prototype for ranch/feed use.

The goal is to make it faster and easier to record feed movement than to ignore it.

This app should help users:

- View current feed/mineral inventory
- Record feed/products leaving inventory
- Record new stock coming in
- Track who took feed
- Separate Customer, K2, and Family use
- Create invoices/statements/use records
- Record cash/check payments
- View activity history
- Review basic reports

## Business Context

C&C is the feed-side business and owns the feed/mineral inventory.

K2 is a separate cattle-side account that may use or draw feed from C&C.

Family use is tracked separately by controlled person records, not free-typed names.

## Core Principle

The app should reduce friction.

If recording feed takes too long, people will skip it.

The workflow should be plain-language, fast, and field-friendly.

## Main Navigation

Bottom navigation:

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

## Primary Inventory-Removal Flow

Primary action:

Take Feed

Take Feed asks:

Who is this for?

Options:

- Customer
- K2
- Family

## Core Workflows

### Home

Home is the command center.

It includes:

- Inventory Value
- Low Stock count
- Unpaid Invoices count
- Take Feed
- Inventory
- Invoices
- Accounts
- Reports
- Add Stock
- Activity History
- Recent Activity preview

### Take Feed — Customer

Flow:

Home → Take Feed → Customer → Choose Customer → Add Products → Quantity Modal → Review Invoice → Invoice Created

Rules:

- Customer means outside buyer.
- Creates invoice.
- Reduces inventory.
- Payment may be recorded now or later.

### Take Feed — K2

Flow:

Home → Take Feed → K2 → Add Products → Quantity Modal → Review K2 Statement → K2 Statement Created

Rules:

- K2 is preselected.
- Customer selection is skipped.
- K2 is separate from standard customer sales.
- Reduces C&C inventory.

### Take Feed — Family

Flow:

Home → Take Feed → Family → Who took it? → Family Use Add Products → Quantity Modal → Review Family Use → Family Use Recorded

Rules:

- Family use tracks who took feed.
- Uses controlled person records.
- Avoid duplicate records like Tessie, Tessie G., and Tessie Geringer.
- Search may support aliases, but records should use one official display name.

### Add Stock

Flow:

Home → Add Stock → Select Product → Enter Quantity Added → Review Stock Update → Stock Added

Rules:

- Increases inventory.
- Creates restock activity.
- Does not create invoice.
- Cost per unit is role-based.

### Inventory

Flow:

Home → Inventory → Inventory List → Product Detail

Product detail actions:

- Take Feed
- Add Stock
- Adjust Count
- View History

### Invoices

Flow:

Home / Bottom Nav → Invoices → Invoice List → Invoice Detail → Record Payment → Payment Recorded

Rules:

- Customer invoices, K2 statements, and Family use records are separate but visible from Invoices.
- Recording payment updates balance/status.
- Recording payment does not change inventory.

### Accounts

Flow:

Home / Bottom Nav → Accounts → Accounts List → Account Detail

Account types:

- Customer
- K2
- Family Person

Rules:

- Customer accounts are used for outside buyers.
- K2 is a fixed/system account.
- Family Person records are controlled records, not free-typed names.

### Activity History

Purpose:

Audit trail for all inventory and account activity.

Activity History should show:

- who recorded the action
- what changed
- when it changed
- product/account/person involved
- quantity before/after when relevant
- related invoice/statement/use record when relevant

Activity history should not be casually editable. Corrections should create new correction records.

### Reports

Reports should include:

- Inventory Summary
- Low Stock
- Activity History
- Customer Sales
- K2 Account Use
- Family Use
- Unpaid Invoices
- Payments Received

Reports are read-only. Editing happens from source records.

## Roles

User roles:

- Admin
- Manager
- Operator
- View Only

General rules:

- Admin can manage users/settings and see all data.
- Manager can manage operational records and see cost fields if allowed.
- Operator can record inventory movement and create records/invoices if allowed.
- View Only can view allowed screens but cannot edit.

Cost per unit visibility:

- Admin: visible
- Manager: visible
- Operator: hidden
- View Only: hidden

## Known Sample Products

- Garlic Salt Blocks — 247 available — $17.15
- Redmond Mineral Salt — 200 available — $9.79
- SweetPro FiberMate 20 — 6 available — $154.00 — Low Stock
- RumenEdge Tubs — 4 available — $123.70 — Low Stock

## Important Design Notes

Keep the app:

- mobile-first
- low-friction
- plain-language
- fast to use
- easy for ranch/feed workflows
- not overbuilt into full accounting software

Avoid:

- free-typed family names
- mixing Customer, K2, and Family reporting
- hiding core workflows behind menus
- relying on barcode/QR scanning for MVP
- making Operators deal with cost/accounting fields unnecessarily
