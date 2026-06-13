# StockLog Beta QA and App Store Readiness Checklist

Use this checklist before wider beta or App Store release. Test on the iOS Simulator and at least one physical iPhone before marking the release ready.

Tester:

Date:

Build/version:

Environment:

Device(s):

## Authentication

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Authentication | Login with a valid active user | User lands in the authenticated StockLog app for the correct organization. |  |  |
| Authentication | Logout from profile menu | Session ends and the login screen appears. |  |  |
| Authentication | Invalid password | Login fails with a clear, non-technical error. |  |  |
| Authentication | Missing profile | Authenticated user without a usable profile is blocked with a clear support/setup message. |  |  |
| Authentication | Inactive profile | Disabled or inactive user cannot access app data. |  |  |

## Onboarding

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Onboarding | Set up new ranch | New organization is created and the first user can enter the app as admin. |  |  |
| Onboarding | Create invite | Admin can create an invite for a new user. |  |  |
| Onboarding | Accept invite | Invitee can accept invite and create/sign into account. |  |  |
| Onboarding | Duplicate pending invite | Duplicate invite is prevented or explained without creating confusing duplicates. |  |  |
| Onboarding | Expired or invalid invite | Invite acceptance fails safely with a clear message. |  |  |
| Onboarding | Invited user login | Accepted invited user can log in and sees the correct organization data. |  |  |
| Onboarding | Manage Users pending invite list | Active users and pending invites both appear accurately. |  |  |

## Roles and Permissions

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Roles | Admin | Admin can access organization setup, Manage Users, and all expected write workflows. |  |  |
| Roles | Manager | Manager can manage operational records but cannot perform admin-only actions. |  |  |
| Roles | Operator | Operator can perform allowed inventory/feed workflows only. |  |  |
| Roles | Viewer | Viewer can read allowed data and cannot create or modify records. |  |  |
| Roles | Manage Users guard | Non-admin users cannot access Manage Users. |  |  |
| Roles | Disabled actions for lower roles | Buttons/actions unavailable to lower roles are hidden or disabled with clear messaging. |  |  |

## Inventory

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Inventory | Product list | Products load from Supabase with readable names, quantities, units, and prices. |  |  |
| Inventory | Product detail | Detail view shows quantity, minimum quantity, pricing, category/status, and activity where supported. |  |  |
| Inventory | Add stock | Adding stock increases current quantity and records expected activity. |  |  |
| Inventory | Adjust count | Adjusting count updates quantity and captures reason/notes where required. |  |  |
| Inventory | Low stock warning | Products at or below minimum quantity show the expected warning/report state. |  |  |
| Inventory | Inventory value | Inventory value calculations match quantity times sale price where displayed. |  |  |

## Take Feed / Sell Feed / K2

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Take Feed | Customer sale | Customer invoice can be created and inventory decreases correctly. |  |  |
| Take Feed | K2 use | K2 statement/use record can be created and inventory decreases correctly. |  |  |
| Take Feed | Insufficient inventory | User cannot take/sell more than available inventory; message is clear. |  |  |
| Take Feed | Missing price | Product with missing/zero price is handled intentionally with warning or blocked workflow. |  |  |
| Take Feed | Invoice/statement creation | Created invoice/statement is visible in the expected list/detail views. |  |  |

## Accounts

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Accounts | Customer account list | Customer accounts load and are searchable/readable where supported. |  |  |
| Accounts | K2 account | K2 account is present and clearly distinct from customer accounts. |  |  |
| Accounts | Add customer if supported | Supported customer creation path creates a customer in Supabase and shows it in lists. |  |  |
| Accounts | Edit customer if supported | Supported customer edit path persists changes and reloads correctly. |  |  |
| Accounts | Disabled family/person flows | Family/person flows remain disabled or clearly unavailable for beta. |  |  |

## Invoices and Payments

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Invoices | Invoice detail | Detail view shows customer/account, line items, totals, balance, status, and notes. |  |  |
| Invoices | Print/PDF | Print or PDF output is clean and does not show the mobile app chrome. |  |  |
| Payments | Record payment | Payment records successfully, updates invoice balance/status, and appears in detail/reporting. |  |  |
| Payments | Payment validation | Invalid payment amount or method is blocked with clear feedback. |  |  |
| Reports | Unpaid invoices report | Unpaid invoices report includes expected unpaid/partial records and totals. |  |  |

## Reports

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Reports | Inventory summary | Report opens and totals match visible inventory data. |  |  |
| Reports | Low stock | Low stock report matches products at or below minimum quantity. |  |  |
| Reports | Customer sales | Customer sales report reflects customer invoices in the selected/default period. |  |  |
| Reports | K2 use | K2 use report reflects K2 statements/use records. |  |  |
| Reports | Payments received | Payments report reflects recorded payments and totals. |  |  |
| Reports | Unpaid invoices | Unpaid invoices report reflects current invoice balances. |  |  |

## Mobile/iOS UI

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| iOS UI | Safe-area headers | Headers sit below iOS status/notch area on Simulator and physical device. |  |  |
| iOS UI | Back buttons | Back navigation is visible, tappable, and returns to the expected screen. |  |  |
| iOS UI | Top-right profile icon | Profile icon is visible, tappable, and not clipped by safe areas. |  |  |
| iOS UI | Bottom nav | Bottom navigation is visible, tappable, and avoids the home indicator. |  |  |
| iOS UI | Keyboard/form behavior | Keyboard does not hide required fields, primary buttons, or validation messages. |  |  |
| iOS UI | Simulator pass | Core workflows pass on target iOS Simulator model/version. |  |  |
| iOS UI | Physical device pass | Core workflows pass on at least one physical iPhone. |  |  |

## Data Persistence

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Persistence | Reload app | Reload/reopen keeps the user session or returns to login cleanly; saved records persist. |  |  |
| Persistence | Invited user data | Invited user logs in and sees the same organization data according to role. |  |  |
| Persistence | Same org data | Products, accounts, invoices, and reports are scoped to the expected organization. |  |  |
| Persistence | Export org data | `scripts/export-org-data.mjs` can export current org data to `private-export/` with expected counts. |  |  |
| Persistence | Dry-run launch import | `scripts/import-launch-data.mjs` dry-run passes against prepared launch CSVs with no writes. |  |  |

## Security/Privacy

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Security | No service role in frontend | No service-role key exists in frontend env vars, code, build output, or logs. |  |  |
| Security | `private-export/` gitignored | Private export folder remains ignored and no real export CSVs are staged. |  |  |
| Security | Invite code shown once | Plain invite code is displayed only at creation/acceptance handoff and is not retrievable later. |  |  |
| Security | `code_hash` not exposed | Invitation `code_hash` is not shown in UI, exports, logs, docs, or client responses. |  |  |
| Security | No mock data in production | Production app shows live Supabase data only; old mock/demo data is not visible. |  |  |
| Security | Role data access | Lower-role users cannot reach restricted data/actions by navigation or direct route. |  |  |

## App Store Prep

| Area | Test | Expected Result | Status | Notes |
| --- | --- | --- | --- | --- |
| App Store | App name/icon/splash | App name, icon, and splash screen match StockLog branding on device. |  |  |
| App Store | Bundle ID | Bundle identifier is final and matches Apple Developer/App Store Connect setup. |  |  |
| App Store | Version/build number | Version and build number are set correctly and incremented for upload. |  |  |
| App Store | Privacy policy placeholder | Privacy policy URL or placeholder page is ready for TestFlight/App Store review. |  |  |
| App Store | Support contact | Support email/contact is available and accurate. |  |  |
| App Store | Screenshots needed | Required iPhone screenshots are captured for target device sizes. |  |  |
| App Store | TestFlight readiness | Build archives, uploads, installs, and launches through TestFlight without blocking issues. |  |  |

## Likely Top Blockers to Verify

- Role/permission behavior across admin, manager, operator, and viewer accounts.
- Invite edge cases: duplicate pending, expired/invalid, and accepted-user login.
- iOS physical-device layout around safe areas, keyboard, bottom nav, and print/PDF flows.
- App Store metadata: privacy policy, support contact, screenshots, bundle ID, and build number.
- Confirm production has no exposed service-role secrets, private exports, invitation hashes, or mock data.
