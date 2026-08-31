# Mitos Public Experience — I0 Runtime Blockers · 2026-08-20

**Classification:** PRE-EXISTING LOCAL/DEV BASELINE CONDITIONS  
**Repository:** `thradexIT/bookcars`  
**Branch:** `feature/mitos-public-experience-v1`  
**Purpose:** Record blockers discovered before any Mitos runtime source modification.

## Runtime stack

The user-provided Docker runtime showed all development services up:

```text
bc-dev-admin      UP
bc-dev-backend    UP
bc-dev-frontend   UP
mongo             UP
mongo-express     UP
```

`GET http://localhost:4002/api/settings` returned HTTP 200 with a valid settings document:

```text
minPickupHours       1
minRentalHours       1
minPickupDropoffHour 0
maxPickupDropoffHour 23
```

Therefore backend process health and settings persistence are established.

## B-01 — Local HTTPS frontend rejected by backend CORS

Browser/runtime logs show:

```text
Incoming Origin: https://localhost:8080
Not allowed by CORS: https://localhost:8080
```

The current backend whitelist includes `http://localhost:8080` but not `https://localhost:8080`.

This explains why the public Home shell renders while API-backed components such as the rental SearchForm cannot finish browser initialization.

Classification:

```text
source lineage              pre-existing / developer-derived
Mitos-induced regression    NO
backend process failure     NO
browser integration defect  YES — local origin mismatch
```

## B-02 — Local rental location dataset is empty

Direct request:

```text
GET /api/locations/1/30/en/?s=
HTTP 200
[{"resultData":[],"pageInfo":[]}]
```

Therefore the endpoint is operational but the current local Mongo dataset contains no searchable rental locations.

This is distinct from CORS: even after browser CORS is resolved, a functional SearchForm submission still requires at least one local test/rental location record.

Classification:

```text
API health                     PASS
location endpoint              PASS
location business/test data    EMPTY
Mitos-induced regression       NO
```

## Setup command finding

`backend/src/setup/setup.ts` creates/ensures:

```text
admin user
client types
```

It does **not** seed rental locations or fleet data.

Therefore `npm run setup` must not be represented as the solution for B-02.

## I0 consequence

These findings are useful baseline evidence rather than a reason to rewrite Mitos design.

Current runtime proof:

```text
Docker stack                     ✅
backend /api/settings            ✅
public Home shell                ✅
pre-Mitos visual baseline        ✅
CORS browser API continuity      ❌ PRE-EXISTING LOCAL BLOCKER
rental location dataset          ❌ EMPTY LOCAL DATASET
SearchForm controls              not yet fully proven
SearchForm → /search             not yet proven
```

No Mitos runtime source change had occurred when these conditions were observed.

## Closure rule

I0 may close once the baseline records these blockers and the team chooses one controlled local-test path to obtain SearchForm → `/search` evidence:

1. correct the local dev CORS origin seam without altering rental-domain semantics; and
2. create/import clearly labeled local test location data, or use another verified non-production dataset.

Any such action must remain local/test infrastructure or an explicitly scoped corrective commit. It must not invent Mitos commercial operating truth.
