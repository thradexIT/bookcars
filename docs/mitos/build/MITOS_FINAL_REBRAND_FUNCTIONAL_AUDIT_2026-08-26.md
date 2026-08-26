# MITOS — Final Rebrand + Functional Audit

**Date:** 2026-08-26  
**Branch:** `feature/mitos-public-experience-v1`  
**Status:** OPERATIONAL CANDIDATE / NOT YET 100% CERTIFIED

## Executive verdict

Mitos is now a materially functional rental product candidate built on the recovered BookCars transactional core, with Mitos customer and Admin identity implemented across the primary surfaces.

It must **not** yet be described as `100% rebranded`, `full E2E proven`, or `release-ready`.

The remaining gap is no longer a missing architecture. It is final hardening + runtime certification.

## What is already proven or materially observed

### Customer runtime

Observed in the current DEV runtime:

- Mitos public shell loads.
- customer demo seed completes against Mongo.
- `jdoe@mitos.pe / B00kC4r5` authenticates at the real backend endpoint with HTTP 200.
- customer browser reaches authenticated Mitos navigation (`Mis reservas`, `Mi cuenta`).
- search at La Molina returns the two seeded cars.
- Toyota Yaris 2025/26 and Toyota Raize are returned with real DEV pricing/availability from backend state.

### Admin runtime

Observed in the current DEV runtime:

- MITOS ADMIN document identity loads.
- Admin routing is reachable under `/admin`.
- authenticated Admin operational surfaces are reachable.
- an Admin Cars visibility defect was isolated to supplier discovery, not to duplicated/missing Mongo data.
- the source fix now restores car-derived supplier discovery through `getAdminSuppliers(payload)`.

### Source rebrand

Implemented:

- global Mitos customer header/footer authority;
- Mitos public home;
- Mitos customer auth/navigation parity;
- Mitos Admin visible identity;
- Mitos metadata in customer/Admin HTML;
- backend-driven landing fleet;
- removal of hard-coded public fleet fallbacks;
- default DEV demo identities;
- HTTP-coherent DEV transport;
- Admin `/admin` basename tolerance;
- Admin fleet visibility fix.

## What does NOT count as a branding defect

The following may remain `bookcars` internally unless they leak into a customer/operator-visible surface:

- repository name;
- package names;
- internal TypeScript aliases/types;
- Mongo database/collection conventions;
- container/image/service names;
- internal CDN directory names;
- compatibility cookie or implementation identifiers.

Rebranding is an external product-identity concern, not a forced internal rename migration.

## Remaining blockers to 100% certification

### R1 — Backend identity fallbacks still contain BookCars

Current source still includes legacy visible-identity fallbacks/examples such as:

- backend `WEBSITE_NAME` fallback = `BookCars`;
- frontend/admin Vite HTML fallback = `BookCars`;
- backend example `BC_WEBSITE_NAME=BookCars`;
- backend example `BC_SMTP_FROM=no-reply@bookcars.ma`;
- backend example `BC_ADMIN_EMAIL=admin@bookcars.ma`.

These are not all visible in the current running page, but they can reintroduce old identity in a new environment or email path.

**Gate:** remove/replace customer-visible legacy defaults while leaving internal `bookcars` implementation identifiers intact.

### R2 — Actual local untracked env must be audited

`backend/.env.docker` is not present in repository source and therefore cannot be certified from GitHub.

**Gate:** local runtime env must contain no customer-visible `BookCars` / `bookcars.ma` identity values.

### R3 — Admin Cars source fix needs runtime receipt

Latest source correction expects:

```text
Admin → Cars
→ Toyota Yaris 2025/26
→ Toyota Raize
→ 2 cars
```

**Gate:** observe this after pull/reload.

### R4 — Full customer route brand sweep is incomplete

Need fresh current-build evidence for:

```text
/
/search
/sign-in
/sign-up
/checkout
/checkout-session/:id
/bookings
/booking
/settings
/notifications
legal/support pages
```

**Gate:** no visible `BookCars` on any of these surfaces.

### R5 — Full rental transaction E2E remains unproven

Required evidence:

```text
Mitos landing
→ backend fleet
→ select location + dates
→ real availability
→ select car
→ checkout
→ booking created
→ confirmation
→ My Bookings
→ booking detail
```

Search availability alone is not proof of checkout/booking continuity.

### R6 — Seed visual assets are incomplete

The DEV supplier fixture does not invent a supplier avatar/logo and the seeded cars do not currently establish real vehicle images.

This does not invalidate inventory truth, but it prevents calling the seeded visual experience fully polished.

### R7 — Localization polish

Current observed Spanish shell/search output still contains some English rental-card copy.

This is not a brand-authority failure, but it is a product-polish defect for an ES-selected session.

### R8 — External/provider paths are not release-certified

Google/social sign-in and configured payment-provider behavior require real environment/provider evidence if they are to be advertised as working release features.

### R9 — CI/release receipt absent

The current PR head has no attached commit status/workflow receipt proving this complete branch.

Runtime evidence remains the authority for this gate.

## Final classification

```text
Mitos identity architecture       ✅
Customer Mitos shell              ✅ materially proven
Customer login                    ✅ backend + browser behavior observed
Backend fleet/search              ✅ runtime observed
Admin Mitos shell                 ✅ materially observed
Admin fleet fix                   🟡 source fixed / runtime re-test
Full branding sweep               🟡 incomplete
Backend identity fallback cleanup 🟡 required
Full booking E2E                  🟡 required
Provider/payment proof            🟡 required for release claims
Release-ready                     ❌ not yet
100% rebranded certified          ❌ not yet
```

## Closure rule

Do not merge/declare final Mitos recovery solely because the primary landing/search/Admin surfaces look correct.

The final declaration requires:

1. legacy visible fallback cleanup;
2. local env identity audit;
3. Admin Cars runtime PASS;
4. customer route brand sweep PASS;
5. full booking E2E PASS;
6. no visible BookCars identity in customer/operator surfaces.

At that point the recovered BookCars implementation may remain internally named BookCars while the product is certified externally as MITOS Rent a Car.
