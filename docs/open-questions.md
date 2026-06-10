# Open Questions

This document tracks decisions that still need confirmation for the StockLog app.

## Business / Operations

### 1. Final app name

Current working name:

StockLog

Open question:

Should the app stay branded specifically for C&C, or eventually become a more generic product?

---

### 2. Final business info for invoices

Needed later:

- C&C official business name
- Mailing address
- Phone number
- Email
- Logo
- Invoice footer note

---

### 3. Sales tax

Current assumption:

- Tax is optional/configurable.
- Default is off.

Open question:

Does C&C need to collect sales tax on these products in Wyoming or specific counties?

---

### 4. Payment terms

Current assumption:

- Due on receipt.

Open question:

Should invoices support Net 15, Net 30, or custom due dates?

---

## Users / Permissions

### 5. Operator payment permission

Current assumption:

Operators may be allowed to record payments, but this is optional.

Open question:

Should Operators be able to record cash/check payments, or only Managers/Admins?

---

### 6. Operator add-stock permission

Current assumption:

Operators can add stock if allowed.

Open question:

Should Operators be allowed to restock inventory, or only Managers/Admins?

---

### 7. Add Person permission

Current assumption:

Family use should use controlled person records.

Open question:

Can Operators add a new person, or should only Admin/Manager add people to avoid duplicates?

---

## K2 / Family

### 8. K2 status handling

Current statuses:

- Unpaid
- Paid
- Internal Transfer

Open question:

Should K2 normally be treated as Internal Transfer, or should K2 carry a balance like a customer?

---

### 9. Family use status handling

Current statuses:

- Track Only
- Needs Payment
- Paid
- Written Off

Open question:

Should Family use default to Track Only or Needs Payment?

---

### 10. Family records

Current rule:

Family use links to one controlled person record when possible.

Open question:

Should there still be a generic “Other Family” option?

---

## Invoices / Statements

### 11. Numbering format

Current placeholder examples:

- Customer invoices
- K2 statements
- Family use records

Open question:

Should all records use one numbering sequence, or should each type have its own prefix?

Note:

Invoice numbering is not important during wireframing. Handle this during development.

---

### 12. K2 wording

Current wording:

K2 Statement

Open question:

Should K2 records be called statements, invoices, or account use records?

---

### 13. Family wording

Current wording:

Family Use

Open question:

Should Family records be called Family Use, Family Invoice, or Family Record?

---

## Product / Inventory

### 14. Product categories

Current examples:

- Salt
- Mineral
- Tubs
- Blocks
- Supplement

Open question:

What final product categories should C&C use?

---

### 15. Cost per unit

Current rule:

Cost per unit is role-based.

Visible to:

- Admin
- Manager

Hidden from:

- Operator
- View Only

Open question:

Should cost be used in MVP at all, or saved for later?

---

### 16. Adjust Count permission

Current assumption:

Adjust Count is for inventory corrections only and does not create invoices.

Open question:

Should Operators be allowed to adjust counts, or only Managers/Admins?

---

## Build / Technical

### 17. Build path

Current assumption:

Start from the Figma Make prototype, then convert/refactor into real app logic.

Open question:

Should this remain a Vite/React web app, or eventually move to a different stack?

---

### 18. Offline use

Current assumption:

Offline mode is not MVP.

Open question:

Do users need to record feed movement where cell service is unreliable?

---

### 19. Product photos

Current assumption:

Product photos are useful and should stay central to the UI.

Open question:

Will photos be imported from Sortly, uploaded manually, or retaken?
