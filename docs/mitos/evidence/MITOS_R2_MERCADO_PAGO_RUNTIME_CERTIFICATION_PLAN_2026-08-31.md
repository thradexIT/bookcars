# MITOS R2 — Mercado Pago Runtime Certification Plan

Date: 2026-08-31
Status: CERTIFICATION BRANCH OPENED — NO REAL PROVIDER CLAIM YET

## Isolation baseline

- Repository: `thradexIT/bookcars`
- Certification branch: `cert/mitos-r2-mercado-pago-runtime`
- Parent implementation branch: `feature/mitos-rental-completion`
- Frozen starting commit: `b6858ecfb6f7204508c4392dc79898b0bbfba672`
- Starting source CI: `mitos-closure` run #142 — success.

R2 intentionally starts from the implementation baseline rather than from the R1 Pay Later certification branch. R1 and R2 evidence remain independent.

## Protected refs / forbidden actions

R2 must not modify:

- `main`
- `developer`
- `feature/mitos-rental-completion`
- `cert/mitos-r1-pay-later-runtime`

Forbidden during R2:

- no merge;
- no deployment;
- no Railway changes;
- no production data mutation;
- no production payment;
- no committed provider credentials;
- no Ground Control work;
- no Agent Factory work;
- no broad refactor of already functional code.

Any corrective code required by reproduced R2 evidence stays only on `cert/mitos-r2-mercado-pago-runtime` until separately reviewed.

## Existing trust boundaries to preserve

The current implementation already expresses the following intended rules:

1. online Mercado Pago checkout persists a temporary Booking first;
2. quote requires the persisted reservation session id;
3. quote recalculates amount server-side;
4. browser does not send authoritative amount or currency to create-payment;
5. create-payment requires tokenized provider data, booking id, reservation session and `X-Idempotency-Key`;
6. backend sends `transaction_amount` and `external_reference` to Mercado Pago;
7. payment creation uses the provider idempotency key;
8. provider `approved` is re-read from Mercado Pago before reservation confirmation;
9. webhook authenticity is checked before provider synchronization;
10. provider amount and currency must match the authoritative booking calculation;
11. pending/in-process provider states must not confirm the reservation;
12. reconciliation is authenticated and uses the same provider truth synchronization path.

R2 must certify these boundaries rather than replace them.

## Two certification layers

### R2A — isolated provider-simulated runtime

This layer is executable without real credentials or any public deployment.

It must use:

- ephemeral MongoDB;
- real backend HTTP routes/controllers/middleware;
- real MitoS temporary booking and ReservationState models;
- real PaymentTransaction persistence;
- the Mercado Pago SDK boundary substituted only at the external provider method boundary;
- generated test webhook secret;
- no provider network call.

R2A may certify MitoS behavior around the provider boundary, but it must not claim that Mercado Pago itself accepted a real sandbox payment.

### R2B — real Mercado Pago sandbox/provider proof

This is a separate later gate and requires provider test credentials supplied through a secure runtime secret channel.

Credentials/tokens must never be committed to GitHub source or evidence.

No R2B claim may be made until a real provider call is performed and provider truth is read back. A real inbound provider webhook also requires a provider-reachable callback surface; R2 must not create a deployment merely to manufacture that evidence without explicit authorization.

## R2A flow to certify

`Temporary Booking → authoritative quote → awaiting_payment → create payment → provider pending/approved/rejected truth → webhook/reconciliation → reservation state`

## Required R2A gates

### A. Reservation/session authority

- temporary online booking exists before payment;
- wrong reservation session cannot quote or create payment;
- quote moves explicit reservation to `awaiting_payment`;
- quote returns server-owned amount/currency.

### B. Browser trust boundary

- create-payment ignores/rejects any client attempt to become amount/currency authority;
- payer email must correspond to reservation customer;
- missing idempotency key is rejected.

### C. Payment-state semantics

- provider `pending` / `in_process` maps to payment `pending`;
- pending payment does not confirm reservation;
- provider `approved` maps to payment `approved`;
- only verified provider approval confirms reservation;
- rejected/refunded mappings remain explicit.

### D. Webhook authenticity

- missing signature metadata is rejected;
- tampered HMAC is rejected;
- valid HMAC reaches provider synchronization;
- webhook replay remains safe.

### E. Provider truth validation

- provider amount mismatch fails closed;
- provider currency mismatch fails closed;
- wrong/missing external reference fails closed;
- browser redirect/callback alone cannot confirm a reservation.

### F. Idempotency

- same idempotency key replay does not create another provider payment;
- key collision across different bookings is rejected;
- webhook replay does not duplicate confirmation processing;
- reconciliation replay does not duplicate confirmation processing;
- same booking submitted with a different idempotency key while an active payment exists must be tested explicitly.

The last case is a deliberate R2 audit target. Source inspection shows the current create-payment handler first looks up the idempotency key itself. R2 must reproduce whether a second key for the same booking can cause another provider create call before any corrective change is considered.

## Evidence-first correction rule

No production-path code is changed merely because a source pattern looks suspicious.

If R2A reproduces a defect:

1. retain the failing evidence/test;
2. describe exact expected vs observed behavior;
3. make the smallest booking/payment authority correction;
4. add regression coverage;
5. rerun R2A;
6. rerun the existing MITOS lifecycle/payment CI suites;
7. document exact files changed and why.

## R2A stop conditions

Stop rather than bypass the system if:

- proof requires manually editing payment/reservation state;
- a provider approval must be fabricated outside the controlled SDK boundary stub;
- test requires a production database;
- test requires deploying an endpoint;
- credentials would need to be committed;
- a corrective change requires unrelated refactoring.

## Current claim

`R2 — MERCADO PAGO: NOT YET RUNTIME-CERTIFIED`

R1 Pay Later certification remains independent and unchanged.
