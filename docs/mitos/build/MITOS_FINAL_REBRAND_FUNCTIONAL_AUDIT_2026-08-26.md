# MITOS — Final Rebrand + Functional Audit

**Updated:** 2026-08-28  
**Branch:** `feature/mitos-public-experience-v1`  
**Status:** CUSTOMER I6 RUNTIME PASS / ADMIN BOOKING VISIBILITY RE-TEST

## Executive verdict

Mitos is now a materially functional rental product built on the recovered BookCars transactional core. The old implementation name remains acceptable only for internal infrastructure identifiers such as repository/package names, Mongo/CDN paths, containers and compatibility identifiers.

The customer rental lifecycle is now runtime-proven end to end. The only remaining local functional receipt is Admin booking visibility after the booking-authority correction, plus a re-run of the corrected final closure probe after local visible env normalization.

## Runtime evidence established

### Customer — I6 PASS

Observed in the current DEV runtime:

```text
MITOS customer login
→ La Molina + future dates
→ Toyota Yaris 2025/26
→ Checkout
→ Pagar al recoger
→ Reservar
→ MITOS confirmation
→ Mis reservas
→ new Pending booking visible
→ booking detail
→ same car / dates / location / $105
```

The supplied confirmation receipt shows:

```text
Car      Toyota Yaris 2025/26
From     31 Aug 2026 10:00
To       03 Sep 2026 10:00
Pickup   La Molina, Lima
Dropoff  La Molina, Lima
Total    $105
```

Customer I6 rental continuity is therefore **RUNTIME PASS**. This transaction does not need to be repeated for closure unless a later source change touches rental authority.

### Admin

Observed:

- `MITOS ADMIN` loads;
- Admin authentication/routing works;
- `Admin → Cars` shows Toyota Yaris 2025/26 and Toyota Raize;
- I4D Admin Fleet Visibility is **RUNTIME PASS**.

A fresh Admin Bookings screenshot showed `Sin filas` while the same booking existed and was visible to the customer. This is a real Admin projection defect, not a missing booking.

## Admin Bookings root cause and correction

`admin/src/pages/Bookings.tsx` still depended on `getAllSuppliers()`. That supplier projection requires presentation completeness such as avatar state. When the Mitos supplier was omitted, Admin passed an empty supplier filter to `/api/bookings`, producing zero rows even though the booking existed.

The correction introduces:

```text
GET /api/admin-booking-suppliers
```

Its authority is persisted bookings:

```text
Booking.distinct('supplier')
→ Supplier users for those booking supplier ids
→ Admin filter
→ /api/bookings
```

Therefore Admin booking history no longer depends on supplier avatar/logo completeness or current active fleet presentation.

**Status:** source fixed / CI compiled / runtime re-test required.

## Branding and local env truth

The prior closure probe was too broad: it treated every `bookcars` literal as a branding defect. That was incorrect.

Allowed internal identifiers include:

```text
Mongo database/appName bookcars
/var/www/cdn/bookcars/...
bookcars certificate paths
repository/package/container names
compatibility implementation identifiers
```

Actual customer/operator-visible legacy values found in the local ignored backend env were:

```text
BC_SMTP_FROM=no-reply@bookcars.ma
BC_ADMIN_EMAIL=admin@bookcars.ma
BC_WEBSITE_NAME=BookCars
```

`__scripts/mitos-normalize-local-env.sh` safely normalizes those visible identity/localization values without modifying DB/JWT/payment/SMTP credentials.

The corrected `__scripts/mitos-final-closure.sh` gates only visible identity keys and now also validates the Admin booking-supplier projection.

Expected final result:

```text
SOURCE + ENV + AUTH + FLEET + ADMIN BOOKING AUTHORITY + DOCUMENT SWEEP: PASS
```

## Customer confirmation truth hardening

DEV intentionally runs with `BC_EMAIL_ENABLED=false` so placeholder SMTP cannot invalidate a real local booking.

The customer confirmation copy previously stated that a confirmation email had been sent even in that DEV mode. The copy is now evidence-safe: it confirms the persisted reservation and directs the customer to `Mis reservas` without asserting an email side effect that may be disabled.

Production email delivery remains a separate provider gate.

## Source/build evidence

The Mitos closure workflow compiles and validates:

```text
backend
MITOS ADMIN
MITOS customer
Railway backend image
Vercel configs
closure scripts
```

The Admin booking-authority correction passed this source/build gate on the current correction series.

## Closure matrix

```text
Mitos identity architecture          ✅
Customer Mitos shell                 ✅ RUNTIME
Customer authentication              ✅ RUNTIME
Backend fleet/search                 ✅ RUNTIME
Admin Mitos shell                    ✅ RUNTIME
Admin Cars                           ✅ RUNTIME PASS
Customer I6 full rental E2E          ✅ RUNTIME PASS
Customer confirmation                ✅ RUNTIME PASS
Customer Mis reservas                ✅ RUNTIME PASS
Customer booking detail              ✅ RUNTIME PASS
Visible BookCars in observed UI      ✅ ZERO OBSERVED
Admin Bookings                       🔁 SOURCE FIXED / RUNTIME RE-TEST
Local visible env normalization      🔁 ONE RUN REQUIRED
Corrected final closure probe        🔁 ONE RUN REQUIRED
External payment providers           OUTSIDE pay-later I6 gate
Production email provider            OUTSIDE local I6 gate
Production deployment                NOT STARTED
```

## Exact remaining local acceptance

Pull the current branch, normalize only visible local identity fields and recreate the app services so the backend route and env changes are active:

```bash
git pull
bash __scripts/mitos-normalize-local-env.sh

docker compose -f docker-compose.dev.yml up -d --force-recreate \
  bc-dev-backend bc-dev-admin bc-dev-frontend

bash __scripts/mitos-final-closure.sh
```

Then refresh:

```text
http://localhost:3001/admin
```

The existing customer-created booking must appear in Admin Reservas with the same supplier/car/dates/price/status. No new customer booking is required.

When the Admin row is observed and the corrected probe passes, local Mitos closure is complete and PR #3 may be moved out of Draft.

At that point the external product statement is certified:

> **BookCars quedó como motor interno recuperado; MITOS Rent a Car es el producto visible y funcional. Rebrand 100% certificado.**
