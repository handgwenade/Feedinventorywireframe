# C&C Feed Inventory User Testing Checklist

## Testing Goal

The goal is to confirm that real users can complete the core feed inventory workflows without explanation.

Do not give users a guided tour first.

Give them tasks and watch what they do.

Record:

- where they hesitate
- what labels confuse them
- what they tap first
- what they ignore
- what they expected to happen
- what they say out loud
- where they need help

If a user gets stuck, note exactly where.

---

## Test Setup

Tester:

Date:

Device:

Prototype link:

User role being tested:

- Admin
- Manager
- Operator
- View Only

---

## Core Task Tests

### Task 1 — Customer Take Feed

Scenario:

Johnson Ranch is buying 10 Garlic Salt Blocks and paying later.

Ask:

Can you record that?

Observe:

- Can they find Take Feed?
- Do they choose Customer?
- Can they choose or find Johnson Ranch?
- Can they add Garlic Salt Blocks?
- Can they enter quantity 10?
- Do they understand that an invoice/record is created?
- Do they understand payment can happen later?

Pass / Fail:

Notes:

---

### Task 2 — K2 Take Feed

Scenario:

K2 took 2 Garlic Salt Blocks.

Ask:

Can you record that?

Observe:

- Do they choose K2?
- Do they understand K2 is separate from Customer?
- Can they add the product and quantity?
- Do they understand it reduces C&C inventory?
- Do they understand this is not a normal customer sale?

Pass / Fail:

Notes:

---

### Task 3 — Family Use

Scenario:

Bill Johnson took 3 Garlic Salt Blocks for family use.

Ask:

Can you record that?

Observe:

- Do they choose Family?
- Do they understand “Who took it?”
- Can they select Bill Johnson from the controlled list?
- Do they avoid typing a duplicate person name?
- Do they understand this is for accountability?

Pass / Fail:

Notes:

---

### Task 4 — Add Stock

Scenario:

A delivery came in: 40 Redmond Mineral Salt.

Ask:

Can you add that stock?

Observe:

- Can they find Add Stock?
- Can they select Redmond Mineral Salt?
- Can they enter quantity 40?
- Do they understand the new quantity preview?
- Do they avoid invoice/payment areas?

Pass / Fail:

Notes:

---

### Task 5 — Find Low Stock

Scenario:

You need to see which products are running low.

Ask:

Can you find low-stock products?

Observe:

- Do they go to Inventory or Reports?
- Can they use the Low Stock filter/report?
- Do product quantities and minimums make sense?

Pass / Fail:

Notes:

---

### Task 6 — Find Who Owes Money

Scenario:

You want to see who owes money.

Ask:

Can you find unpaid balances?

Observe:

- Do they go to Invoices, Accounts, or Reports?
- Can they identify unpaid records?
- Is Balance Due obvious?
- Do they understand Customer/K2/Family separation?

Pass / Fail:

Notes:

---

### Task 7 — Record Payment

Scenario:

An unpaid customer gives you a check payment.

Ask:

Can you record the payment?

Observe:

- Can they find the unpaid invoice?
- Can they tap Record Payment?
- Can they choose Check?
- Can they enter a check number?
- Do they understand payment changes balance/status but not inventory?

Pass / Fail:

Notes:

---

### Task 8 — Activity History

Scenario:

You want to see who changed inventory recently.

Ask:

Can you find recent inventory activity?

Observe:

- Can they find Activity History?
- Can they identify who recorded the action?
- Can they see what changed?
- Can they see quantity before/after when relevant?
- Do they understand activity should not be casually edited?

Pass / Fail:

Notes:

---

### Task 9 — Account History

Scenario:

You want to see what a specific customer or family person has done recently.

Ask:

Can you find that account/person history?

Observe:

- Can they find Accounts?
- Can they search/select the right account/person?
- Can they view recent activity?
- Can they distinguish Customer, K2, and Family records?

Pass / Fail:

Notes:

---

### Task 10 — Role and Permissions

Scenario:

You want to understand what your user role allows you to do.

Ask:

Can you find your role and permissions?

Observe:

- Can they tap the user icon?
- Can they find Role & Permissions?
- Do they understand why cost per unit may be hidden?
- Do they understand what View Only cannot do?

Pass / Fail:

Notes:

---

## Overall Findings

Most confusing labels:

Most confusing screen:

Most successful workflow:

Most broken workflow:

Things users expected but did not find:

Things users ignored:

Features that may not be needed:

Features that may need to move earlier:

---

## Go / No-Go for MVP Spec

The wireframes are ready for MVP build specification when users can complete these without guided explanation:

- Customer Take Feed
- K2 Take Feed
- Family Use
- Add Stock
- Find Inventory
- Find Unpaid Balance
- Record Payment
- View Activity History