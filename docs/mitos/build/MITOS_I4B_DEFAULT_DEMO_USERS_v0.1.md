# Mitos — I4B Default Demo Users v0.1

**Status:** SOURCE IMPLEMENTED / RUNTIME RE-TEST REQUIRED  
**Date:** 2026-08-21  
**Branch:** `feature/mitos-public-experience-v1`

## Purpose

Restore the recovered BookCars demo convenience without restoring BookCars visible identity.

The Mitos DEV seed now provisions deterministic frontend and Admin demo users in addition to the existing supplier/fleet fixture.

## Default DEV credentials

### Frontend customer

```text
URL:      https://localhost:8080/
Login:    jdoe@mitos.pe
Password: B00kC4r5
Role:     User / customer
```

### Admin

```text
URL:      https://localhost:3001/admin/
Login:    admin@mitos.pe
Password: B00kC4r5
Role:     Admin
```

The password is hashed through the backend's existing `authHelper.hashPassword()` path before persistence. It is never stored in MongoDB as plaintext.

## Seed behavior

`backend/src/setup/mitosDevSeed.ts` is idempotent and uses email as the fixture identity. Re-running the seed updates the same demo accounts and resets their demo password rather than creating duplicates.

Both accounts are seeded as:

```text
active = true
verified = true
blacklisted = false
language = es
location = Lima, Perú
```

The customer retains `payLater = true` for local rental-flow testing.

## Optional overrides

The defaults may be replaced for a DEV run with:

```text
MITOS_DEMO_PASSWORD
MITOS_DEMO_CUSTOMER_EMAIL
MITOS_DEMO_ADMIN_EMAIL
```

## Safety boundary

The Mitos seed retains its existing local-database guard. A non-local DB is refused unless `MITOS_ALLOW_SEED=true` is explicitly supplied.

These identities are DEV/demo fixtures only. They are not production credentials.

## Run

From the backend container:

```bash
npm run seed:mitos:dev
```

From the repository host when the DEV compose stack is running:

```bash
docker compose -f docker-compose.dev.yml exec bc-dev-backend npm run seed:mitos:dev
```

## Runtime acceptance

After reseeding:

```text
Frontend sign-in
jdoe@mitos.pe + B00kC4r5
→ authenticated Mitos customer shell
→ My Bookings available

Admin sign-in
admin@mitos.pe + B00kC4r5
→ MITOS ADMIN shell
→ authenticated management sidebar available
```

No runtime PASS is claimed until those logins are exercised against the rebuilt local stack.
