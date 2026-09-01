# MITOS R3 — Payment Brick Browser Real TEST Execution Marker

Date: 2026-09-01
Status: DIAGNOSTIC EXECUTION AUTHORIZED

This commit intentionally carries the `[r3-browser-real]` marker to authorize one browser certification/diagnostic run against the isolated MitoS Checkout and, only if the reservation form succeeds, Mercado Pago TEST.

## Isolation

- Branch: `cert/mitos-r3-browser-e2e`
- No deploy.
- No merge.
- No Railway mutation.
- No production database.
- No production credentials.
- `main` untouched.
- `developer` untouched.

## Safety

The run uses only:

- `MITOS_MP_TEST_PUBLIC_KEY`
- `MITOS_MP_TEST_ACCESS_TOKEN`
- Mercado Pago's published Peru TEST card data if the Brick is reached
- cardholder outcome `APRO`

No real card or real-money transaction is authorized.

## Current diagnostic gate

The previous real browser attempt proved that the real Checkout rendered, but no `/api/checkout`, quote or payment request occurred after clicking Reservar. Mercado Pago was therefore not called in that attempt.

The harness now records, without storing sensitive field values:

- sanitized `/api/*` path/status activity;
- HTML validity and `aria-invalid` metadata for driver inputs;
- whether birth date contains a value;
- terms/payment-option checked state;
- visible validation/helper messages;
- `01b-after-reserve.png` when the submit is blocked before the Brick.

If the Checkout successfully advances, the normal R3 gate continues:

`Checkout → Payment Brick → TEST card → submit → Mercado Pago TEST → MitoS success UI`

Raw email values, card data, CVV, CardToken, passwords, cookies and credential values are not persisted in evidence.

## Pre-execution validation

Safe workflow run `33520450897` on head `5be3d049cedfce1dc87decfd8375b5bfbd6e031e` passed:

- backend compile: success
- frontend compile: success
- browser diagnostic syntax check: success
- real browser/provider job: skipped as expected
