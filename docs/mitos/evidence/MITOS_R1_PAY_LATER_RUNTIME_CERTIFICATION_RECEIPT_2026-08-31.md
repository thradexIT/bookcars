# MITOS R1 — Pay Later Runtime Certification Receipt

Date: 2026-08-31
Status: CERTIFIED IN ISOLATED EPHEMERAL RUNTIME

## Scope certified

This receipt certifies the R1 Pay Later runtime gate for the isolated MitoS certification branch only.

Journey exercised through the real backend HTTP process:

`Customer/Auth → Reservation (Pay Later) → Admin/LaborSync visibility → Checkout departure → Return → Inspection verification → Closure → Reservation completed`

This is not a production deployment certificate and does not authorize a merge.

## Isolation boundary

Repository: `thradexIT/bookcars`

Certification branch:

`cert/mitos-r1-pay-later-runtime`

Parent implementation baseline:

`feature/mitos-rental-completion`

Protected refs explicitly left untouched:

- `main`
- `developer`
- `feature/mitos-rental-completion`

No deployment was performed.
No Railway service was changed.
No production database was accessed.
No Ground Control work was performed.
No Agent Factory work was performed.

## Runtime evidence

Workflow: `mitos-r1-runtime`

Run ID: `33437658767`

Run number: `1`

Head SHA under test:

`606cec77434b0a21cccc22ba728fb437379a3952`

Job: `pay-later-e2e`

Conclusion: `success`

Evidence artifact:

`mitos-r1-runtime-evidence-33437658767`

Artifact ID: `9775024719`

Artifact digest:

`sha256:023b95807cd2ec170a80dd382e02c7d7fef4870e8db3670c7f254faf666fb844`

The artifact is intentionally retained as runtime evidence and contains no passwords, JWTs, payment credentials or provider secrets.

## Environment used

The workflow created an ephemeral environment only for the certification job:

- GitHub Actions runner;
- `mongo:7` service container;
- MongoDB bound to runner localhost;
- real MitoS backend HTTP process on local port `4002`;
- explicit MitoS DEV fixture seed enabled only inside the ephemeral job;
- random password, cookie secret and JWT secret generated at runtime;
- fixture customer/admin/supplier identities generated from the workflow run id;
- email provider disabled for this gate;
- no external payment operation;
- no remote environment mutation.

The Mongo service and backend process were destroyed when the job ended.

## Baseline regression proof

Before executing R1, the workflow successfully completed:

1. backend dependency installation;
2. backend TypeScript/build baseline;
3. existing rental lifecycle service tests;
4. existing payment state service tests;
5. existing Mercado Pago webhook tests;
6. existing transactional email semantics tests;
7. isolated MitoS fixture seed;
8. real backend HTTP startup.

All steps completed successfully before the R1 runtime sequence was accepted.

## Runtime evidence — exact gates

### 1. Customer HTTP authentication

Result: `HTTP 200`

The seeded customer identity was accepted by the real `/api/sign-in/frontend` HTTP path using a runtime-generated password.

No token value was recorded in evidence.

### 2. Admin/operator HTTP authentication

Result: `HTTP 200`

The seeded admin identity was accepted by the real `/api/sign-in/admin` HTTP path.

The returned mobile token was used only in-memory to exercise authenticated operational endpoints.

### 3. Legitimate unpaid reservation remains unconfirmed

Result: `HTTP 200`

An unpaid checkout session was created through `/api/checkout` without fabricating database state.

Observed explicit reservation state:

`pending`

### 4. Reservation-session replay is idempotent

Result: `HTTP 200`

The same unpaid reservation session was submitted again.

Observed result:

- the same booking id was returned;
- persisted bookings for that session remained exactly `1`.

This proves the session-level reservation replay guard in a real backend process.

### 5. Physical handover is blocked before confirmation

Result: `HTTP 409`

Attempted transition:

`pending reservation → checkout departure`

Backend response:

`Reservation must be confirmed before checkout (current: pending)`

Lifecycle remained:

`reserved`

### 6. Return cannot skip checkout

Result: `HTTP 409`

Attempted lifecycle transition:

`reserved → returned`

Backend response:

`Invalid rental lifecycle transition: reserved -> returned`

Lifecycle remained:

`reserved`

### 7. Pay Later creates a confirmed reservation

Result: `HTTP 200`

The primary R1 reservation was created using the same checkout contract emitted by the customer frontend:

- inherited booking status starts `pending`;
- `payLater=true`;
- no payment provider operation occurs.

Observed explicit reservation transition:

`pending → confirmed`

This confirms that Pay Later is treated as a commercially confirmed reservation with deferred collection, not as `awaiting_payment`.

### 8. Rental lifecycle starts reserved

Result: `HTTP 200`

Before physical departure, the lifecycle read endpoint returned:

`reserved`

The response correctly reported the state as implicit before the first physical transition.

### 9. Booking visible through Admin/LaborSync operational query

Result: `HTTP 200`

The primary Pay Later booking was present in the authenticated booking query used by the Admin/LaborSync operational surface.

This proves backend visibility through the operational query contract. It does not yet claim browser/mobile visual certification of those interfaces.

### 10. Departure advances lifecycle

Result: `HTTP 200`

Observed transition:

`reserved → checked_out`

Operational departure evidence persisted:

- `kmOut = 1000`
- fuel/remarks submitted through multipart form data.

### 11. Departure replay is idempotent

Result: `HTTP 200`

The same departure operation was replayed after the first successful departure.

Observed result:

- lifecycle remained `checked_out`;
- exactly one RentalLifecycle document existed for the booking.

### 12. Return advances lifecycle

Result: `HTTP 200`

Observed transition:

`checked_out → returned`

Operational return evidence persisted:

- `kmIn = 1012`
- return fuel/remarks submitted through multipart form data.

### 13. Return replay is idempotent before closure

Result: `HTTP 200`

The same return operation was replayed before inspection closure.

Observed result:

`returned → returned`

No illegal additional lifecycle transition was created.

### 14. Inspection closes rental and completes reservation

Result: `HTTP 200`

Inspection verification submitted:

- `picturesOutVerified = true`
- `picturesInVerified = true`

Observed authoritative transition:

`returned → closed`

Observed reservation transition:

`confirmed → completed`

### 15. Final persisted state

Final operational evidence read from the ephemeral database:

- `kmOut = 1000`
- `kmIn = 1012`
- `picturesOutVerified = true`
- `picturesInVerified = true`
- reservation = `completed`
- rental lifecycle = `closed`

## R1 verdict

The following R1 backend/runtime path is now certified on the isolated branch:

`Pay Later reservation → confirmed → Admin/LaborSync operational visibility → checked_out → returned → inspection verified → closed → reservation completed`

The safety guards were also runtime-proven:

- unconfirmed explicit reservation cannot be handed over;
- return cannot skip checkout;
- reservation-session replay does not duplicate the temporary booking;
- departure replay does not duplicate the lifecycle;
- return replay remains idempotent before closure.

Therefore:

`R1 — PAY LATER BACKEND/OPERATIONAL E2E: CERTIFIED`

## Explicit non-claims

R1 does NOT certify:

- production readiness;
- deployment readiness;
- merge readiness;
- browser rendering/visual UX of Landing, Search, Vehicle, Admin or LaborSync;
- real mobile-device LaborSync behavior;
- Mercado Pago sandbox or production payment;
- signed Mercado Pago webhook delivery;
- payment reconciliation;
- real transactional email provider delivery;
- password-reset browser UX;
- production secrets;
- external Odoo correctness;
- Ground Control;
- Agent Factory.

Those remain separate gates.

## Code preservation statement

No existing controller, service, model, frontend component, Admin component or LaborSync component was modified to obtain this certification.

The R1 branch added only certification infrastructure/documentation:

- `backend/scripts/mitos-r1-runtime-cert.ts`
- `.github/workflows/mitos-r1-runtime.yml`
- R1 planning/evidence documents.

If a future runtime gate reveals a defect, any correction must remain isolated on its own reviewable branch until explicitly approved.
