# Mitos Public Experience — I0 Baseline Evidence · 2026-08-19

**Status:** PARTIAL — SOURCE + CI + LOCAL DOCKER SERVICE HEALTH + HOME VISUAL VERIFIED / SEARCH HANDOFF PENDING  
**Protocol:** `MITOS_I0_BASELINE_EVIDENCE_PROTOCOL_v0.1.md`  
**Repository:** `thradexIT/bookcars`  
**Working branch:** `feature/mitos-public-experience-v1`  
**Base:** `developer`  
**PR:** #3 — OPEN / DRAFT / UNMERGED

---

## 0. I0 decision

I0 now has real local runtime evidence in addition to source inspection.

```text
SOURCE BASELINE                  ✅ VERIFIED
CI BASELINE                      ✅ VERIFIED AS NO RUN ON CURRENT HEAD
LOCAL DOCKER STACK               ✅ VERIFIED UP
BACKEND /api/settings            ✅ VERIFIED 200
HOME VISUAL BASELINE             ✅ CAPTURED
SEARCHFORM CONTROLS              🟡 PENDING RE-CHECK
SEARCHFORM → /search             ⛔ PENDING
/search VISUAL/RUNTIME           ⛔ PENDING
TRANSACTIONAL SMOKE              ⛔ PENDING
```

Therefore:

```text
I0 = PARTIAL / NOT PASS
I1 = REMAINS LOCKED
```

No Mitos runtime source change is authorized yet.

---

## 1. Branch/source identity baseline

Pre-runtime baseline was established from:

```text
base branch      developer
base SHA         8ad4a8f51598e039aca7eaeb6e260772145e80f9
feature branch   feature/mitos-public-experience-v1
PR               #3
PR state         open / draft / unmerged
```

At the original pre-runtime anchor, the feature branch was 10 commits ahead and 0 behind `developer`, and every changed file was documentation under `docs/mitos/`.

No frontend/backend/Admin/Mobile/LaborSync runtime file had changed.

This remains the canonical pre-Mitos runtime-source anchor.

---

## 2. Frontend tooling contract — source verified

`frontend/package.json` identifies:

```text
package name     bookcars-frontend
version          8.4.0
module type      module
```

Relevant scripts:

```text
npm run dev
npm run build
npm run lint
npm run stylelint
npm run preview
```

No dedicated frontend `test` script exists in `frontend/package.json`.

---

## 3. CI baseline

The current feature/developer PR is not covered by the repository's existing main-only GitHub Actions triggers.

Classification:

```text
CI PASS                        ❌ NOT ESTABLISHED
CI FAIL                        ❌ NOT ESTABLISHED
CI NOT RUN FOR CURRENT HEAD    ✅ ESTABLISHED
```

This remains a documented baseline condition, not a green CI gate.

---

## 4. Route registration baseline — source verified

`frontend/src/App.tsx` registers the public/transactional routes under one `AppLayout`, including:

```text
/
/search
/checkout
/checkout-session/:sessionId
/bookings
/booking
/sign-in
/sign-up
/settings
/notifications
/about
/contact
/locations
/faq
/privacy
/tos
/cookie-policy
```

This confirms the architectural premise that Mitos can remain one frontend experience without creating a separate marketing application.

---

## 5. SearchForm source contract — verified

`frontend/src/components/SearchForm.tsx` preserves the current search contract:

```text
pickup location
drop-off location
same-location toggle
from date/time
to date/time
ranges
```

On valid submission it navigates to `/search` with:

```text
pickupLocationId
dropOffLocationId
from
to
ranges
```

This remains the canonical pre-rebrand handoff contract that later Mitos work must preserve.

---

## 6. Local Docker runtime — verified

User brought up the development stack using:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Observed running services:

```text
bookcars-bc-dev-admin-1      Up
bookcars-bc-dev-backend-1    Up
bookcars-bc-dev-frontend-1   Up
bookcars-mongo-1             Up
bookcars-mongo-express-1     Up
```

Observed mapped ports:

```text
Admin          3001
Backend        4002
Frontend       8080 (+ 8443→443)
Mongo          27018→27017
Mongo Express  8084→8081
```

This proves the local development service stack is operational at process/container level.

---

## 7. Backend settings runtime — verified

User executed:

```bash
curl -i http://localhost:4002/api/settings
```

Observed:

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

Returned settings:

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
backend HTTP reachability      ✅
/api/settings route            ✅
settings record exists         ✅
settings JSON contract         ✅
```

This satisfies the runtime dependency used by `SettingContext` before `SearchForm` can initialize.

---

## 8. Current public Home visual baseline — verified

A user-supplied browser capture of `https://localhost:8080/` shows the pre-Mitos BookCars public Home rendering.

Observed baseline:

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

This is the real pre-Mitos visual baseline.

At capture time the white search container was visible but its internal controls were not visibly rendered.

Because no Mitos runtime code had been changed, this is classified as a **pre-existing runtime state**, not a Mitos regression.

---

## 9. SearchForm runtime status

Source behavior shows that `SearchForm` waits for runtime settings before rendering controls.

Since `/api/settings` is now independently verified as `200`, the next browser check is:

```text
reload /
confirm pickup/drop-off/date controls render
confirm location options load
submit one valid search
verify navigation to /search
```

Useful direct location probe based on the frontend service contract:

```bash
curl -i 'http://localhost:4002/api/locations/1/30/en/?s='
```

Current classification:

```text
SearchForm source contract        ✅ VERIFIED
settings runtime dependency       ✅ VERIFIED
SearchForm controls visible       🟡 PENDING RE-CHECK
location data usable              🟡 PENDING
valid input reaches /search       ⛔ PENDING
/search real continuation         ⛔ PENDING
```

---

## 10. Static checks

Repository-supported static/build commands are known, but I0 does not infer execution from Docker rendering.

Still to record explicitly if required by the final gate:

```text
npm run lint
npm run stylelint
npm run build
```

The Docker dev build has already proven TypeScript/Vite startup sufficiently to render the frontend and admin, but it is not a substitute for the explicit lint/stylelint/build evidence defined in the protocol.

---

## 11. Transactional smoke baseline

Still not executed:

```text
/checkout
/checkout-session/:id
/booking
/bookings
auth/session continuation
payment continuation
```

No destructive/live booking should be created for I0.

---

## 12. Supporting evidence artifact

Detailed local service-health evidence is also stored in:

```text
docs/mitos/evidence/MITOS_I0_RUNTIME_SERVICE_HEALTH_2026-08-19.md
```

---

## 13. I0 gate verdict

```text
Branch integrity                   ✅
Runtime source unchanged           ✅
Tool/scripts contract recovered    ✅
Route matrix source verified       ✅
Search handoff source verified     ✅
CI absence explained               ✅
Local Docker stack                 ✅
Backend /api/settings              ✅
Runtime Home                       ✅
Home visual screenshot             ✅
SearchForm controls                🟡
Location data                      🟡
Runtime /search                    ⛔
SearchForm → /search               ⛔
Explicit lint/stylelint/build      ⛔
Transactional smoke                ⛔

I0 BASELINE                        🟡 PARTIAL
I1 BRAND FOUNDATION BUILD          🔒 LOCKED
RUNTIME SOURCE MODIFICATION        ⛔ NOT AUTHORIZED YET
```

The immediate next gate is functional search continuity. If that passes, I0 is very close to closure.