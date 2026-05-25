# C&C Feed Inventory Workflow Map

## Navigation

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
- Manage users, if Admin
- Sign out

---

## 01 — Home

Home acts as the main command center.

Shows:

- Inventory Value
- Low Stock count
- Unpaid Invoices count
- Primary action: Take Feed
- Main actions:
  - Inventory
  - Invoices
  - Accounts
  - Reports
  - Add Stock
  - Activity History
- Recent Activity preview

---

## 02 — Take Feed

Purpose:

Record feed/products leaving inventory.

Flow:

Home → Take Feed → Who is this for?

Branches:

- Customer
- K2
- Family

---

## 03 — Customer Take Feed Flow

Purpose:

Sell feed/products to an outside customer and create an invoice.

Flow:

Who is this for? → Customer → Choose Customer → Add Products → Quantity Modal → Review Invoice → Invoice Created

Key rules:

- Customer must be selected unless Unassigned Sale is used.
- Products added reduce inventory.
- Invoice is created.
- Payment may be recorded now or later.
- Activity history records product, quantity, user, customer, date/time.

---

## 04 — K2 Account Use Flow

Purpose:

Record feed/products used by K2, the separate cattle-side account.

Flow:

Who is this for? → K2 → Add Products → Quantity Modal → Review K2 Statement → K2 Statement Created

Key rules:

- K2 is preselected.
- Customer selection is skipped.
- K2 statements are separate from standard customer sales.
- K2 activity is excluded from normal customer sales reports by default.
- Inventory is reduced.
- Activity history records product, quantity, user, K2, date/time.

---

## 05 — Family Use Flow

Purpose:

Record who in the family took feed/products without creating duplicate free-typed person records.

Flow:

Who is this for? → Family → Who took it? → Family Use Add Products → Quantity Modal → Review Family Use → Family Use Recorded

Key rules:

- Family use is tracked by controlled person records.
- Search should find aliases, but records should use one official display name.
- Example: Tessie, Tessie G., and Tessie Geringer should all resolve to Tessie Geringer.
- Family use can be Track Only, Needs Payment, Paid, or Written Off.
- Inventory is reduced.
- Activity history records product, quantity, user, taken-by person, date/time.

---

## 06 — Add Stock

Purpose:

Record feed/products coming into inventory.

Flow:

Home → Add Stock → Select Product → Enter Quantity Added → Review Stock Update → Stock Added

Key rules:

- Product quantity increases.
- Restock transaction is created in Activity History.
- No invoice is created.
- Cost per unit is role-based.
  - Admin: visible
  - Manager: visible
  - Operator: hidden
  - View Only: hidden

---

## 07 — Inventory

Purpose:

View current stock, product detail, low-stock status, and product activity.

Flow:

Home → Inventory → Inventory List → Product Detail

Product Detail actions:

- Take Feed
- Add Stock
- Adjust Count
- View History

Key rules:

- Inventory value = current quantity × sale price.
- Product photos are important.
- Low-stock status is based on current quantity and minimum quantity.
- Adjust Count is for corrections only and does not create invoices.

---

## 08 — Invoices

Purpose:

View invoices/statements/use records and track payment status.

Flow:

Home / Bottom Nav → Invoices → Invoice Detail → Record Payment → Payment Recorded

Invoice types:

- Customer invoice
- K2 statement
- Family use record

Invoice filters:

- All
- Unpaid
- Paid
- Customer
- K2
- Family

Key rules:

- Customer invoices can be unpaid, partial, paid, overdue, void, or written off.
- K2 statements may use Internal Transfer.
- Family records may use Track Only, Needs Payment, Paid, or Written Off.
- Recording payment updates balance due and payment status.
- Recording payment does not change inventory.

---

## 09 — Accounts

Purpose:

Manage customers, K2, family/person records, and balances.

Planned flow:

Home / Bottom Nav → Accounts → Account List → Account Detail

Account types:

- Customer
- K2
- Family / Person

Key rules:

- Customer accounts are used for invoicing and balances.
- K2 is a separate related account.
- Family/person records are controlled records, not free-typed names.

---

## 10 — Reports

Purpose:

Provide business visibility.

Reports planned:

- Inventory Summary
- Low Stock
- Activity History
- Customer Sales
- K2 Account Use
- Family Use
- Unpaid Invoices
- Payments Received

Reports remain accessible from Home or role-based menus.
