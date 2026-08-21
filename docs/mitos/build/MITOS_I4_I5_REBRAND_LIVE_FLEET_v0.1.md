# Mitos — I4/I5 Rental Rebrand + Live Fleet Build v0.1

**Status:** IMPLEMENTED / RUNTIME EVIDENCE PENDING  
**Date:** 2026-08-21  
**Branch:** `feature/mitos-public-experience-v1`

## Scope

This slice closes two product seams without changing rental transaction authority:

1. keep the Mitos identity across the complete customer-facing frontend instead of falling back to the legacy BookCars header/footer;
2. remove the parallel hard-coded fleet from `MitosHome` and source the landing fleet from the Rent A Car backend.

The Agent, CRM, Admin and LaborSync remain outside this slice.

## Authority preserved

```text
Mitos landing/public shell  -> presentation
GET /api/public-fleet/:size -> presentation-safe active-fleet projection
POST /api/frontend-cars/... -> date/location availability authority
checkout/payment/booking    -> existing Rent A Car authority
```

The new public-fleet endpoint intentionally does not accept dates or locations and does not expose prices, license plates or supplier internals. It cannot be interpreted as proof that a vehicle is available for a requested rental period. Booking-state fields such as `fullyBooked` are therefore not used to decide whether an otherwise active fleet vehicle belongs in the landing catalog.

## Implemented

### I4 — Rent A Car -> Mitos customer rebrand

- `MitosHeader` no longer falls back to the legacy `Header` outside `/` and `/search`.
- customer pages using the legacy `Footer` now resolve to `MitosFooter`.
- `MitosFooter` contains Mitos contact/social identity and legal/account navigation that works outside the landing.
- public document metadata is Mitos-branded.
- the frontend `WEBSITE_NAME` authority is now `MITOS RENT A CAR`, preventing legacy BookCars naming from resurfacing in customer-facing strings/payment descriptions.

### I5 — backend-driven Mitos landing fleet

- added `GET /api/public-fleet/:size`.
- endpoint returns active, non-coming-soon cars belonging to non-blacklisted suppliers; per-trip booking state is left to the availability flow.
- response is projected to presentation-safe fields only: `_id`, `name`, `image`, `type`, `gearbox`, `seats`, `doors`, `aircon`, `range`, `multimedia`.
- `CarService.getPublicFleet()` consumes the endpoint.
- `MitosHome` loads the fleet from backend and renders real CDN vehicle images when present.
- loading, empty and error states are explicit.
- no fake fallback vehicles are shown if the backend is unavailable or empty.
- removed hard-coded Yaris/Raize/Sedan fleet cards from the landing.
- removed static vehicle-price campaign claims from the landing.
- removed Agent references from the landing; Agent remains frozen until the final layer.

## Transactional protection

No change was made to:

```text
SearchForm behavior
/search receiving contract
POST /api/frontend-cars availability calculation
rental price calculation
booking state transitions
checkout business rules
payment gateway logic
Admin
LaborSync
CRM
Agent runtime
```

## Runtime / release evidence

At this commit, implementation exists in the branch but there is no GitHub Actions run attached to the new head. The repository contains a guarded local `seed:mitos:dev` path that can provide a development supplier, location and vehicles for the final smoke test, but this document does not claim that the new I4/I5 head has passed that runtime yet.

Required final proof:

```text
Mitos landing
-> GET /api/public-fleet/:size returns seeded/real fleet
-> landing renders backend vehicles
-> choose location + dates
-> /search returns date/location availability
-> select car
-> checkout
-> booking created
```

Keep PR Draft until build/runtime/regression evidence is attached.
