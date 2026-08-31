# MITOS R1 — Pay Later Runtime Certification Plan

Date: 2026-08-31
Status: CERTIFIED — ISOLATED EPHEMERAL RUNTIME

## Isolation baseline

- Repository: `thradexIT/bookcars`
- Certification branch: `cert/mitos-r1-pay-later-runtime`
- Parent implementation branch: `feature/mitos-rental-completion`
- Frozen starting commit: `b6858ecfb6f7204508c4392dc79898b0bbfba672`
- Starting CI evidence: `mitos-closure` run #142 — success.
- R1 runtime evidence: `mitos-r1-runtime` run `33437658767` — success.
- Runtime head under certification: `606cec77434b0a21cccc22ba728fb437379a3952`.
- Evidence receipt: `docs/mitos/evidence/MITOS_R1_PAY_LATER_RUNTIME_CERTIFICATION_RECEIPT_2026-08-31.md`.

## Protected refs / forbidden actions

The following refs must not be modified by R1 certification work:

- `main`
- `developer`
- `feature/mitos-rental-completion`

The following actions are explicitly forbidden during R1:

- no merge;
- no deployment;
- no Railway service changes;
- no production data mutation;
- no Ground Control work;
- no Agent Factory work;
- no broad refactor of code that is already functional.

All R1 changes remain on `cert/mitos-r1-pay-later-runtime` until separately reviewed.

## Preservation rule

R1 is evidence-first. Existing functional code is not changed merely to simplify the test or to make the desired result easier to obtain.

A code change is allowed only if runtime/source evidence demonstrates a reproducible defect that blocks the frozen rental journey. Any corrective change must be:

1. minimal;
2. local to the demonstrated defect;
3. covered by a focused regression test where practical;
4. followed by the existing MITOS CI gate;
5. documented with before/after behavior and exact files touched.

No functional corrective change was required to certify R1.

## R1 journey certified

The Pay Later backend/operational path was demonstrated as one coherent rental lifecycle:

`Customer/Auth → Reservation (Pay Later) → Admin/LaborSync operational visibility → Checkout departure → Return → Check-in / inspection → Closure → Reservation completed`

## Required state evidence

### Reservation

Runtime evidence demonstrated:

- reservation is accepted;
- Pay Later does not remain in `awaiting_payment`;
- Pay Later reservation becomes `confirmed` before physical handover;
- an unconfirmed explicit MitoS reservation is rejected at checkout with HTTP 409;
- after successful rental closure, the confirmed reservation becomes `completed`.

### Rental lifecycle

Runtime evidence demonstrated the ordered lifecycle:

`reserved → checked_out → returned → closed`

It also demonstrated:

- `reserved → returned` is rejected with HTTP 409;
- replay of committed departure remains `checked_out` with one lifecycle document;
- replay of committed return remains `returned` before closure.

## Functional surfaces exercised

The runtime gate exercised backend contracts corresponding to:

- customer authentication;
- reservation checkout using Pay Later;
- authenticated Admin/operator authentication;
- authenticated Admin/LaborSync booking visibility query;
- departure checkout;
- vehicle return;
- check-in / inspection completion;
- rental closure;
- final reservation completion.

Browser rendering and real mobile-device visual interaction remain separate non-claims.

## Evidence retained

Workflow:

`mitos-r1-runtime`

Successful run:

`33437658767`

Evidence artifact:

`mitos-r1-runtime-evidence-33437658767`

Artifact digest:

`sha256:023b95807cd2ec170a80dd382e02c7d7fef4870e8db3670c7f254faf666fb844`

The artifact records:

- endpoint/action result;
- HTTP status;
- before/after state where relevant;
- timestamps;
- replay markers;
- observed safety failures;
- final lifecycle/reservation state.

No password, access token, JWT, payment token or provider secret is retained in the evidence.

## Stop conditions result

None of the R1 stop conditions occurred:

- reservation confirmed through legitimate Pay Later flow;
- no database state was manually edited to complete the journey;
- lifecycle ordering could not be skipped;
- closure was reached through intended operational endpoints;
- completed state was produced by rental closure rather than fabricated mutation;
- only ephemeral test data was used;
- no deployment or protected branch mutation was required.

## Certification rule result

The complete Pay Later backend/operational journey was demonstrated from reservation through closure on the isolated certification workstream, evidence was retained, and the R1 runtime job completed successfully.

Therefore the current R1 status is:

`R1 — PAY LATER BACKEND/OPERATIONAL E2E: CERTIFIED`.

This does not authorize deployment or merge and does not yet certify browser/mobile visual UX.
