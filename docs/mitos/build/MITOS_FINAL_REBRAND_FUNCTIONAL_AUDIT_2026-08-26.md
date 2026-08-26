# MITOS — Final Rebrand + Functional Audit

**Date:** 2026-08-26  
**Branch:** `feature/mitos-public-experience-v1`  
**Status:** SOURCE CLOSURE IMPLEMENTED / FINAL RUNTIME TRANSACTION PENDING

## Executive verdict

Mitos is now a materially functional rental product built on the recovered BookCars transactional core, with the old implementation name retained only where it is internal infrastructure.

The source-level final closure has been hardened substantially. The product must still **not** be called `100% rebranded certified` or `full E2E PASS` until the current local runtime passes the closure probe and one complete browser booking reaches confirmation, `Mis reservas`, and booking detail.

The remaining gap is runtime certification, not missing architecture or a parallel fake rental system.

## Runtime evidence already established

### Customer

Observed in the current DEV runtime:

- Mitos public shell loads;
- Mitos DEV seed completes against Mongo;
- `jdoe@mitos.pe / B00kC4r5` authenticates at the real backend endpoint with HTTP 200;
- authenticated Mitos navigation exposes `Mis reservas` and `Mi cuenta`;
- La Molina search returns the two real seeded backend records;
- Toyota Yaris 2025/26 and Toyota Raize are returned with DEV availability/pricing from backend state.

### Admin

Observed in the current DEV runtime:

- `MITOS ADMIN` document/application identity loads;
- Admin routing is reachable under `/admin`;
- authenticated Admin operational surfaces are reachable;
- the operator re-tested the corrected `Admin → Cars` surface and confirmed both seeded cars are visible;
- I4D Admin Fleet Visibility is therefore a runtime PASS.

## Source closure completed in this pass

### Visible identity fallbacks

Legacy visible defaults were removed/replaced:

```text
frontend Vite fallback        → MITOS RENT A CAR
Admin Vite fallback           → MITOS RENT A CAR
backend WEBSITE_NAME fallback → MITOS RENT A CAR
backend example website       → MITOS RENT A CAR
backend example SMTP sender   → no-reply@mitos.pe
backend example Admin email   → admin@mitos.pe
```

Internal lowercase `bookcars` implementation identifiers remain allowed where they are not product identity, including repository/package names, Mongo/CDN paths, container/service names, compatibility cookies and internal secrets/defaults.

### Peru / Spanish defaults

Current DEV/source defaults now establish:

```text
customer language → es
Admin language    → es
backend language  → es
timezone          → America/Lima
IP country        → PE
map center        → Lima
```

`CheckoutStatus` now uses the Spanish `date-fns` locale when the customer language is `es`, removing the prior English-date fallback on the customer confirmation surface.

The actual email-provider path is not part of the local I6 authority gate and remains provider-dependent; production email delivery/localization must be certified separately if advertised as a release feature.

### DEV visual fixtures

The guarded Mitos DEV seed now writes deterministic assets into the real CDN volume and assigns them to the seeded records:

```text
mitos-dev-supplier.svg
mitos-dev-toyota-yaris.svg
mitos-dev-toyota-raize.svg
```

They are explicitly labelled DEV fixtures / not production photography. This fixes broken/missing local images without inventing evidence of real vehicle photos.

### DEV email side-effect boundary

`BC_EMAIL_ENABLED=false` is pinned in `docker-compose.dev.yml`.

When disabled, `mailHelper.sendMail()` returns a deterministic no-op result rather than contacting SMTP. Production keeps email enabled by default.

This is important because a local pay-later booking must be judged by rental state creation and retrieval, not by placeholder SendGrid credentials. Email is a side effect, not booking authority.

## Final I6 path recovered from source

The seeded supplier has `payLater=true`, so the current frontend exposes the Spanish option:

```text
Pagar al recoger
```

Selecting it bypasses Stripe / Mercado Pago / PayPal and submits the existing checkout contract directly through:

```text
POST /api/checkout
```

The action button is:

```text
Reservar
```

For this lane, the frontend initializes the booking as `Pending`. The backend persists the booking and returns its `bookingId`. The success surface then renders `CheckoutStatus` with the actual booking details.

`Mis reservas` requests bookings using the authenticated user's `_id` and initializes its status filter with all booking statuses, so the new `Pending` pay-later booking is expected to be visible. Booking detail is loaded from the persisted booking record.

This gives the final transaction gate without requiring an external payment-provider proof:

```text
Mitos landing
→ La Molina + future dates
→ real availability
→ select Yaris or Raize
→ checkout
→ Pagar al recoger
→ Reservar
→ booking persisted as Pending
→ Mitos confirmation
→ Mis reservas
→ same booking visible
→ booking detail
```

## Executable closure probe

`__scripts/mitos-final-closure.sh` now provides one reproducible local gate covering:

1. actual ignored `.env.docker` identity residues when those files exist;
2. customer/operator-visible versioned source literals;
3. effective Docker Compose Mitos identity overrides;
4. DEV SMTP isolation;
5. customer authentication using browser `Origin` semantics;
6. Admin authentication using browser `Origin` semantics;
7. backend-driven public fleet with Yaris + Raize;
8. seeded supplier/car CDN fixture assets;
9. current customer route document reachability and served-document identity;
10. `MITOS ADMIN` served-document identity.

Expected terminal result:

```text
SOURCE + ENV + AUTH + FLEET + DOCUMENT SWEEP: PASS
```

The script deliberately does not claim browser-rendered E2E proof. React route content and the stateful checkout/booking journey remain a browser/runtime receipt.

## Closure matrix

```text
Mitos identity architecture          ✅
Customer Mitos shell                 ✅ materially proven
Customer backend authentication      ✅ runtime proven
Customer browser auth/navigation     ✅ materially observed
Backend fleet/search                 ✅ runtime observed
Admin Mitos shell                    ✅ materially observed
Admin Cars                           ✅ RUNTIME PASS
Visible identity fallback cleanup    ✅ source implemented
Peru/Spanish default hardening       ✅ source implemented / runtime re-test
DEV fixture images                   ✅ source implemented / reseed+runtime probe
DEV SMTP isolation                   ✅ source implemented / service recreate required
Local ignored env audit              ⏳ executable probe pending
Final route/document identity sweep  ⏳ executable probe pending
Full pay-later booking E2E           ⏳ final browser transaction pending
External payment providers           OUTSIDE I6 pay-later gate / separately unproven
Production email provider            OUTSIDE I6 gate / separately unproven
Release-ready                        ❌ until final runtime gate
100% external rebrand certified      ❌ until final runtime gate
```

## Exact final runtime acceptance

Recreate the DEV services so the new environment overrides are applied, reseed so the CDN fixture assets are written, then run the closure probe.

After the probe passes, perform exactly one customer transaction on the same runtime:

```text
1. sign in: jdoe@mitos.pe / B00kC4r5
2. search La Molina with future dates
3. choose Toyota Yaris 2025/26 or Toyota Raize
4. proceed to checkout
5. select "Pagar al recoger"
6. press "Reservar"
7. require Mitos booking-success/confirmation details
8. open "Mis reservas"
9. require the new Pending booking
10. open its detail
11. require same vehicle + dates + location + price
12. require zero visible BookCars/bookcars.ma and Spanish customer copy through the journey
```

Only after both receipts exist may I4/I5/I6 all be marked PASS, PR #3 be moved out of Draft, and the following statement be certified:

> **BookCars quedó como motor interno recuperado; MITOS Rent a Car es el producto visible y funcional. Rebrand 100% certificado.**
