# Mitos Public Experience — I0 Runtime Home Evidence · 2026-08-19

**Status:** RUNTIME HOME VERIFIED / SEARCH CONTINUITY NOT YET VERIFIED  
**Repository:** `thradexIT/bookcars`  
**Branch observed locally:** `feature/mitos-public-experience-v1`  
**Local HEAD reported by operator:** `c9da1057adc2e5759bb11034b6759d4284c181b5`  
**Environment:** WSL + Docker Compose development stack  
**Frontend URL observed:** `https://localhost:8080/`

---

## 1. Operator-provided runtime evidence

The operator started the development Docker stack and supplied a browser capture of the customer frontend Home plus container startup logs.

Observed runtime logs include:

```text
bc-dev-frontend
VITE v7.3.0 ready
Local: https://localhost:8080/

bc-dev-admin
VITE v7.3.0 ready
Local: https://localhost:3001/admin/

mongo-express
Mongo Express server listening at http://0.0.0.0:8081
```

These observations establish that the frontend development runtime, admin development runtime, and Mongo Express process reached their respective ready states during this run.

Backend health is not classified from the supplied excerpt because no explicit backend-ready line or service-status table was included.

---

## 2. Home visual baseline

The supplied browser capture establishes a real pre-Mitos visual baseline for `/`.

Observed public identity/presentation:

```text
Header brand              BookCars
Currency                  USD
Language icon             US flag / English-oriented state
Hero eyebrow              Top Car Rental Deals
Hero headline             Book your Car today!
Hero visual               road/night driving background
```

Observed generic BookCars claims/content include:

```text
24-Hour Roadside Assistance
No Hidden Charges
Distinctive fleet
Unlimited Mileage
Wide Range Of Vehicles
Flexible Pick-Up & Drop-Off
Excellent Prices
Easy Online Booking
Instant Booking
24/7 Customer Support
```

Observed lower-page identity/content includes:

```text
FAQ
Map of Car Rental Locations
BookCars Customer Care
Always Here to Help
BookCars footer identity
info@bookcars.ma
Stripe payment presentation
Copyright © 2026 BookCars
```

This confirms that the existing public customer UI is still the generic BookCars-era experience and is suitable as the before-state for the Mitos rebrand.

No Mitos visual/runtime source changes had been intentionally introduced before this capture.

---

## 3. Search area classification

The Home capture shows a white search-area container in the hero, but the actual pickup/drop-off/date controls are not visibly rendered in the supplied evidence.

Therefore the current classification is deliberately conservative:

```text
Hero search container visible       ✅ VERIFIED
SearchForm component controls        🟡 NOT YET VERIFIED
Pickup/drop-off inputs               ⛔ NOT VISIBLE IN CAPTURE
Date/time controls                   ⛔ NOT VISIBLE IN CAPTURE
Search submit action                 ⛔ NOT VERIFIED
SearchForm → /search runtime handoff ⛔ NOT VERIFIED
```

This is consistent with the recovered source behavior in which `SearchForm` returns `null` until required runtime settings/date constraints are available.

The absence of visible controls must be investigated as part of I0 baseline closure. It is a pre-rebrand runtime observation, not a Mitos regression.

---

## 4. Security/browser note

The browser displays a local certificate warning / `No es seguro` state while accessing `https://localhost:8080`.

Classification:

```text
LOCAL DEVELOPMENT TLS WARNING = PRE-EXISTING / EXPECTED TO RECORD
```

This is not a Mitos public-production acceptance result.

---

## 5. What this evidence closes

```text
Docker frontend runtime reached ready state     ✅
Docker admin runtime reached ready state        ✅
Mongo Express process reached ready state       ✅
Customer Home `/` renders in browser             ✅
Desktop Home before-state visually captured      ✅
Generic BookCars identity visually confirmed     ✅
```

Still open:

```text
Docker service health table / backend health     ← NEXT
SearchForm controls runtime                       ← NEXT
SearchForm → /search                              ← NEXT
/search visual capture                            ← NEXT
safe transactional route smoke                    ← LATER IN I0
static lint/stylelint/build baseline              ← STILL REQUIRED
```

---

## 6. Gate effect

```text
I0 SOURCE BASELINE               ✅
I0 HOME RUNTIME                  ✅
I0 HOME VISUAL BASELINE          ✅
I0 SEARCH CONTINUITY             ⛔
I0 STATIC QUALITY BASELINE       ⛔
I0 TRANSACTIONAL SMOKE           ⛔

I0 OVERALL                       🟡 PARTIAL
I1 BRAND FOUNDATION BUILD        🔒 LOCKED
```

The correct next diagnostic is to verify Compose service health and determine why the search controls are not visible before making any source change.