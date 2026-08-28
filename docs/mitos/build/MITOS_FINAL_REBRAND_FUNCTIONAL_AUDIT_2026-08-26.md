# MITOS — Final Rebrand + Functional Audit

**Updated:** 2026-08-28  
**Branch:** `feature/mitos-public-experience-v1`  
**Status:** LOCAL PRODUCT CLOSURE PASS / PUBLIC TEST RUNTIME ACTIVE / NOT PRODUCTION-FINAL

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

## Local closure matrix

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
```

## Local certification statement

The local Mitos recovery/rebrand and pay-later rental lifecycle are certified for the scope of this PR:

> **BookCars quedó como motor interno recuperado; MITOS Rent a Car es el producto visible y funcional. Rebrand y flujo local de alquiler certificados.**

This local certification does not by itself claim external payment-provider certification, durable production storage or production email-provider certification.

---

# Post-local public runtime addendum — 2026-08-28

After the local closure above, Mitos advanced into a real public Railway test deployment. This addendum records that later state without rewriting the meaning of the local certification.

## Public topology now running

```text
Railway HTTPS public origin
  |
  v
nginx :4002
  |-- /          -> MITOS Customer SPA
  |-- /admin/    -> MITOS Admin SPA
  |-- /api/      -> Node/Express :4003
  |-- /socket.io -> Node/Express :4003
  `-- /cdn/      -> backend filesystem CDN

Node/Express
  |
  v
MongoDB Atlas
logical database: mitos
```

The earlier Vercel split remains a possible future deployment lane, but it is not the current free-tier runtime.

## Database deployment hardening

Mitos initially attempted to use an existing Railway Mongo service, but MongoDB 8 index creation failed because the available disk on that service was below the required index-build threshold.

The old Gallo Mongo service was not modified to accommodate Mitos.

Mitos `BC_DB_URI` was moved service-scoped to MongoDB Atlas and the runtime then proved:

```text
Database connected
Indexes created
Database initialized successfully
HTTP server is running on port 4003
```

Atlas is now the Mitos database authority for this public test lane.

## Signup frontend correction

A public signup bug caused new addresses to behave as if already registered because explicit field `onChange` handlers overwrote React Hook Form registration handlers.

Fixed in:

```text
ec5e3d9d159984165d82a6935fe7401d32c25328
fix(mitos): preserve signup field registration handlers
```

## Railway SMTP incident

Direct Nodemailer/SMTP from Railway produced a connection timeout and browser/nginx 504 during signup.

The important architectural conclusion is:

```text
Railway selected lane -> HTTPS transactional provider
future VPS            -> SMTP/Nodemailer canonical/default
```

SMTP was not deleted or replaced as an architectural standard.

`mailHelper.sendMail()` was made provider-selectable while keeping the same call-site contract.

Available transports:

```text
smtp        -> Nodemailer / canonical VPS default
resend      -> HTTPS adapter, retained but not current
mailersend  -> HTTPS adapter, current Railway lane
```

### Resend attempt

Resend proved Railway HTTPS-provider connectivity but required a verified sender domain.

Observed errors progressed from an unverified `thradex.com` sender to the corrected but unverified `mitos.pe` sender. Because `mitos.pe` was not owned and there was an explicit decision not to buy the domain only for this integration, Resend was retained in code but not used as the active Railway provider.

### MailerSend implementation

MailerSend HTTPS support was added in:

```text
58a5a7619b939d25caa2301b6321379ac315a6aa
feat(mitos): add MailerSend HTTPS email transport
```

The adapter supports normal recipients plus attachment conversion so booking/contract email paths are not silently broken by the Railway workaround.

After MailerSend activation, observed HTTP flow became:

```text
POST /api/validate-email   -> 200
POST /api/sign-up          -> 200 (~0.6 s)
POST /api/sign-in/frontend -> 200
```

This proves provider acceptance at the signup boundary and closes the prior SMTP-timeout failure mode.

It does **not** yet certify arbitrary-recipient production delivery because the MailerSend account was still observed in Sandbox mode during this evidence window.

SMTP/Nodemailer remains the future VPS path by switching:

```env
BC_EMAIL_PROVIDER=smtp
```

No controller/booking/signup call site should require rewriting.

## Shared-origin Customer/Admin auth correction

After successful signup/signin, a protected user read returned:

```text
GET /api/user/<id> -> 403
{"message":"No token provided!"}
```

The endpoint remained protected. The problem was not solved by weakening authorization.

Root cause: Customer `/` and Admin `/admin/` now share one Railway origin, while the inherited auth helper historically inferred surface identity from origin. Browser `Origin` has no path, so it cannot distinguish `/admin/` from `/`.

Fixed in:

```text
490dbf9e16181c41c454eeebc6627c0d65fe3a80
fix(mitos): disambiguate shared-origin auth cookies
```

The corrected boundary uses Referer/path to distinguish the Admin surface when both SPAs share an origin.

CI run:

```text
mitos-closure #33215687706 -> SUCCESS
```

Railway deployment:

```text
1ccd68bf-b9fd-4e70-91b1-03d59e3dfaf3 -> SUCCESS
```

A fresh browser protected-user read after this fix is still required as the final runtime receipt for that exact cookie correction.

## Current public-test matrix

```text
Public Railway full-stack service              ✅ ACTIVE
Customer SPA                                   ✅ ACTIVE
Admin SPA                                      ✅ ACTIVE
Node backend                                   ✅ ACTIVE
MongoDB Atlas authority                        ✅ ACTIVE
Remote test bootstrap                          ✅ ACTIVE / TEST ONLY
Signup RHF field fix                           ✅ DEPLOYED
Direct SMTP on Railway                         ❌ NOT VIABLE ON CURRENT LANE
SMTP/Nodemailer future VPS path                ✅ PRESERVED
Resend HTTPS adapter                           ✅ AVAILABLE / NOT ACTIVE
MailerSend HTTPS adapter                       ✅ ACTIVE
MailerSend signup provider acceptance          ✅ RUNTIME PASS
MailerSend arbitrary-recipient production      ❌ NOT CERTIFIED
Shared-origin auth source fix                  ✅ DEPLOYED
Shared-origin auth final browser receipt       🟡 PENDING
Durable CDN/uploads                            ❌ OPEN
Google OAuth production certification          ❌ OPEN
External payment-provider certification        ❌ OPEN
Production-final certification                 ❌ OPEN
```

Canonical detailed records:

```text
docs/mitos/deploy/MITOS_RAILWAY_RUNTIME_RECOVERY_AND_EMAIL_TRANSPORT_2026-08-28.md
docs/mitos/evidence/MITOS_RAILWAY_EMAIL_AND_AUTH_RUNTIME_EVIDENCE_2026-08-28.md
```
