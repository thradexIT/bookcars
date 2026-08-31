# Mitos — I4D Admin Fleet Visibility v0.1

**Status:** RUNTIME PASS  
**Date:** 2026-08-26  
**Branch:** `feature/mitos-public-experience-v1`

## Runtime symptom

The Mitos customer search returned the two seeded cars:

```text
Toyota Yaris 2025/26
Toyota Raize
```

while Admin → Cars initially rendered:

```text
No cars.
```

This was not evidence of two databases or duplicated inventory. Both surfaces use the same backend/Mongo runtime.

## Root cause

The Mitos DEV seed creates a real Supplier user and attaches both cars to it. The original fixture did not include an avatar/logo.

Admin `Cars.tsx` was loading supplier IDs through `getAllSuppliers()`. The backend implementation of that endpoint filters suppliers with:

```text
type = Supplier
avatar != null
```

Therefore the real `MITOS Rent a Car` supplier was excluded from the Admin supplier list solely because it had no avatar. `CarList` then received an empty supplier list and intentionally returned zero rows without requesting the car inventory.

The customer availability flow does not impose this avatar requirement, so the same cars remained visible on the public rental surface.

## Correct authority

An Admin fleet surface must derive fleet visibility from operational car/supplier records, not from presentation completeness.

The backend already provides `getAdminSuppliers(payload)`, which derives suppliers from cars matching the current fleet filters and does not require an avatar.

## Correction

`admin/src/pages/Cars.tsx` now uses `SupplierService.getAdminSuppliers(payload)` for Admin car supplier discovery instead of `getAllSuppliers()`.

No changes were made to:

```text
Car documents
Supplier identity
availability logic
pricing
checkout
booking state
public search
Mongo database
```

No fake production identity was introduced.

## Runtime receipt

The operator re-tested the corrected Admin Cars surface on 2026-08-26 and explicitly confirmed the issue as resolved: the Admin now sees the two seeded Mitos fleet records.

```text
Admin → Cars
→ Toyota Yaris 2025/26 visible
→ Toyota Raize visible
→ 2 cars
```

This closes the fleet-visibility mismatch as a runtime PASS.

## Follow-up visual fixture hardening

The Mitos DEV seed now also writes deterministic supplier/car SVG fixture assets to the real CDN volume and assigns them to the seeded records. They are explicitly marked as DEV fixtures and are not represented as production vehicle photography.
