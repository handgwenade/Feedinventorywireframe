# C&C Feed Inventory Beta Testing Checklist

Use this checklist while testing the app. If something does not work, write down what you clicked, what you expected, and what actually happened.

## Tester Info

- Tester name:
- Date tested:
- Device used:
- Browser used:
- App version/build seen in Profile Menu:

Expected build marker:

- App name: C&C Feed Inventory
- Version: Beta 0.1.0
- Build: 2026.05.31

If the build marker does not match the expected version, refresh the app or clear browser data before testing.

## Current Beta Notes

- [ ] I understand Manage Users is local/session-only right now.
- [ ] I understand real invites, edits, and role changes are not connected to Supabase yet.
- [ ] I understand some features may say Coming Soon.
- [ ] I understand family/person workflows are disabled for beta.
- [ ] I understand print preview should show a clean invoice, not the mobile app screen.

## Login And Dashboard

- [ ] I can log in.
- [ ] I can log out.
- [ ] The Dashboard loads without errors.
- [ ] Dashboard totals and recent activity look understandable.
- [ ] Bottom navigation works.

Notes:


## Inventory

- [ ] Inventory list loads.
- [ ] Product names, quantities, and prices are readable.
- [ ] Search/filtering works if available.
- [ ] Product detail opens.

Notes:


## Add Stock

- [ ] I can start Add Stock.
- [ ] I can choose a product.
- [ ] I can enter a quantity.
- [ ] Review screen is clear.
- [ ] Success screen is clear.
- [ ] Inventory quantity updates as expected.

Notes:


## Adjust Count

- [ ] I can open Adjust Count for a product.
- [ ] I can enter a new count.
- [ ] I can enter a reason.
- [ ] Review/confirmation is clear.
- [ ] Inventory quantity updates as expected.

Notes:


## Take Feed - Customer

- [ ] I can choose Customer.
- [ ] I can choose a customer account.
- [ ] I can add products to the cart.
- [ ] Quantities and prices look correct.
- [ ] Review invoice screen is clear.
- [ ] Invoice created screen is clear.

Notes:


## Invoice Detail

- [ ] I can open the created invoice.
- [ ] Invoice number is shown.
- [ ] Customer/account name is shown.
- [ ] Line items are shown.
- [ ] Subtotal, tax, total, amount paid, and balance due are clear.
- [ ] Notes are shown if entered.
- [ ] Status is clear.

Notes:


## Print / Save PDF

- [ ] I tapped Save / Print PDF.
- [ ] Print preview shows a clean invoice.
- [ ] Print preview does not show the mobile app screen.
- [ ] Invoice title, C&C Feed, invoice number, customer, line items, totals, and notes appear in print preview.
- [ ] I can save or print from the browser/device.

If print preview shows the app screen, refresh the app and try again.

Notes:


## Send Email Helper

- [ ] I opened Send options.
- [ ] Saved customer email is shown if available.
- [ ] I can enter a different email address.
- [ ] Copy Invoice Text works.
- [ ] Instructions for attaching a PDF are clear.

Notes:


## Record Payment

- [ ] I can open Record Payment from an unpaid invoice.
- [ ] Invoice/customer/balance information is clear.
- [ ] I can enter payment amount and method.
- [ ] Payment recorded screen is clear.
- [ ] Invoice balance updates as expected.

Notes:


## Take Feed - K2

- [ ] I can choose K2.
- [ ] I can add products to the K2 cart.
- [ ] Review K2 statement screen is clear.
- [ ] K2 statement created screen is clear.
- [ ] Inventory quantity updates as expected.

Notes:


## K2 Statement Detail

- [ ] I can find/open the K2 statement.
- [ ] K2 statement type is clear.
- [ ] Line items and totals are clear.
- [ ] Email, payment, write-off, and void actions are correctly unavailable if shown.

Notes:


## Accounts

- [ ] Accounts list loads.
- [ ] Customer accounts are readable.
- [ ] K2 account is understandable as internal/separate.
- [ ] Account detail opens.
- [ ] Account activity/invoices are understandable.

Notes:


## Add Account

- [ ] I can open Add Account.
- [ ] Required fields are clear.
- [ ] I can create a customer account.
- [ ] New account appears in the accounts list.

Notes:


## Reports

- [ ] Reports list loads.
- [ ] Report names are understandable.
- [ ] Inventory report opens.
- [ ] Customer sales/unpaid/payment reports open if available.
- [ ] Report totals look reasonable.

Notes:


## Activity History

- [ ] Activity History loads.
- [ ] Recent actions appear.
- [ ] Activity descriptions are understandable.
- [ ] Activity detail opens.

Notes:


## Profile Menu

- [ ] Profile Menu opens.
- [ ] My name/email/role are shown correctly.
- [ ] App version/build marker is visible.
- [ ] Role & Permissions page is understandable.
- [ ] Sign Out works.

Notes:


## Manage Users - Admin Only

Complete this section only if you are testing with an admin account.

- [ ] Manage Users opens for an admin.
- [ ] Manage Users does not open for a non-admin.
- [ ] The beta note explains that users are session-only.
- [ ] Add User creates a local/session-only invited user.
- [ ] Edit buttons are clearly Coming Soon and disabled.
- [ ] Leaving/reloading the app clears local/session-only added users as expected.

Notes:


## Stale UI / Cache Check

- [ ] I checked the build marker in Profile Menu before testing.
- [ ] Build marker matches the expected version.
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
