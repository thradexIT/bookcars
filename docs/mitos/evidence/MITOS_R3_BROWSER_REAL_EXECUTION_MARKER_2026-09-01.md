# MITOS R3 — Payment Brick Browser Real TEST Execution Marker

Date: 2026-09-01
Status: EXECUTION AUTHORIZED

This commit intentionally carries the `[r3-browser-real]` marker to authorize one browser certification run against Mercado Pago TEST.

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
- Mercado Pago's published Peru TEST card data
- cardholder outcome `APRO`

No real card or real-money transaction is authorized.

## Gate

The run must exercise the real MitoS browser path:

`Checkout → Payment Brick → TEST card → submit → Mercado Pago TEST → MitoS success UI`

Visible screenshots and sanitized JSON evidence must be uploaded. Raw card data, CVV, CardToken, passwords, cookies and credential values must not be persisted in evidence.

## Pre-execution validation

Safe workflow run `33519074915` on head `91a3ac625f75b24b87337b6a6b05d60495428a29` passed:

- backend compile: success
- frontend compile: success
- browser harness syntax check: success
- real browser/provider job: skipped as expected

The earlier frontend-start harness defect was closed by bootstrapping the repository's local frontend package dependencies before invoking `dev:docker`.
