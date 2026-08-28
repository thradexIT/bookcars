# MITOS — Final Rebrand + Functional Audit

**Updated:** 2026-08-28  
**Branch:** `feature/mitos-public-experience-v1`  
**Status:** CUSTOMER/ADMIN BOOKING FLOW PASS / AVAILABILITY OVERLAP RE-TEST REQUIRED

## Executive verdict

Mitos is a materially functional rental product built on the recovered BookCars transactional core. Visible identity, authentication, fleet, customer booking persistence, customer booking history, Admin booking visibility and the executable closure probe have runtime receipts.

A release-blocking availability inconsistency was discovered during the final runtime review: a car with an active overlapping booking could still be offered by customer search even though checkout would reject that same conflict. Therefore local product closure is reopened until date-overlap exclusion is runtime-proven.

Internal `bookcars` implementation identifiers remain acceptable only for infrastructure such as repository/package names, Mongo/CDN paths, containers and compatibility identifiers.

## Runtime evidence already established

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

The prior `Sin filas` defect is closed. Admin booking suppliers now derive from persisted Booking authority through `GET /api/admin-booking-suppliers`, independent of supplier avatar/presentation state.

## Final identity/auth/fleet/document probe — PASS

The current DEV runtime produced:

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

`/health` returning 404 is informational for this local gate because real application endpoints above are responding successfully.

## Release blocker discovered — customer availability truth

The recovered `getFrontendCars` query did not use the same conflict semantics as checkout.

### Old search behavior

Blocking statuses were only:

```text
Paid
Reserved
Deposit
```

and an overlapping booking could still be ignored when legacy `car.blockOnPay=false`.

Mitos `Pagar al recoger` persists a booking as `Pending`, so a real reservation could exist while the same car remained advertised for the same dates.

### Checkout authority

Checkout already rejects overlapping active bookings using:

```text
Pending
Deposit
Paid
PaidInFull
Reserved
```

with the half-open interval rule:

```text
booking.from < requested.to
AND
booking.to > requested.from
```

Therefore search and checkout contradicted each other.

## Availability correction implemented

Customer `/api/frontend-cars/:page/:size` now routes through `frontendAvailabilityController`.

The corrected search preserves the recovered BookCars search/filter/pricing/pagination behavior while enforcing the same active-booking definition and interval semantics as checkout:

```text
ACTIVE = Pending | Deposit | Paid | PaidInFull | Reserved

OVERLAP =
booking.from < requested.to
AND
booking.to > requested.from

active overlap exists
→ car excluded from customer results
```

The legacy `blockOnPay` field no longer overrides real date availability in the customer search lane. It may remain as an internal compatibility field, but it cannot make an unbookable car look bookable.

Checkout remains the second line of defense against races/concurrent attempts.

## Source/build evidence

The new availability controller is routed from the existing frontend-cars API. Backend compilation passed on the correction head; the complete Mitos closure workflow continues to validate backend, Admin, customer, Railway image, Vercel configs and closure scripts.

## Closure matrix

```text
Mitos visible identity                 ✅ RUNTIME PASS
Customer authentication                ✅ RUNTIME PASS
Admin authentication                   ✅ RUNTIME PASS
Backend fleet projection               ✅ RUNTIME PASS
Admin Cars                             ✅ RUNTIME PASS
Customer booking persistence           ✅ RUNTIME PASS
Customer Mis reservas/detail           ✅ RUNTIME PASS
Admin booking authority                ✅ RUNTIME PASS
Admin Bookings table render            ✅ RUNTIME PASS
Final identity/auth/document probe     ✅ RUNTIME PASS
I5 date availability truth             🟡 SOURCE FIXED / RUNTIME RE-TEST
I6B overlapping booking exclusion      🔴 RUNTIME RE-TEST REQUIRED
External payment providers             OUTSIDE pay-later gate
Production email provider              OUTSIDE local gate
Production deployment                  BLOCKED BY I6B
```

## Exact remaining local acceptance

Preserve the existing Pending bookings; they are now the regression fixture.

After pulling the availability correction and restarting the backend:

```text
A — OVERLAPPING SEARCH
La Molina
31 Aug 2026 10:00 → 03 Sep 2026 10:00
Expected: booked Yaris and booked Raize are NOT offered.
With only those two seeded cars, expected result is no available car.

B — NON-OVERLAPPING SEARCH
Use a period after the current bookings end.
Expected: cars without another active conflict are offered again.
```

Then re-run the closure probe. No additional overlapping booking is required.

Only after A and B pass may I5/I6B be closed, PR #3 move out of Draft, and the local product be certified for deployment preparation.
