# MITOS R2B — Real Mercado Pago Test-Provider Gate Preparation Receipt

Date: 2026-08-31
Status: **GATE IMPLEMENTED AND VALIDATED — REAL PROVIDER EXECUTION STILL PENDING**

## Isolation

- Repository: `thradexIT/bookcars`
- Branch: `cert/mitos-r2b-mercado-pago-sandbox`
- Draft PR: #8
- Base: `cert/mitos-r2-mercado-pago-runtime`
- Base SHA at branch creation: `24605411f91c34240463a3affa543b3d04a36eaa`
- No merge.
- No deploy.
- No Railway changes.
- No production mutation.
- `main` and `developer` untouched.

## Implemented gate

R2B now contains a real-provider certification harness:

- `backend/scripts/mitos-r2b-provider-cert.ts`
- `.github/workflows/mitos-r2b-sandbox.yml`
- `backend/scripts/mitos-r2b-secret-literal-scan.ts`

The harness does **not** stub `Payment.create` or `Payment.get`.
When manually executed with Mercado Pago test credentials, it will use the real Mercado Pago SDK/provider boundary.

## Safety properties

A normal branch push:

- installs backend dependencies;
- compiles the backend and R2B harness;
- scans R2B certification files for credential-like literals;
- does **not** execute the real-provider job;
- does **not** require Mercado Pago secrets;
- does **not** create a payment.

The real-provider job is restricted to `workflow_dispatch` and fails closed if either of these secrets is absent:

- `MITOS_MP_TEST_ACCESS_TOKEN`
- `MITOS_MP_TEST_CARD_TOKEN`

`MITOS_MP_TEST_CARD_TOKEN` is explicitly treated as a one-time test token and must not be committed or printed.

## Real-provider proof encoded in the harness

On authorized manual execution the harness will prove:

1. isolated MitoS booking creation;
2. backend-owned quote before payment;
3. reservation enters `awaiting_payment`;
4. real provider payment creation through MitoS backend;
5. direct real-provider read-back using Mercado Pago SDK;
6. provider `live_mode === false`;
7. provider `external_reference === bookingId`;
8. provider amount equals the MitoS server quote;
9. provider currency is `PEN`;
10. provider status matches the expected test scenario;
11. approved provider truth confirms the reservation;
12. non-approved provider truth does not confirm the reservation;
13. same idempotency key reuses the same provider payment;
14. for active payments, a distinct key is rejected with HTTP 409;
15. Admin reconciliation re-reads provider truth.

No browser redirect is used as payment authority.

## Validation evidence

Validation workflow:

- workflow: `mitos-r2b-sandbox`
- run id: `33450792354`
- head: `7694b07041b1038aaa008205e50a024880e05f2a`
- conclusion: **success**

Validated steps:

```text
Checkout R2B branch                         success
Use Node.js LTS                             success
Install backend dependencies                success
Compile R2B harness with backend            success
Credential-literal scan                     success
real-test-provider                          skipped (expected on push)
```

The first validation run exposed a false positive because the credential regex was embedded in the workflow being scanned. That was a certification-harness defect, not a product defect. It was corrected by moving the scanner into a separate script; the second validation run passed.

## Diff boundary

Relative to the certified R2A parent, R2B preparation adds certification infrastructure/documentation only. It does not modify inherited payment controllers, routes, reservation logic, lifecycle logic, frontend behavior, Admin behavior, or pricing logic.

## Current claim

```text
R1 Pay Later runtime                       CERTIFIED
R2A Mercado Pago application boundary      CERTIFIED
R2A concurrent payment race                CLOSED / CERTIFIED
R2B real-provider gate implementation      READY / VALIDATED
R2B real Mercado Pago test provider        NOT YET EXECUTED
Real Brick/CardToken browser proof          NOT YET CERTIFIED
Real inbound Mercado Pago webhook           NOT YET CERTIFIED
Production readiness                       NOT CLAIMED
Merge readiness                            NOT CLAIMED
```

## Remaining external prerequisite

A real provider execution requires intentionally supplied Mercado Pago **test** credentials and a fresh one-time test CardToken. The repository contains no substitute or fallback credential and will not silently use production credentials.
