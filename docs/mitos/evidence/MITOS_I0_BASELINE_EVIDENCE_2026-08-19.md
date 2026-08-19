# Mitos Public Experience — I0 Baseline Evidence · 2026-08-19

**Status:** PARTIAL — SOURCE BASELINE VERIFIED / CI BASELINE VERIFIED / LOCAL RUNTIME NOT EXECUTED  
**Protocol:** `MITOS_I0_BASELINE_EVIDENCE_PROTOCOL_v0.1.md`  
**Repository:** `thradexIT/bookcars`  
**Working branch:** `feature/mitos-public-experience-v1`  
**Base:** `developer`  
**PR:** #3 — OPEN / DRAFT / UNMERGED

---

## 0. I0 decision

I0 has been executed as far as the currently connected GitHub environment can provide real evidence.

The following layers are distinguished deliberately:

```text
SOURCE BASELINE     ✅ VERIFIED
CI BASELINE         ✅ VERIFIED AS NO RUN ON CURRENT HEAD
LOCAL RUNTIME       ⛔ NOT EXECUTED IN THIS ENVIRONMENT
VISUAL SCREENSHOTS  ⛔ NOT CAPTURED
TRANSACTIONAL SMOKE ⛔ NOT EXECUTED
```

Therefore:

```text
I0 = PARTIAL / NOT PASS
I1 = REMAINS LOCKED
```

No runtime source change is authorized by this evidence record.

---

## 1. Branch/source identity baseline

Baseline observed immediately before creating this evidence artifact:

```text
base branch      developer
base SHA         8ad4a8f51598e039aca7eaeb6e260772145e80f9
feature branch   feature/mitos-public-experience-v1
feature HEAD     b269e38c21f762cc45f4b68e45e1606b271d869e
PR               #3
PR state         open
PR draft         true
PR merged        false
```

Git comparison at that point:

```text
feature vs developer
status     ahead
ahead_by   10
behind_by  0
```

Critically, every changed file was documentation under `docs/mitos/`.

No frontend/backend/Admin/Mobile/LaborSync runtime file had changed.

This establishes a clean pre-runtime anchor:

> The application source tree on the Mitos feature branch was still functionally identical to `developer` before I0 evidence documentation was committed.

The evidence commit itself changes documentation only and does not invalidate that runtime-source baseline.

---

## 2. Frontend tooling contract — source verified

`frontend/package.json` identifies:

```text
package name     bookcars-frontend
version          8.4.0
module type      module
```

Repository scripts relevant to I0:

```text
npm run dev
  → npm run ts:build && vite

npm run build
  → npm run ts:build && cross-env NODE_OPTIONS=--max-old-space-size=4096 vite build

npm run lint
  → eslint . --cache --cache-location .eslintcache

npm run stylelint
  → stylelint "src/**/*.css"

npm run preview
  → npm run build && vite preview --port 3002
```

`ts:build` runs the repository's local dependency installation chain and then TypeScript build:

```text
npm run install:dependencies
→ currency-converter package install
→ bookcars-helper package install
→ reactjs-social-login package install
→ tsc --build --verbose
```

### Frontend test command

No dedicated `test` script exists in `frontend/package.json`.

Classification:

```text
frontend unit test command = NOT AVAILABLE IN FRONTEND PACKAGE SCRIPTS
```

This does not mean the repository has no tests elsewhere.

---

## 3. Node/package-manager evidence

GitHub build workflow uses:

```text
node-version: lts/*
```

and runs frontend installation/build using:

```text
cd ./frontend
npm install --force
npm run lint
npm run build
```

Therefore the repository-supported package-manager path is `npm`.

Exact local Node/npm versions were **not executed/captured** in this environment and remain required in the local-runtime closure step.

---

## 4. CI baseline

For feature HEAD `b269e38c21f762cc45f4b68e45e1606b271d869e`:

```text
combined status entries = none
workflow runs           = none
```

This must not be interpreted as CI PASS.

The repository contains GitHub workflows, including:

```text
build.yml
test.yml
containerize.yml
...
```

But current trigger configuration explains the absence of PR evidence:

### `build.yml`

```text
push:         main
pull_request: main
```

PR #3 targets `developer`, so this workflow does not provide a build gate for this PR under its current trigger configuration.

### `test.yml`

```text
push: main
pull_request trigger commented out
```

It currently runs backend tests on main pushes and does not provide a feature/developer PR test result.

Classification:

```text
CI PASS                        ❌ NOT ESTABLISHED
CI FAIL                        ❌ NOT ESTABLISHED
CI NOT RUN FOR CURRENT HEAD    ✅ ESTABLISHED
```

---

## 5. Route registration baseline — source verified

`frontend/src/App.tsx` registers the public/transactional routes under one `AppLayout`:

```text
/                         Home
/sign-in                  SignIn
/sign-up                  SignUp
/activate                 Activate
/forgot-password          ForgotPassword
/reset-password           ResetPassword
/search                   Search
/checkout                 Checkout
/checkout-session/:id     CheckoutSession
/bookings                 Bookings
/booking                  Booking
/settings                 Settings
/notifications            Notifications
/change-password          ChangePassword
/about                    About
/tos                      ToS
/privacy                  Privacy
/contact                  Contact
/locations                Locations
/faq                      Faq
/cookie-policy            CookiePolicy
/suppliers                conditional on !HIDE_SUPPLIERS
*                         NoMatch
```

Classification for these routes during current I0:

```text
REGISTERED             ✅ source verified
RUNTIME VERIFIED       ⛔ not executed
AUTH/DATA BEHAVIOR     ⛔ not executed
TRANSACTION VERIFIED   ⛔ not executed
```

This confirms the architectural premise that Mitos can remain one frontend experience without creating a separate marketing application.

---

## 6. SearchForm contract baseline — source verified

`frontend/src/components/SearchForm.tsx` remains unchanged from the `developer` runtime source baseline.

Observed functional contract from source:

```text
inputs/state
- pickup location
- drop-off location
- same-location toggle
- from date/time
- to date/time
- ranges
```

The component reads runtime settings for:

```text
minimum pickup lead time
minimum rental duration
minimum pickup/drop-off hour
maximum pickup/drop-off hour
```

On valid submission it navigates to:

```text
/search
```

with React Router state:

```text
pickupLocationId
dropOffLocationId
from
to
ranges
```

This is the canonical pre-rebrand handoff contract that I4 must preserve.

### Runtime classification

```text
SearchForm source contract        ✅ VERIFIED
SearchForm renders locally        ⛔ NOT EXECUTED
valid input reaches /search       ⛔ NOT EXECUTED
live location lookup works        ⛔ NOT EXECUTED
settings-backed validation works  ⛔ NOT EXECUTED
```

---

## 7. `/search` receiving contract — source verified

`frontend/src/pages/Search.tsx` consumes `location.state`.

It requires at minimum:

```text
pickupLocationId
dropOffLocationId
from
to
```

If state is absent or required values are missing, it sets a no-match path.

When state is present, source code resolves pickup/drop-off locations and constructs rental search payloads using current filters such as:

```text
carSpecs
carType
gearbox
mileage
fuelPolicy
deposit
ranges
multimedia
rating
seats
from
to
```

Classification:

```text
SearchForm → /search structural contract ✅ VERIFIED
real API/data continuation                ⛔ NOT EXECUTED
vehicle results                           ⛔ NOT EXECUTED
filters runtime behavior                  ⛔ NOT EXECUTED
```

---

## 8. Current public Home baseline — source only

Because no browser/runtime is connected in this I0 execution, current Home is classified from existing source, not from new visual evidence.

Known pre-rebrand source includes:

```text
generic BookCars-era hero/video presentation
existing real SearchForm
Why/service blocks
generic rental marketing copy
supplier/destination capability
Mini/Midi/Maxi demo-price code path
Gallo Autos map marker asset
FAQ/Footer composition
```

These were already recovered during Identity Inventory.

Required I0 visual evidence remains:

```text
desktop / screenshot ⛔
mobile / screenshot  ⛔ if practical
/search screenshot   ⛔
```

Do not substitute source inspection for visual acceptance.

---

## 9. Static checks — execution state

Repository-supported commands are known, but were not executed by this GitHub connector environment.

Current classification:

```text
npm install --force   NOT EXECUTED
npm run lint          NOT EXECUTED
npm run stylelint     NOT EXECUTED
npm run build         NOT EXECUTED
npm run dev           NOT EXECUTED
```

No result should be inferred from source inspection.

---

## 10. Transactional smoke baseline

Not executed here:

```text
/checkout                 NOT EXECUTED
/checkout-session/:id     NOT EXECUTED
/booking                  NOT EXECUTED
/bookings                 NOT EXECUTED
auth/session continuation NOT EXECUTED
payment continuation      NOT EXECUTED
```

Source route registration exists, but that is not transactional proof.

No destructive/live booking was attempted.

---

## 11. What is required to close I0

Use a real local/dev environment on this exact feature branch and record:

```text
1. git rev-parse HEAD
2. node --version
3. npm --version
4. cd frontend
5. npm install --force
6. npm run lint
7. npm run stylelint
8. npm run build
9. npm run dev
10. local URL
11. desktop / screenshot
12. mobile / screenshot if practical
13. execute Home SearchForm with valid test data
14. verify navigation to /search
15. record resulting state/behavior
16. capture /search screenshot
17. smoke /checkout, /booking, /bookings without destructive production actions
18. record all warnings/errors as PRE-EXISTING or NEW
```

If environment/data prevents one of these, record the blocker instead of inventing a pass.

---

## 12. I0 gate verdict

```text
Branch integrity                   ✅
Runtime source unchanged           ✅
Tool/scripts contract recovered    ✅
Route matrix source verified       ✅
Search handoff source verified     ✅
CI absence explained               ✅
Local Node/npm baseline            ⛔
Install baseline                   ⛔
Lint baseline                      ⛔
Stylelint baseline                 ⛔
Build baseline                     ⛔
Runtime Home                       ⛔
Runtime /search                    ⛔
Visual screenshots                 ⛔
Transactional smoke                ⛔

I0 BASELINE                        🟡 PARTIAL
I1 BRAND FOUNDATION BUILD          🔒 LOCKED
RUNTIME SOURCE MODIFICATION        ⛔ NOT AUTHORIZED YET
```

This is a deliberate stop, not a project failure.

I0 closes only when the missing runtime evidence is attached or recorded.