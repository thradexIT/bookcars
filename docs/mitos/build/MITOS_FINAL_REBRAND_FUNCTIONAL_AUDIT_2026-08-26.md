# MITOS — Final Rebrand + Functional Audit

**Updated:** 2026-08-28  
**Branch:** `feature/mitos-public-experience-v1`  
**Status:** LOCAL PRODUCT CLOSURE PASS / READY FOR REVIEW

## Executive verdict

Mitos is a materially functional rental product built on the recovered BookCars transactional core. The local acceptance lane now has runtime evidence for visible identity, authentication, fleet, date-aware availability, customer booking persistence/history/detail, Admin fleet visibility, Admin booking visibility and the executable closure probe.

The final release-blocking availability inconsistency was corrected and runtime re-tested successfully. An active overlapping booking now excludes the car from customer search for the occupied interval, while the same car becomes available again for a non-overlapping period.

Internal `bookcars` implementation identifiers remain acceptable only for infrastructure such as repository/package names, Mongo/CDN paths, containers and compatibility identifiers.

## Runtime evidence established

### Customer booking lifecycle

Observed in DEV:

```text
MITOS customer login
→ La Molina + future dates
→ Toyota Yaris 2025/26 / Toyota Raize
→ Checkout
→ Pagar al recoger
→ Reservar
→ MITOS confirmation
→ Mis reservas
→ Pending booking visible
→ booking detail
```

Observed booking receipts include:

```text
Toyota Yaris 2025/26
31 Aug 2026 10:00 → 03 Sep 2026 10:00
La Molina, Lima
$105
Pending

Toyota Raize
31 Aug 2026 10:00 → 03 Sep 2026 10:00
La Molina, Lima
$135
Pending
```

Booking persistence/history continuity is **RUNTIME PASS**.

### Admin

Observed:

```text
MITOS ADMIN                                      ✅
Admin authentication                             ✅
Admin → Cars: Yaris + Raize                     ✅
Admin → Reservas                                ✅
Yaris / John Doe / 31-08→03-09 / $105 / Pending ✅
Raize / John Doe / 31-08→03-09 / $135 / Pending ✅
```

The prior `Sin filas` defect is closed. Admin booking suppliers derive from persisted Booking authority through `GET /api/admin-booking-suppliers`, independent of supplier avatar/presentation state.

## Final identity/auth/fleet/document probe — PASS

The DEV runtime produced:

```text
✅ backend/.env.docker has no legacy visible identity
✅ frontend/.env.docker has no legacy visible identity
✅ admin/.env.docker has no legacy visible identity
✅ versioned visible runtime source has no legacy identity literal
✅ effective DEV Compose pins Mitos identity
✅ DEV SMTP is isolated from booking authority
✅ Customer browser-origin authentication returned 200
✅ Admin browser-origin authentication returned 200
✅ Admin booking supplier projection sees persisted Mitos bookings
✅ Public fleet contains Toyota Yaris 2025/26 and Toyota Raize
✅ Supplier + Yaris + Raize CDN fixture assets are reachable
✅ Customer route documents return 200 with no legacy identity literal
✅ Admin document identity is MITOS ADMIN

SOURCE + ENV + AUTH + FLEET + ADMIN BOOKING AUTHORITY + DOCUMENT SWEEP: PASS
```

`/health` returning 404 remains informational for this local gate because the real application endpoints above are responding successfully.

## Availability authority correction

The recovered search behavior originally blocked only:

```text
Paid | Reserved | Deposit
```

while checkout blocked:

```text
Pending | Deposit | Paid | PaidInFull | Reserved
```

and legacy `car.blockOnPay=false` could allow an overlapping booking to remain visible in search. Because Mitos `Pagar al recoger` persists a booking as `Pending`, customer search and checkout could contradict each other.

Customer `/api/frontend-cars/:page/:size` now routes through `frontendAvailabilityController` and uses the same active booking truth as checkout:

```text
ACTIVE = Pending | Deposit | Paid | PaidInFull | Reserved

OVERLAP =
booking.from < requested.to
AND
booking.to > requested.from

active overlap exists
→ car excluded from customer results
```

The legacy `blockOnPay` field no longer overrides real date availability in the customer search lane. Checkout remains the second/concurrency defense.

## Availability runtime receipt — PASS

The two existing Pending reservations were preserved as the regression fixture.

Runtime re-test:

```text
A — OVERLAPPING SEARCH
La Molina
31 Aug 2026 10:00 → 03 Sep 2026 10:00
Toyota Yaris 2025/26   → NOT OFFERED ✅
Toyota Raize           → NOT OFFERED ✅

B — NON-OVERLAPPING SEARCH
Period after the existing reservations
Toyota Yaris 2025/26   → AVAILABLE AGAIN ✅
Toyota Raize           → AVAILABLE AGAIN ✅
```

This proves both sides of the availability contract: active reservations prevent double-booking for overlapping dates, and vehicles are not globally disabled outside their occupied intervals.

## Source/build evidence

The availability authority source compiles. The Mitos closure workflow for correction/documentation head completed successfully and validates:

```text
backend
MITOS ADMIN
MITOS customer
Railway backend image
Vercel configs
closure scripts
```

## Closure matrix

```text
Mitos visible identity                 ✅ RUNTIME PASS
Customer authentication                ✅ RUNTIME PASS
Admin authentication                   ✅ RUNTIME PASS
Backend fleet projection               ✅ RUNTIME PASS
I5 date availability truth             ✅ RUNTIME PASS
Admin Cars                             ✅ RUNTIME PASS
Customer booking persistence           ✅ RUNTIME PASS
Customer Mis reservas/detail           ✅ RUNTIME PASS
Admin booking authority                ✅ RUNTIME PASS
Admin Bookings table render            ✅ RUNTIME PASS
I6B overlapping booking exclusion      ✅ RUNTIME PASS
Non-overlap re-availability            ✅ RUNTIME PASS
Final identity/auth/document probe     ✅ RUNTIME PASS
Closure CI                             ✅ PASS
External payment providers             OUTSIDE pay-later gate
Production email provider              OUTSIDE local gate
Production deployment                  NOT STARTED
```

## Certification statement

The local Mitos recovery/rebrand and pay-later rental lifecycle are now certified for the scope of this PR:

> **BookCars quedó como motor interno recuperado; MITOS Rent a Car es el producto visible y funcional. Rebrand y flujo local de alquiler certificados.**

This certification does not claim production deployment, external payment-provider certification or production email-provider certification. Those remain separate deployment/integration gates.
