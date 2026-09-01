# MITOS R2B — Real Mercado Pago Test-Provider Gate Preparation Receipt

Date: 2026-08-31
Status: **REAL TEST-PROVIDER EXECUTION ARMED — APPROVED SCENARIO**

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

R2B contains a real-provider certification harness:

- `backend/scripts/mitos-r2b-provider-cert.ts`
- `.github/workflows/mitos-r2b-sandbox.yml`
- `backend/scripts/mitos-r2b-secret-literal-scan.ts`

The harness does **not** stub `Payment.create` or `Payment.get`.
It uses the real Mercado Pago TEST provider boundary.

## Credential and tokenization contract

Repository/GitHub Actions secrets are supplied externally and are never committed:

- `MITOS_MP_TEST_ACCESS_TOKEN`
- `MITOS_MP_TEST_PUBLIC_KEY`

The obsolete `MITOS_MP_TEST_CARD_TOKEN` requirement was removed before real execution.

R2B now creates a fresh, one-time CardToken at runtime using:

- the Mercado Pago TEST Public Key;
- Mercado Pago's published Peru TEST card data;
- the test cardholder outcome code for the requested scenario.

The CardToken:

- exists only in runtime memory;
- is masked immediately in GitHub Actions;
- is never added to GitHub Secrets;
- is never persisted in evidence;
- is never committed;
- is never printed intentionally.

## Safety properties

A normal branch push:

- installs backend dependencies;
- compiles the backend and R2B harness;
- scans R2B certification files for credential-like literals;
- does **not** execute the real-provider job;
- does **not** require Mercado Pago secrets;
- does **not** create a payment.

The real-provider job runs only when either:

- manually invoked through `workflow_dispatch`; or
- a deliberate certification commit contains the marker `[r2b-real]`.

The real-provider job fails closed if either TEST credential is absent or if the Public Key is not explicitly TEST-scoped.

Only Mercado Pago TEST card data is used. No real card data is used anywhere in R2B.

## Real-provider proof encoded in the harness

The authorized execution proves:

1. isolated MitoS booking creation;
2. backend-owned quote before payment;
3. reservation enters `awaiting_payment`;
4. fresh Mercado Pago TEST CardToken generation;
5. real provider payment creation through MitoS backend;
6. direct real-provider read-back using Mercado Pago SDK;
7. provider `live_mode === false`;
8. provider `external_reference === bookingId`;
9. provider amount equals the MitoS server quote;
10. provider currency is `PEN`;
11. provider status matches the expected test scenario;
12. approved provider truth confirms the reservation;
13. non-approved provider truth does not confirm the reservation;
14. same idempotency key reuses the same provider payment without a second provider call;
15. for active payments, a distinct key is rejected with HTTP 409 before provider create;
16. Admin reconciliation re-reads provider truth.

No browser redirect is used as payment authority.

## Latest safe pre-execution validation

Validation workflow:

- workflow: `mitos-r2b-sandbox`
- run id: `33454397258`
- head: `24d8c3753e4a729f3dadeac427068faee04cf26c`
- conclusion: **success**

Validated steps:

```text
Checkout R2B branch                         success
Use Node.js LTS                             success
Install backend dependencies                success
Compile R2B harness with backend            success
Credential-literal scan                     success
real-test-provider                          skipped (expected on ordinary push)
```

This validation occurred after removing the manual CardToken secret requirement.

## Diff boundary

Relative to the certified R2A parent, R2B changes certification infrastructure/documentation only. It does not modify inherited payment controllers, routes, reservation logic, lifecycle logic, frontend behavior, Admin behavior, or pricing logic.

## Current execution trigger

The user configured both required Mercado Pago TEST credentials as GitHub repository secrets on 2026-08-31.

This commit intentionally carries `[r2b-real]` to authorize one real TEST-provider run using the default approved scenario.

No secret values are recorded here.

## Current claim before provider result

```text
R1 Pay Later runtime                       CERTIFIED
R2A Mercado Pago application boundary      CERTIFIED
R2A concurrent payment race                CLOSED / CERTIFIED
R2B real-provider gate implementation      READY / VALIDATED
R2B real Mercado Pago test provider        EXECUTION ARMED
Real Brick browser UI proof                 NOT YET CERTIFIED
Real inbound Mercado Pago webhook           NOT YET CERTIFIED
Production readiness                       NOT CLAIMED
Merge readiness                            NOT CLAIMED
```
