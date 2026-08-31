# MITOS Rental Completion — Execution Status v0.1

**Date:** 2026-08-31  
**Branch:** `feature/mitos-rental-completion`  
**Draft PR:** #5  
**Rule:** code/build/test only; no deploy and no merge.

## Status legend

- ✅ implemented and source-build proven
- 🟡 implemented/partially implemented but runtime proof still pending
- 🔴 not completed
- 🔒 intentionally out of scope

## Approved execution list

| # | Requirement | Status | Current evidence / gap |
|---|---|---|---|
| 1 | Close full rental E2E | 🟡 | Backend rental lifecycle authority exists and is wired to checkout departure, check-in return and closure. Full continuous runtime journey through Admin + LaborSync still pending. |
| 2 | Recover/certify authentication | 🟡 | Sign in/Register and authenticated Admin sidebar are present. Dedicated one-purpose password reset implemented for customer + Admin. Source builds proven; browser runtime certification still required. |
| 3 | Add payment method | 🟡 | Mercado Pago Payment Brick path is integrated into Checkout. Runtime provider proof pending. |
| 4 | Integrate Mercado Pago | 🟡 | Reservation-first flow, server quote and backend SDK create-payment path implemented. Real sandbox/test-user transaction proof pending. |
| 5 | Validate payments by webhook | 🟡 | Signature validation + provider read-back + amount/currency verification implemented. Real webhook delivery proof pending. |
| 6 | Reservation/payment idempotency | 🟡 | Reservation `sessionId` replay guard and provider `X-Idempotency-Key` handling implemented. Runtime duplicate/retry tests pending. |
| 7 | Explicit reservation/payment states | ✅ | `ReservationState` and `PaymentTransaction` authorities plus transition tests implemented; unknown provider states fail closed. |
| 8 | Complete real emails | 🔴 | Existing booking/activation email infrastructure remains. Dedicated reservation-received/payment-approved/cancel/payment lifecycle matrix still needs completion and proof. |
| 9 | Remove demo credentials/data | 🔴 | DEV seed still contains fallback demo identities/password. These are known and must be removed or made explicit-only before final certification. |
| 10 | Payment reconciliation | 🟡 | Authenticated provider reconciliation endpoint implemented using same provider-truth sync path as webhook. Runtime proof/runbook pending. |

## Current payment truth model

```text
Browser
  = intent + tokenized provider data

MITOS backend
  = Booking + price + reservation/payment state authority

Mercado Pago
  = provider transaction truth

Webhook / reconciliation
  = synchronization mechanisms
```

## Current reservation/payment sequence

```text
Checkout form
  ↓
Temporary Booking
  ↓
Reservation pending
  ↓
Reservation awaiting_payment
  ↓
Authoritative backend quote
  ↓
Mercado Pago Brick
  ↓
Payment create with X-Idempotency-Key
  ↓
Provider read-back / verified webhook
  ↓
Payment approved?
  ├─ NO → reservation remains unconfirmed
  └─ YES → reservation confirmed
```

## Current rental operational sequence

```text
Reservation confirmed
  ↓
reserved
  ↓
checked_out
  ↓
returned
  ↓
closed
```

## Hard gates before claiming completion

1. customer frontend source build must pass after reservation-first Checkout rewrite;
2. real local/browser authentication proof;
3. Mercado Pago sandbox/test-user payment proof;
4. valid and invalid webhook delivery proof;
5. duplicate checkout and duplicate webhook replay proof;
6. payment reconciliation proof;
7. transactional email matrix completed;
8. demo credential cleanup completed;
9. full Admin + LaborSync + checkout + return + check-in + closure E2E;
10. final documentation/evidence receipt.

## Explicit non-claims

This status does **not** claim:

- production readiness;
- deployed Mercado Pago configuration;
- Railway changes;
- live money movement;
- Ground Control integration;
- Agent Factory integration;
- final E2E certification.
