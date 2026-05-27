# Known Limitations

This document tracks known production limitations for StockLog / C&C Feed Inventory so they are visible during testing, deployment review, and planning.

## Access And User Management

- No real user invites yet.
- No role management UI yet.

## Record Corrections

- No restore/unarchive flow yet.
- No invoice void/write-off flow yet.
- No refunds or payment edits yet.

## Payment Flows

- No K2 payment flow yet.
- No family payment flow yet.

## Reports And Outputs

- Date filters may still be wireframe/static where applicable.
- Export may still be wireframe/static where applicable.
- Print may still be wireframe/static where applicable.

## Media And Offline Use

- No image upload.
- No offline mode.

## Testing And Release Process

- No formal automated tests yet.
- Migrations have been applied manually so far; the Supabase CLI workflow should be formalized.

## Notes

Use `docs/production-smoke-test.md` to separate expected limitations from new production findings. If a limitation causes data risk, workflow confusion, or repeated manual cleanup, promote it to a planned engineering task.
