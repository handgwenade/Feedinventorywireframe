# StockLog Beta Testing Checklist

Use this checklist while testing the app. If something does not work, write down what you clicked, what you expected, and what actually happened.

## Tester Info

- Tester name: Gwen
- Date tested: 6/8/26
- Device used: phone
- Browser used: safari
- App version/build seen in Profile Menu: Beta 0.1.0 Build 2026.05.31

Expected build marker:

- App name: StockLog
- Version: Beta 0.1.0
- Build: 2026.05.31

If the build marker does not match the expected version, refresh the app or clear browser data before testing.

## Current Beta Notes

- [x] I understand Manage Users is local/session-only right now.
- [x] I understand real invites, edits, and role changes are not connected to Supabase yet.
- [x] I understand some features may say Coming Soon.
- [x] I understand family/person workflows are disabled for beta.
- [x] I understand print preview should show a clean invoice, not the mobile app screen.

## Login And Dashboard

- [x] I can log in.
- [x] I can log out.
- [x] The Dashboard loads without errors.
- [x] Dashboard totals and recent activity look understandable.
- [x] Bottom navigation works.

Notes:


## Inventory

- [x] Inventory list loads.
- [x] Product names, quantities, and prices are readable.
- [x] Search/filtering works if available.
- [x] Product detail opens.

Notes:


## Add Stock

- [x] I can start Add Stock.
- [x] I can choose a product.
- [x] I can enter a quantity.
- [x] Review screen is clear.
- [x] Success screen is clear.
- [x] Inventory quantity updates as expected.

Notes:


## Adjust Count

- [x] I can open Adjust Count for a product.
- [x] I can enter a new count.
- [x] I can enter a reason.
- [x] Review/confirmation is clear.
- [x] Inventory quantity updates as expected.

Notes:


## Take Feed - Customer

- [x] I can choose Customer.
- [x] I can choose a customer account.
- [x] I can add products to the cart.
- [x] Quantities and prices look correct.
- [x] Review invoice screen is clear.
- [x] Invoice created screen is clear.

Notes:


## Invoice Detail

- [x] I can open the created invoice.
- [x] Invoice number is shown.
- [x] Customer/account name is shown.
- [x] Line items are shown.
- [x] Subtotal, tax, total, amount paid, and balance due are clear.
- [x] Notes are shown if entered.
- [x] Status is clear.

Notes:


## Print / Save PDF

- [x] I tapped Save / Print PDF.
- [x] Print preview shows a clean invoice.
- [x] Print preview does not show the mobile app screen.
- [x] Invoice title, C&C Feed, invoice number, customer, line items, totals, and notes appear in print preview.
- [x] I can save or print from the browser/device.

If print preview shows the app screen, refresh the app and try again.

Notes:


## Send Email Helper

- [x] I opened Send options.
- [x] Saved customer email is shown if available.
- [x] I can enter a different email address.
- [x] Copy Invoice Text works.
- [x] Instructions for attaching a PDF are clear.

Notes:


## Record Payment

- [x] I can open Record Payment from an unpaid invoice.
- [x] Invoice/customer/balance information is clear.
- [x] I can enter payment amount and method.
- [x] Payment recorded screen is clear.
- [x] Invoice balance updates as expected.

Notes:


## Take Feed - K2

- [x] I can choose K2.
- [x] I can add products to the K2 cart.
- [x] Review K2 statement screen is clear.
- [x] K2 statement created screen is clear.
- [x] Inventory quantity updates as expected.

Notes:


## K2 Statement Detail

- [x] I can find/open the K2 statement.
- [x] K2 statement type is clear.
- [x] Line items and totals are clear.
- [x] Email, payment, write-off, and void actions are correctly unavailable if shown.

Notes:


## Accounts

- [x] Accounts list loads.
- [x] Customer accounts are readable.
- [x] K2 account is understandable as internal/separate.
- [x] Account detail opens.
- [x] Account activity/invoices are understandable.

Notes:


## Add Account

- [x] I can open Add Account.
- [x] Required fields are clear.
- [x] I can create a customer account.
- [x] New account appears in the accounts list.

Notes:


## Reports

- [x] Reports list loads.
- [x] Report names are understandable.
- [x] Inventory report opens.
- [x] Customer sales/unpaid/payment reports open if available.
- [x] Report totals look reasonable.

Notes:


## Activity History

- [x] Activity History loads.
- [x] Recent actions appear.
- [x] Activity descriptions are understandable.
- [x] Activity detail opens.

Notes:


## Profile Menu

- [x] Profile Menu opens.
- [x] My name/email/role are shown correctly.
- [x] App version/build marker is visible.
- [x] Role & Permissions page is understandable.
- [x] Sign Out works.

Notes:


## Manage Users - Admin Only

Complete this section only if you are testing with an admin account.

- [x] Manage Users opens for an admin.
- [x] Manage Users does not open for a non-admin.
- [x] The beta note explains that users are session-only.
- [x] Add User creates a local/session-only invited user.
- [x] Edit buttons are clearly Coming Soon and disabled.
- [ ] Leaving/reloading the app clears local/session-only added users as expected.

Notes:


## Stale UI / Cache Check

- [x] I checked the build marker in Profile Menu before testing.
- [x] Build marker matches the expected version.
- [ ] If the build marker was wrong, I refreshed or cleared browser data before testing.
- [ ] After refresh, the build marker is correct.

Notes:


## Confusing Screens

List any screens that were confusing, unclear, or too hard to use.

1.
2.
3.

## Bugs

Use one block per bug.

### Bug 1

- What I clicked:
- What I expected:
- What happened:
- Screenshot attached: yes / no

### Bug 2

- What I clicked:
- What I expected:
- What happened:
- Screenshot attached: yes / no

### Bug 3

- What I clicked:
- What I expected:
- What happened:
- Screenshot attached: yes / no

## Final Feedback

- What felt easy?
- What felt slow or confusing?
- What would you change first?
- Any other notes:
