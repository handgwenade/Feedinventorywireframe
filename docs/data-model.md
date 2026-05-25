# Data Model

This document defines the core data entities for C&C Feed Inventory.

The MVP data model should support:

- products
- inventory quantities
- customers
- K2 account use
- family/person records
- feed movement
- invoices/statements/use records
- payments
- activity history
- users and roles

---

## Core Rules

- C&C owns the feed/mineral inventory.
- Customer, K2, and Family activity must remain distinguishable.
- Family use should link to controlled person records, not free-typed names.
- Inventory changes should be recorded as transactions.
- Activity history should act as an audit trail.
- Payments should update balances but should not change inventory.
- Count corrections should create correction records instead of rewriting history.

---

## Entity Overview

Primary entities:

- User
- Role
- Product
- ProductCategory
- Account
- Person
- InventoryTransaction
- InvoiceRecord
- InvoiceLineItem
- Payment
- ActivityLog

---

## User

Represents a person who can log into the app.

Fields:

- id
- name
- email
- phone optional
- role_id
- status: active, invited, disabled
- last_login_at
- created_at
- updated_at

Notes:

- User role controls what actions are visible/allowed.
- Users are not the same thing as family/person records, though the same real person could exist in both systems.

---

## Role

Represents permission level.

Default roles:

- Admin
- Manager
- Operator
- View Only

Fields:

- id
- name
- description
- created_at
- updated_at

Notes:

- MVP can use hardcoded/default roles.
- Future version may allow custom permission overrides.

---

## Product

Represents a feed/mineral inventory item.

Fields:

- id
- name
- category_id
- sku optional
- description optional
- current_quantity
- minimum_quantity
- unit_label
- sale_price
- cost_per_unit optional
- inventory_value calculated
- vendor optional
- source_notes optional
- product_photo_url optional
- status: active, archived
- created_at
- updated_at

Calculated fields:

- inventory_value = current_quantity × sale_price
- low_stock = current_quantity <= minimum_quantity

Notes:

- Cost per unit should be hidden from Operator and View Only users.
- Sale price is needed for customer invoices and use records.

---

## ProductCategory

Represents product grouping.

Example categories:

- Salt
- Mineral
- Tubs
- Blocks
- Supplement

Fields:

- id
- name
- sort_order
- created_at
- updated_at

---

## Account

Represents an entity tied to invoices/statements/balances.

Account types:

- Customer
- K2
- Family

Fields:

- id
- account_type
- name
- contact_name optional
- phone optional
- email optional
- address optional
- notes optional
- status: active, archived
- is_system_account boolean
- created_at
- updated_at

Rules:

- Customer accounts are outside buyers.
- K2 should be a fixed/system account.
- Family account type may be used as a grouping/account category, but individual family use should link to Person records.

---

## Person

Represents a controlled family/person record.

Fields:

- id
- official_display_name
- aliases optional
- phone optional
- notes optional
- status: active, archived
- created_at
- updated_at

Rules:

- Do not free-type family names into feed movement records.
- Search may support aliases.
- Saved records should use one official display name.

Example:

- official_display_name: Tessie Geringer
- aliases: Tessie, Tessie G.

---

## InventoryTransaction

Represents a product quantity change.

Transaction types:

- take_feed_customer
- take_feed_k2
- take_feed_family
- add_stock
- adjust_count
- correction

Fields:

- id
- transaction_type
- product_id
- quantity_change
- quantity_before
- quantity_after
- account_id optional
- person_id optional
- invoice_record_id optional
- recorded_by_user_id
- reason optional
- notes optional
- created_at

Rules:

- Take Feed reduces inventory.
- Add Stock increases inventory.
- Adjust Count changes inventory for correction purposes.
- Payment does not create an inventory transaction.
- Every inventory transaction should create an ActivityLog entry.

---

## InvoiceRecord

Represents a customer invoice, K2 statement, or family use record.

Record types:

- customer_invoice
- k2_statement
- family_use

Statuses:

Customer invoice statuses:

- unpaid
- partial
- paid
- overdue
- void
- written_off

K2 statuses:

- internal_transfer
- unpaid
- paid
- void

Family statuses:

- track_only
- needs_payment
- paid
- written_off
- void

Fields:

- id
- record_type
- display_number placeholder/future
- account_id optional
- person_id optional
- status
- issue_date
- due_date optional
- subtotal
- tax_amount
- total
- amount_paid
- balance_due
- notes optional
- created_by_user_id
- created_at
- updated_at

Rules:

- Customer invoices link to Customer accounts.
- K2 statements link to the K2 system account.
- Family use records link to Person records.
- Numbering format can be handled later in development.
- Recording payment updates amount_paid, balance_due, and status.
- Recording payment does not change inventory.

---

## InvoiceLineItem

Represents one product line on an InvoiceRecord.

Fields:

- id
- invoice_record_id
- product_id
- description
- quantity
- unit_price
- line_total
- created_at

Calculated fields:

- line_total = quantity × unit_price

Rules:

- Line items should reflect the price used at the time of record creation.
- Do not rely only on current product price after the record is created.

---

## Payment

Represents a payment recorded against an InvoiceRecord.

Payment methods:

- cash
- check
- other

Fields:

- id
- invoice_record_id
- amount
- payment_method
- check_number optional
- payment_note optional
- received_by_user_id
- received_at
- created_at

Rules:

- Payment updates invoice/record balance.
- Payment does not affect inventory.
- Payment should create an ActivityLog entry.

---

## ActivityLog

Represents the audit trail.

Activity types:

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
- status_changed

Fields:

- id
- activity_type
- actor_user_id
- product_id optional
- account_id optional
- person_id optional
- inventory_transaction_id optional
- invoice_record_id optional
- payment_id optional
- summary
- details_json optional
- created_at

Rules:

- ActivityLog should be append-only.
- Do not edit historical activity casually.
- Corrections should create new activity instead of rewriting old activity.

---

## Relationships

Product has many InventoryTransactions.

Product has many InvoiceLineItems.

Account has many InvoiceRecords.

Person has many Family InvoiceRecords.

InvoiceRecord has many InvoiceLineItems.

InvoiceRecord has many Payments.

User has many ActivityLog entries.

InventoryTransaction may belong to an InvoiceRecord.

Payment belongs to an InvoiceRecord.

ActivityLog may reference Product, Account, Person, InventoryTransaction, InvoiceRecord, or Payment.

---

## MVP Notes

For prototype/MVP, some fields can be mocked or simplified.

Must-have MVP data:

- products
- current quantity
- minimum quantity
- sale price
- account/person selection
- inventory transaction records
- invoice/use records
- payment records
- activity log
- user role

Not required for early MVP:

- barcode/QR scanning
- QuickBooks integration
- online payment processing
- multi-location inventory
- advanced tax automation
- offline sync