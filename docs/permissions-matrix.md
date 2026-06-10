# Permissions Matrix

This document defines default role permissions for StockLog.

Roles:

- Admin
- Manager
- Operator
- View Only

Permissions may later support overrides, but the MVP should start with clear role defaults.

---

## Role Summary

### Admin

Full access.

Can:

- Manage users
- Manage permissions
- Manage settings
- View all inventory fields
- See cost per unit
- Take Feed
- Add Stock
- Adjust Count
- Create invoices/records
- Record payments
- Void invoices/records
- View all reports
- Export/print reports

### Manager

Operational management access.

Can:

- View all inventory fields
- See cost per unit
- Take Feed
- Add Stock
- Adjust Count
- Create invoices/records
- Record payments
- Void invoices/records, if allowed
- Add/edit customers and people
- View reports
- Export/print reports

Cannot by default:

- Manage users
- Change permissions
- Change system/business settings

### Operator

Field/user recording access.

Can:

- View inventory
- Take Feed
- Create customer/K2/family records through Take Feed
- Add Stock, if allowed
- Record payments, if allowed
- View invoices/records
- View accounts
- View activity history
- View limited reports, if allowed

Cannot by default:

- See cost per unit
- Manage users
- Change permissions
- Delete records
- Void invoices/records
- Edit historical activity
- Change system settings

### View Only

Read-only access.

Can:

- View allowed inventory
- View allowed invoices/records
- View allowed accounts
- View allowed reports
- View activity history

Cannot:

- Take Feed
- Add Stock
- Adjust Count
- Record payments
- Create invoices/records
- Add/edit accounts or people
- See cost per unit, unless explicitly allowed
- Manage users
- Change permissions
- Change settings

---

## Permission Table

| Permission | Admin | Manager | Operator | View Only |
|---|---:|---:|---:|---:|
| View Home | Yes | Yes | Yes | Yes |
| View Inventory | Yes | Yes | Yes | Yes |
| View Product Detail | Yes | Yes | Yes | Yes |
| See Cost Per Unit | Yes | Yes | No | No |
| See Sale Price | Yes | Yes | Yes | Yes |
| Take Feed | Yes | Yes | Yes | No |
| Customer Take Feed | Yes | Yes | Yes | No |
| K2 Take Feed | Yes | Yes | Yes | No |
| Family Take Feed | Yes | Yes | Yes | No |
| Add Stock | Yes | Yes | Optional | No |
| Adjust Count | Yes | Yes | No by default | No |
| Create Invoice/Record | Yes | Yes | Yes through Take Feed | No |
| Create Manual Invoice | Yes | Yes | No by default | No |
| Record Payment | Yes | Yes | Optional | No |
| Void Invoice/Record | Yes | Optional | No | No |
| Mark Written Off | Yes | Yes | No by default | No |
| View Accounts | Yes | Yes | Yes | Yes |
| Add Customer | Yes | Yes | Optional / Request Only | No |
| Add Family Person | Yes | Yes | Optional / Request Only | No |
| Edit Account/Person | Yes | Yes | No by default | No |
| View Activity History | Yes | Yes | Yes | Yes |
| Edit Activity History | No | No | No | No |
| Create Correction Activity | Yes | Yes | Optional | No |
| View Reports | Yes | Yes | Limited / Optional | Limited / Optional |
| Export Reports | Yes | Yes | No by default | No by default |
| Print Reports | Yes | Yes | Optional | Optional |
| Manage Users | Yes | No by default | No | No |
| Manage Permissions | Yes | No | No | No |
| Manage Business Settings | Yes | No by default | No | No |

---

## Important Rules

### Cost Visibility

Cost per unit should be hidden from Operator and View Only users.

Sale price can be visible because it is needed for invoicing and feed sale records.

### Activity History

Activity History should not be directly editable by any role.

If a correction is needed, create a new correction activity.

### Family Person Records

Family/person records should be controlled.

Avoid duplicate person records like:

- Tessie
- Tessie G.
- Tessie Geringer

Search may support aliases, but the saved record should use one official display name.

### K2

K2 is a fixed/system account.

Normal users should not create duplicate K2 accounts.

### Optional Permissions

These should be confirmed before MVP build:

- Can Operator Add Stock?
- Can Operator Record Payments?
- Can Operator Add Customer/Person?
- Can Manager Void Invoices?
- Can View Only print reports?
