# Mitos — I4C Default Demo Users v0.1

**Status:** CUSTOMER BACKEND AUTH PROVEN / BROWSER LOGIN RE-TEST REQUIRED  
**Date:** 2026-08-26  
**Branch:** `feature/mitos-public-experience-v1`

## Purpose

Restore the recovered BookCars demo convenience without restoring BookCars visible identity.

The Mitos DEV seed provisions deterministic frontend and Admin demo users in addition to the existing supplier/fleet fixture.

## Default DEV credentials

### Frontend customer

```text
URL:      http://localhost:8080/
Login:    jdoe@mitos.pe
Password: B00kC4r5
Role:     User / customer
```

### Admin

```text
URL:      http://localhost:3001/admin/
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

## Runtime receipt — seed

Observed 2026-08-26:

```text
Database connected
MITOS DEV seed ready: demo customer jdoe@mitos.pe, demo admin admin@mitos.pe,
supplier, Peru, La Molina, Toyota Yaris 2025/26 and Toyota Raize
```

This proves seed execution and database persistence path reached completion.

## Runtime receipt — initial browser failure

The first customer browser login attempt displayed:

```text
Incorrect email or password.
```

Source inspection identified a DEV transport contract mismatch:

```text
frontend/admin Vite dev servers → forced HTTPS
VITE_BC_API_HOST               → http://localhost:4002
backend expected DEV origins    → https://localhost:8080 / https://localhost:3001
```

`SignIn.tsx` maps both non-200 authentication responses and caught request/network failures to the same credential error, so the browser message alone was not proof of a bad password.

## DEV transport correction

The correction keeps production HTTPS untouched and changes only the DEV server contract:

```text
HTTP API  → HTTP Vite UI + ws HMR
HTTPS API → HTTPS Vite UI + wss HMR
```

`docker-compose.dev.yml` now defaults backend origins to:

```text
BC_FRONTEND_HOST=http://localhost:8080/
BC_ADMIN_HOST=http://localhost:3001/
```

The unused DEV `8443:443` frontend mapping was removed.

## Runtime receipt — corrected stack rebuild

Observed 2026-08-26:

```text
bookcars-bc-dev-frontend       Built
bookcars-bc-dev-backend        Built
bookcars-bc-dev-admin          Built
bookcars-mongo-1               Started
bookcars-bc-dev-backend-1      Started
bookcars-bc-dev-admin-1        Started
bookcars-bc-dev-frontend-1     Started
```

The DEV seed then completed again successfully against the rebuilt stack.

## Runtime receipt — customer backend authentication

Observed 2026-08-26 using the real backend sign-in endpoint:

```bash
curl -i \
  -X POST http://localhost:4002/api/sign-in/frontend \
  -H "Content-Type: application/json" \
  --data '{"email":"jdoe@mitos.pe","password":"B00kC4r5","stayConnected":false}'
```

Result:

```text
HTTP/1.1 200 OK
Content-Type: application/json

{"_id":"6a8f4cfa08c3c580fbdb673f","email":"jdoe@mitos.pe","fullName":"John Doe","language":"es","enableEmailNotifications":true,"blacklisted":false}
```

This is sufficient evidence that:

```text
customer fixture exists       ✅
stored password hash matches  ✅
frontend User role matches    ✅
backend sign-in controller    ✅
JWT issuance path reached     ✅
```

Because this curl request carries no browser `Origin` header, the response uses the fallback `x-access-token` cookie name. Browser verification is still required to prove the frontend-specific cookie/session path.

## Runtime receipt — HTTPS URL after HTTP correction

Opening the corrected DEV frontend as:

```text
https://localhost:8080/
```

returns:

```text
ERR_SSL_PROTOCOL_ERROR
```

This is expected after the DEV transport correction because port 8080 now serves plain HTTP. The correct browser URL is:

```text
http://localhost:8080/
```

The Admin DEV URL is likewise:

```text
http://localhost:3001/admin/
```

## Runtime acceptance remaining

Customer browser:

```text
http://localhost:8080/sign-in
jdoe@mitos.pe + B00kC4r5
→ authenticated Mitos customer shell
→ My Bookings available
→ frontend auth cookie/session survives protected navigation
```

Admin browser:

```text
http://localhost:3001/admin/
admin@mitos.pe + B00kC4r5
→ MITOS ADMIN shell
→ authenticated management sidebar available
```

Customer backend authentication is proven. Browser-session PASS and Admin authentication are still pending explicit runtime receipts.
