# MVP Build Spec

This document defines the first usable version of C&C Feed Inventory.

The MVP should prove the core workflow:

Feed/product comes in → feed/product is taken → inventory updates → record/invoice is created → payment/status/activity can be tracked.

---

## MVP Goal

Build a simple mobile-first feed inventory and invoicing app that allows C&C to:

- view inventory
- record feed taken by Customer, K2, or Family
- add stock
- generate invoice/statement/use records
- record payments
- view account history
- view activity history
- view basic reports
- control access by role

The MVP should stay simple and practical.

Do not overbuild accounting, tax automation, barcode scanning, or complex integrations.

---

## Source of Truth Docs

Reference these documents:

- `docs/project-context.md`
- `docs/workflow-map.md`
- `docs/data-model.md`
- `docs/permissions-matrix.md`
- `docs/open-questions.md`
- `docs/user-testing-checklist.md`
- `wireframes/figma-links.md`

---

## MVP Includes

### 1. Authentication / Users

Users should be able to sign in.

Roles:

- Admin
- Manager
- Operator
- View Only

MVP needs:

- user login
- current role
- role-based UI visibility
- basic profile/settings screen

Not required for first MVP:

- custom permissions editor
- complex user invitations
- SSO

---

### 2. Home Dashboard

Home should show:

- Inventory Value
- Low Stock count
- Unpaid Invoices count
- Recent Activity
- primary action: Take Feed
- access to:
  - Inventory
  - Invoices
  - Accounts
  - Reports
  - Add Stock
  - Activity History

---

### 3. Inventory

Users should be able to:

- view product list
- search products
- filter by category / low stock
- view product detail
- see current quantity
- see minimum quantity
- see sale price
- see inventory value
- see low-stock status

Role rules:

- Admin/Manager can see cost per unit.
- Operator/View Only cannot see cost per unit.

---

### 4. Take Feed

Primary inventory removal workflow.

Flow:

Take Feed → Who is this for? → Customer / K2 / Family

#### Customer

Users should be able to:

- select customer
- add product(s)
- enter quantity
- review invoice
- create invoice
- optionally record payment later

Result:

- inventory decreases
- customer invoice/record is created
- activity history entry is created

#### K2

Users should be able to:

- select K2 path
- add product(s)
- enter quantity
- review K2 statement/account use
- create K2 record

Result:

- inventory decreases
- K2 statement/use record is created
- K2 activity stays separate from Customer sales
- activity history entry is created

#### Family

Users should be able to:

- select Family path
- select controlled person record
- add product(s)
- enter quantity
- review family use
- create family use record

Result:

- inventory decreases
- family use record is created
- person record is linked
- activity history entry is created

Important:

Family/person should not be free-typed into transactions.

---

### 5. Add Stock

Users should be able to:

- select product
- enter quantity added
- review new quantity
- save stock update

Result:

- inventory increases
- activity history entry is created
- no invoice is created

---

### 6. Invoices / Records

MVP should support three record types:

- Customer invoice
- K2 statement/use record
- Family use record

Users should be able to:

- view list
- filter by status/type
- view detail
- see line items
- see subtotal/tax/total
- see amount paid
- see balance due
- record payment where allowed
- print/download/export placeholder, if possible

Tax:

- default off
- configurable later

Invoice numbering:

- placeholder okay for MVP
- final numbering can be handled later

---

### 7. Payments

Users should be able to record:

- cash
- check
- other

Payment fields:

- amount
- payment method
- check number if check
- note optional
- received by
- received date/time

Result:

- amount paid updates
- balance due updates
- status updates
- activity history entry is created
- inventory does not change

---

### 8. Accounts

Users should be able to view:

- Customer accounts
- K2 account
- Family/person records

Account detail should show:

- account/person name
- type badge
- balance/status
- contact info when applicable
- recent activity
- related invoices/records

K2:

- fixed/system account
- should not be duplicated

Family:

- controlled person records
- alias support later
- avoid duplicate people

---

### 9. Activity History

Users should be able to view an audit trail of:

- Take Feed
- Add Stock
- Count Adjustment
- Payment Recorded
- Invoice/Record Created
- Account/Person Created
- Corrections

Activity should show:

- date/time
- action type
- recorded by
- product/account/person
- quantity change where relevant
- before/after quantity where relevant
- linked record where relevant

Rule:

Activity history should be append-only. Corrections create new activity records.

---

### 10. Reports

MVP reports:

- Inventory Summary
- Low Stock
- Customer Sales
- K2 Account Use
- Family Use
- Unpaid Invoices
- Payments Received
- Activity History

Rules:

- Customer, K2, and Family activity must remain separated.
- Reports are read-only.
- Export/print can be simple or placeholder in MVP.

---

## MVP Excludes

Not required for MVP:

- barcode scanning
- QR scanning
- QuickBooks integration
- online payments
- multi-location inventory
- offline sync
- advanced sales tax automation
- complex accounting
- advanced analytics
- custom role builder
- native app store deployment

---

## Build Phases

### Phase 1 — Clean Prototype Code

- Review Figma Make code structure
- Identify screens/components
- Remove unused prototype clutter where safe
- Preserve working local app

### Phase 2 — Static App Structure

- Set up routes/screens
- Organize shared layout/navigation
- Create mock data
- Render Home, Inventory, Take Feed, Invoices, Accounts, Activity, Reports

### Phase 3 — Mock Workflow Logic

- Take Feed updates mock inventory
- Add Stock updates mock inventory
- Create mock invoice/statement/use records
- Record mock payments
- Create mock activity entries

### Phase 4 — Real Data Layer

- Choose backend/database
- Add schema
- Add authentication
- Add role checks
- Persist inventory transactions
- Persist invoices/payments/activity

### Phase 5 — Testing / Pilot

- Test with 1–2 real users
- Run alongside current process
- Fix friction
- Validate reports and balances

---

## MVP Success Criteria

The MVP is successful if users can:

- record Customer Take Feed
- record K2 Take Feed
- record Family Use
- add stock
- see current inventory
- identify low-stock products
- find unpaid balances
- record a payment
- view account history
- view activity history
- understand role limitations

without needing a guided tour.