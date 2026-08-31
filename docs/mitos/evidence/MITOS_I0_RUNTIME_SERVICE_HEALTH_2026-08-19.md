# Mitos Public Experience — I0 Runtime Service Health · 2026-08-19

**Status:** VERIFIED PARTIAL RUNTIME EVIDENCE  
**Repository:** `thradexIT/bookcars`  
**Branch:** `feature/mitos-public-experience-v1`  
**Compose:** `docker-compose.dev.yml`

## Purpose

Record user-observed local Docker runtime evidence before any Mitos runtime-source modification.

This artifact is evidence only. It does not authorize I1 by itself.

## Docker service health

User executed:

```bash
docker compose -f docker-compose.dev.yml ps
```

Observed services:

```text
bookcars-bc-dev-admin-1      Up   0.0.0.0:3001->3001/tcp
bookcars-bc-dev-backend-1    Up   0.0.0.0:4002->4002/tcp
bookcars-bc-dev-frontend-1   Up   0.0.0.0:8080->8080/tcp + 8443->443/tcp
bookcars-mongo-1             Up   0.0.0.0:27018->27017/tcp
bookcars-mongo-express-1     Up   0.0.0.0:8084->8081/tcp
```

Classification:

```text
Mongo                         ✅ runtime process up
Mongo Express                 ✅ runtime process up
Rent A Car backend            ✅ runtime process up
Rent A Car admin              ✅ runtime process up
Rent A Car frontend           ✅ runtime process up
```

`Up` proves container/process availability only; it does not by itself prove every application route or business flow.

## Backend settings endpoint

User executed:

```bash
curl -i http://localhost:4002/api/settings
```

Observed:

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

Response body:

```json
{
  "_id": "6a867a2a6ecbb6833ed0cca1",
  "minPickupHours": 1,
  "minRentalHours": 1,
  "minPickupDropoffHour": 0,
  "maxPickupDropoffHour": 23,
  "createdAt": "2026-08-20T03:53:14.708Z",
  "updatedAt": "2026-08-20T03:53:14.708Z",
  "__v": 0
}
```

Classification:

```text
backend HTTP reachability            ✅
/api/settings route                  ✅
settings record exists               ✅
settings JSON contract               ✅
minimum pickup lead                  1 hour
minimum rental duration              1 hour
allowed pickup/drop-off hours        00:00–23:00
```

This directly satisfies the runtime dependency that `SettingContext` uses before `SearchForm` can initialize.

## Existing Home visual runtime evidence

A user-supplied browser capture of `https://localhost:8080/` shows the pre-Mitos BookCars public Home rendering.

Observed baseline characteristics:

```text
BookCars header identity              ✅
USD presentation                      ✅
English public copy                   ✅
legacy hero/video treatment           ✅
legacy generic rental claims          ✅
BookCars Customer Care block          ✅
legacy BookCars footer                ✅
Stripe/payment presentation           ✅
```

At capture time the search container was visible but its internal controls were not visibly rendered.

This must not be mislabeled as a Mitos regression because no Mitos runtime source had been changed.

Source behavior explains that `SearchForm` returns `null` until settings are available. Since `/api/settings` is now independently verified as `200`, the next test is a browser reload and functional SearchForm check.

## Next required I0 proof

Before I0 can PASS:

```text
1. Reload /
2. Confirm pickup/drop-off/date controls render
3. Confirm location options can be loaded
4. Submit one valid non-destructive rental search
5. Verify navigation to /search
6. Capture /search runtime evidence
7. Record any pre-existing browser/network/backend errors
```

Useful direct location probe based on the current frontend contract:

```bash
curl -i 'http://localhost:4002/api/locations/1/30/en/?s='
```

This checks whether the runtime has location data usable by the current SearchForm.

## Gate after this evidence

```text
I0 source baseline                  ✅
I0 Docker stack health              ✅
I0 backend settings                 ✅
I0 Home visual baseline             ✅
I0 SearchForm controls              🟡 pending browser re-check
I0 location data                    🟡 pending
I0 SearchForm → /search             ⛔ pending
I0 /search visual/runtime evidence  ⛔ pending

I0                                  🟡 PARTIAL
I1                                  🔒 LOCKED
```

No Mitos runtime source modification is authorized until the remaining search-handoff evidence closes or is explicitly classified as a pre-existing blocker.