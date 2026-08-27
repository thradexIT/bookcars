# MITOS Rent a Car — Deployment Preflight v0.1

**Branch:** `feature/mitos-public-experience-v1`  
**Status:** PREPARED / DEPLOYMENT GATED BY I6 + DURABLE STORAGE

## Objective

Prepare the recovered and rebranded Mitos rental product for a clean production split without changing rental authority:

```text
Customer Vite SPA  -> Vercel
MITOS ADMIN SPA    -> Vercel
Node/Express API   -> Railway
MongoDB            -> dedicated durable Mongo service/database
CDN/uploads        -> durable storage (Railway volume or object storage)
```

No production deployment is authorized by this document. The live deploy remains gated by the final local I6 transaction receipt.

## Connected infrastructure observed

- Vercel connection is available under the user's Hobby team.
- Railway connection is available under the user's project workspace.
- No existing Vercel project is named for Mitos.
- Existing Railway projects are unrelated and MUST NOT be reused implicitly for Mitos.

Mitos must receive isolated deployment resources.

## Repository deployment hardening completed

### Customer Vercel SPA

`frontend/vercel.json`

Provides SPA catch-all routing so direct navigation/refresh on routes such as `/search`, `/bookings`, `/booking`, `/settings`, etc. resolves through `index.html` instead of returning a platform 404.

### Admin Vercel SPA

`admin/vercel.json`

Preserves the recovered `/admin` basename contract:

```text
/        -> /admin/
/admin   -> SPA index
/admin/* -> SPA index
```

### Railway backend image

`backend/Dockerfile.railway`

Properties:

- does not copy `.env.docker` into the image;
- installs the internal repository packages required by the recovered core;
- builds TypeScript during image build;
- starts the compiled API directly;
- does NOT run the historical setup/bootstrap script on every restart;
- expects runtime variables from Railway.

This avoids embedding local secrets/configuration in an immutable image and avoids creating a default admin during every production restart.

## Backend authority constraints

The backend remains the authority for:

- authentication;
- availability;
- rental price calculation;
- checkout;
- booking lifecycle;
- Admin operational behavior;
- Socket.IO notifications;
- CDN file serving until a storage adapter is introduced.

Do not move these behaviors into Vercel Functions during this deployment slice.

## Required production environment groups

### Railway API

Identity/localization:

```text
NODE_ENV=production
BC_WEBSITE_NAME=MITOS RENT A CAR
BC_DEFAULT_LANGUAGE=es
BC_TIMEZONE=America/Lima
BC_IPINFO_DEFAULT_COUNTRY=PE
```

Authority/security (values are secrets or deployment-specific and must never be committed):

```text
BC_DB_URI
BC_COOKIE_SECRET
BC_JWT_SECRET
BC_FRONTEND_HOST
BC_ADMIN_HOST
BC_ADMIN_EMAIL
```

Mail/payment/provider values remain provider-specific. The I6 pay-later proof does not require a payment provider to be enabled.

### Vercel Customer

At minimum production must point all API/CDN variables at the production API/storage authority rather than localhost:

```text
VITE_NODE_ENV=production
VITE_BC_WEBSITE_NAME=MITOS RENT A CAR
VITE_BC_DEFAULT_LANGUAGE=es
VITE_BC_API_HOST=<production API origin>
VITE_BC_CDN_USERS=<durable CDN users origin>
VITE_BC_CDN_CARS=<durable CDN cars origin>
VITE_BC_CDN_LOCATIONS=<durable CDN locations origin>
VITE_BC_CDN_LICENSES=<durable CDN licenses origin>
VITE_BC_CDN_TEMP_LICENSES=<durable temp licenses origin>
```

### Vercel Admin

```text
VITE_NODE_ENV=production
VITE_BC_WEBSITE_NAME=MITOS RENT A CAR
VITE_BC_DEFAULT_LANGUAGE=es
VITE_BC_API_HOST=<production API origin>
VITE_BC_CDN_USERS=<durable CDN users origin>
VITE_BC_CDN_TEMP_USERS=<durable CDN temp users origin>
VITE_BC_CDN_CARS=<durable CDN cars origin>
VITE_BC_CDN_TEMP_CARS=<durable CDN temp cars origin>
VITE_BC_CDN_LOCATIONS=<durable CDN locations origin>
VITE_BC_CDN_TEMP_LOCATIONS=<durable CDN temp locations origin>
VITE_BC_CDN_CONTRACTS=<durable CDN contracts origin>
VITE_BC_CDN_TEMP_CONTRACTS=<durable CDN temp contracts origin>
VITE_BC_CDN_LICENSES=<durable CDN licenses origin>
VITE_BC_CDN_TEMP_LICENSES=<durable CDN temp licenses origin>
```

## Production cookie/CORS contract

The API CORS whitelist already includes the runtime values of `BC_FRONTEND_HOST` and `BC_ADMIN_HOST`; these must be the exact deployed HTTPS origins.

Browser auth must be tested against the final deployment domains. Preferred production layout is same-site subdomains under one registrable domain, for example:

```text
www.<mitos-domain>   -> Vercel Customer
admin.<mitos-domain> -> Vercel Admin
api.<mitos-domain>   -> Railway API
```

This reduces cross-site cookie fragility. Platform-generated Vercel/Railway domains are acceptable for infrastructure smoke tests but must not be treated as browser-auth certification until the cookie/CORS behavior is proven.

## Durable storage blocker

Current backend code serves `/cdn` directly from `BC_CDN_ROOT` and creates/users files under local filesystem paths.

A normal Railway container filesystem is not a durable product authority across rebuild/redeploy.

Before production certification, choose one:

1. mount a durable Railway volume at the CDN root; or
2. migrate CDN files/uploads to durable object storage through a storage adapter.

For the smallest recovery-preserving deployment, a persistent volume is the minimum-change lane. Object storage is the better later portability lane.

Do not certify Admin uploads, car images, driver licenses or contracts as durable until this gate exists.

## Data isolation rule

Do not reuse MongoDB from unrelated Railway projects merely because it already exists.

Mitos must have its own database authority/credentials. A shared Mongo cluster is acceptable only when Mitos has an isolated database/user and that decision is explicit.

## Deployment sequence after I6 PASS

```text
D0 local final closure probe                 -> PASS
D1 local pay-later booking E2E               -> PASS
D2 create isolated Railway Mitos project     -> pending
D3 provision Mitos Mongo authority            -> pending
D4 provision durable CDN storage              -> pending
D5 deploy Railway API                         -> pending
D6 expose API HTTPS origin                    -> pending
D7 create/deploy Vercel Customer              -> pending
D8 create/deploy Vercel Admin                 -> pending
D9 wire exact CORS/cookie/frontend origins    -> pending
D10 seed/migrate required production data     -> pending
D11 production auth/search smoke              -> pending
D12 production pay-later booking E2E          -> pending
D13 zero visible BookCars sweep               -> pending
D14 production certification                  -> pending
```

## Current truth

```text
Deployment architecture selected       ✅
Vercel connection                      ✅
Railway connection                     ✅
Customer SPA routing prepared          ✅
Admin SPA routing prepared             ✅
Railway-safe Dockerfile prepared       ✅
Production resources created           ❌ deliberately not yet
Durable CDN provisioned                ❌ blocker before certification
I6 local transaction                   🟡 final receipt pending
Production deployment                  ❌ not started
```

The deployment lane is now prepared without contaminating the current local certification gate.
