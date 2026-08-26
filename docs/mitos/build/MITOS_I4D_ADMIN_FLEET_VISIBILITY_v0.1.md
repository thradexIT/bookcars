# Mitos — I4D Admin Fleet Visibility v0.1

**Status:** SOURCE FIX IMPLEMENTED / RUNTIME RE-TEST REQUIRED  
**Date:** 2026-08-26  
**Branch:** `feature/mitos-public-experience-v1`

## Runtime symptom

The Mitos customer search returned the two seeded cars:

```text
Toyota Yaris 2025/26
Toyota Raize
```

while Admin → Cars rendered:

```text
No cars.
```

This was not evidence of two databases or duplicated inventory. Both surfaces use the same backend/Mongo runtime.

## Root cause

The Mitos DEV seed creates a real Supplier user and attaches both cars to it, but the fixture does not invent an avatar/logo.

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

No fake avatar or placeholder supplier was introduced.

## Runtime acceptance

After pulling the branch and refreshing/restarting only the Admin Vite service if needed:

```text
Admin → Cars
→ MITOS Rent a Car fleet is discoverable
→ Toyota Yaris 2025/26 visible
→ Toyota Raize visible
→ car count = 2
```

This gate remains runtime-unproven until that Admin view is observed after the source fix.
