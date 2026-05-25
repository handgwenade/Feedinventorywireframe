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
- Sign out
- Admin tools, if allowed

---

## 01 — Home

Purpose:

Home is the command center.

Shows:

- Inventory Value
- Low Stock count
- Unpaid Invoices count
- Primary action: Take Feed
- Main action cards:
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

Flow:

Home / Bottom Nav → Accounts → Account List → Account Detail

Account types:

- Customer
- K2
- Family / Person

Key rules:

- Customer accounts are used for invoicing and balances.
- K2 is a separate related account.
- Family/person records are controlled records, not free-typed names.
- K2 should not be added as a new account by normal users. It is a fixed/system account.

---

## 10 — Activity History

Purpose:

Provide an audit trail for inventory and account activity.

Flow:

Home → Activity History → Activity Detail

Also accessible from:

- Product Detail → View History
- Account Detail → View Activity

Activity types:

- Take Feed
- Add Stock
- Count Adjustment
- Payment Recorded
- Invoice Created
- K2 Statement Created
- Family Use Recorded
- Account/Person Created

Key rules:

- Activity should show who recorded the action, what changed, when it changed, and the resulting quantity or balance.
- Activity History should not be casually editable.
- Corrections should create new correction activity records instead of rewriting history.

---

## 11 — Reports

Purpose:

Provide business visibility without mixing Customer, K2, and Family activity.

Flow:

Home → Reports → Report Detail

Reports planned:

- Inventory Summary
- Low Stock
- Activity History
- Customer Sales
- K2 Account Use
- Family Use
- Unpaid Invoices
- Payments Received

Key rules:

- Customer Sales excludes K2 and Family by default.
- K2 Account Use is tracked separately.
- Family Use is tracked separately by person.
- Reports are read-only.
- Editing happens through the source record, not inside reports.

---

## 12 — User / Profile / Settings

Purpose:

Show current user, role, permissions, and settings.

Flow:

Top-right user icon → Profile / Settings

Screens:

- Profile
- My Profile
- Settings
- Role & Permissions
- Manage Users, Admin only
- Login
- Session Expired

Key rules:

- Menu options are role-based.
- Admin sees user and business management tools.
- Operator sees personal/profile options and permissions.
- View Only cannot create, edit, record payments, or adjust inventory.

---

## 13 — Utility States

Purpose:

Prevent confusion when data is missing, inventory is low, permissions block an action, or the session expires.

States:

- Sign In
- Session Expired
- Empty Inventory
- Empty Invoices
- Empty Accounts
- Empty Reports
- Low Stock Warning
- Not Enough Inventory Error
- Missing Price Warning
- Permission Needed
- Cannot Edit Activity Warning

Key rules:

- Empty states should point to the next useful action.
- Error messages should be plain-language and action-oriented.
- Permission messages should explain the role limitation without exposing restricted data.