# MITOS R1 — Pay Later Runtime Certification Plan

Date: 2026-08-31
Status: CERTIFICATION BRANCH OPENED — NO RUNTIME CLAIM YET

## Isolation baseline

- Repository: `thradexIT/bookcars`
- Certification branch: `cert/mitos-r1-pay-later-runtime`
- Parent implementation branch: `feature/mitos-rental-completion`
- Frozen starting commit: `b6858ecfb6f7204508c4392dc79898b0bbfba672`
- Starting CI evidence: `mitos-closure` run #142 — success.

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

All R1 changes, if any are required, must remain on `cert/mitos-r1-pay-later-runtime` until separately reviewed.

## Preservation rule

R1 is evidence-first. Existing functional code is not changed merely to simplify the test or to make the desired result easier to obtain.

A code change is allowed only if runtime/source evidence demonstrates a reproducible defect that blocks the frozen rental journey. Any corrective change must be:

1. minimal;
2. local to the demonstrated defect;
3. covered by a focused regression test where practical;
4. followed by the existing MITOS CI gate;
5. documented with before/after behavior and exact files touched.

## R1 journey to certify

The Pay Later path must be proven as one coherent rental lifecycle:

`Landing → Search → Vehicle → Reservation (Pay Later) → Admin → LaborSync → Checkout departure → Return → Check-in / inspection → Closure → Reservation completed`

## Required state evidence

The runtime evidence must demonstrate, where the corresponding explicit state exists:

### Reservation

- reservation is accepted;
- Pay Later does not leave the reservation in `awaiting_payment`;
- reservation becomes `confirmed` before physical handover;
- an unconfirmed explicit MitoS reservation cannot be checked out;
- after successful rental closure, a confirmed reservation becomes `completed`.

### Rental lifecycle

The physical rental lifecycle must preserve order:

`reserved → checked_out → returned → closed`

Illegal forward skips must fail rather than silently fabricate intermediate states. Replaying the same committed transition must remain idempotent.

## Functional surfaces to verify

- customer landing/search/vehicle selection;
- reservation checkout using Pay Later;
- authenticated Admin visibility of the booking;
- LaborSync / operational handover path;
- departure checkout;
- vehicle return;
- check-in / inspection completion;
- rental closure;
- final reservation completion.

## Evidence to record

For every gate, record:

- endpoint or UI action;
- input identity/booking reference without exposing secrets;
- HTTP/UI result;
- before state;
- after state;
- timestamp;
- whether the action was first execution or replay;
- any observed defect;
- any corrective commit if required.

Secrets, passwords, tokens and payment credentials must never be committed into evidence files.

## Stop conditions

R1 must stop and report rather than bypass the system if any of these occur:

- reservation cannot be confirmed through the legitimate Pay Later flow;
- checkout requires manually editing database state;
- lifecycle ordering can be skipped;
- closure cannot be reached through the intended Admin/LaborSync workflow;
- completed state would require a fabricated/manual mutation;
- test data would require touching production;
- validation would require deployment or a protected branch mutation.

## Certification rule

R1 may be marked `CERTIFIED` only after the complete journey is demonstrated from reservation through closure on the isolated certification workstream, with evidence retained and the branch CI green.

Until then the correct status is:

`R1 — PAY LATER E2E: NOT YET RUNTIME-CERTIFIED`.
