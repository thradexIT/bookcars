# Mitos Public Experience — I1–I3 Public Rebrand Build v0.1

**Status:** IMPLEMENTED / RUNTIME VISUAL QA REQUIRED  
**Branch:** `feature/mitos-public-experience-v1`  
**Base:** `developer`  
**Scope:** I1 Brand Foundation Runtime + I2 Header/Footer + I3 Mitos Home

---

## 1. Gate interpretation

I0 recovered enough real runtime evidence to authorize non-transactional public-surface work while preserving known baseline defects separately.

Known pre-build baseline issues remain registered:

- local HTTPS frontend required matching backend CORS origin;
- local rental location dataset returned an empty result set;
- `ClientType` setup reports a pre-existing `privileges.rentDiscount` validation error but backend continues and reaches `HTTP server is running on port 4002`;
- full `/ → /search` smoke remains pending usable local rental data.

This build does **not** reinterpret those issues as Mitos regressions.

---

## 2. Implementation strategy

The public rebrand was implemented using reversible additive surfaces instead of destructive rewrites.

```text
OLD Header.tsx        PRESERVED
NEW MitosHeader.tsx   ACTIVE GLOBAL WRAPPER

OLD Home.tsx          PRESERVED
NEW MitosHome.tsx     ACTIVE /

OLD Footer.tsx        PRESERVED
NEW MitosFooter.tsx   ACTIVE ON MITOS HOME
```

This keeps rollback low-risk and preserves the recovered Rent A Car implementation for comparison.

---

## 3. I1 — Brand foundation runtime

Created:

`frontend/src/config/mitosBrand.ts`

Centralized confirmed public truth:

- `MITOS RENT A CAR`
- `MITOS`
- `RENT A CAR`
- `Alquila fácil, viaja seguro.`
- `www.mitosrentacar.com`
- `@mitosrentacar`
- `+51 941 368 086`
- Lima, Perú
- Toyota Yaris 2025/26
- Toyota Raize
- historical/public promotion reference from US$35/day

Exact original vector logo and exact approved brand-token source remain replaceable when recovered.

Runtime visual direction:

```text
white
bright blue
strong blue
light blue surfaces
clean automotive geometry
open whitespace
NO dark website
NO Gallo workshop styling
```

---

## 4. I2 — Header and Footer

Created:

- `frontend/src/components/MitosHeader.tsx`
- `frontend/src/assets/css/mitos-header.css`
- `frontend/src/components/MitosFooter.tsx`
- `frontend/src/assets/css/mitos-footer.css`

### Header strategy

`MitosHeader` wraps the existing `Header` instead of replacing its behavioral implementation.

Preserved capabilities include the existing menu/auth/language/currency behavior.

The wrapper:

- sets browser title to `MITOS RENT A CAR`;
- adds Mitos tagline/market ribbon;
- visually replaces the public BookCars wordmark with a text-based Mitos wordmark;
- applies white/blue styling.

No original-logo claim is made. The current wordmark is a replaceable runtime seam pending source brand assets.

### Footer strategy

The new footer uses only confirmed public contact truth:

- WhatsApp
- Instagram
- publicized domain
- Lima/Peru market context
- tagline

It deliberately omits unverified email, office address and opening hours.

---

## 5. I3 — Mitos Home

Created:

- `frontend/src/pages/MitosHome.tsx`
- `frontend/src/assets/css/mitos-home.css`

`/` now presents the Mitos public experience.

Section sequence implemented:

```text
Hero
  ↓
Real SearchForm entry
  ↓
Why Mitos
  ↓
Published vehicle references
  ↓
How renting works
  ↓
Travel / mobility experience
  ↓
Promotion slot
  ↓
Truth-safe FAQ
  ↓
Search / WhatsApp / future Agent CTA
  ↓
Mitos Footer
```

### Ready customer path

```text
Mitos Home
→ SearchForm
→ existing /search contract
```

`SearchForm` itself was not modified.

### Help path

WhatsApp is active using the recovered public number.

### Agent seam

The landing visibly reserves an Agent position, but the agent control is intentionally non-operational and labeled as upcoming.

No fake AI interaction or reservation authority is implemented.

---

## 6. Truth safety

Vehicle references are explicitly labeled as publicly advertised models, not live inventory.

Promotion copy is explicitly framed as a previously/publicly communicated reference and requires confirmation of current validity, availability and conditions.

The landing does not claim verified:

- live fleet availability;
- permanent price;
- deposits;
- exact insurance terms;
- current pickup/drop-off network;
- office hours;
- cancellation/refund policy.

---

## 7. Transactional authority preserved

No changes were made to the authority of:

```text
SearchForm behavior
/search receiving logic
availability calculation
rental price calculation
checkout
payment
booking state
backend rental domain
Admin
LaborSync
CRM
Agent runtime
```

The only router changes are the visual shell imports:

```text
Header → MitosHeader
Home   → MitosHome
```

All existing transactional routes remain registered under the same router.

---

## 8. Runtime QA required

This connector cannot execute the user's local Docker runtime.

Required local validation after pull:

```text
1. feature branch pulls latest HEAD
2. Vite recompiles without TS errors
3. / renders Mitos Home
4. page is white/blue, not dark
5. header displays Mitos identity
6. WhatsApp link points to +51 941 368 086
7. Instagram link points to @mitosrentacar
8. responsive desktop/mobile visual review
9. SearchForm remains mounted
10. when usable rental data exists, SearchForm → /search remains unchanged
```

If TypeScript, CSS or runtime errors appear, classify and fix inside this slice before proceeding to deeper funnel rebrand.

---

## 9. Current gate

```text
I0 BASELINE                               ✅ sufficient for public non-transactional slices / known issues registered
I1 BRAND FOUNDATION RUNTIME               ✅ IMPLEMENTED
I2 MITOS HEADER + FOOTER                  ✅ IMPLEMENTED
I3 MITOS HOME                             ✅ IMPLEMENTED

I1–I3 RUNTIME VISUAL QA                   ← NEXT
/search VISUAL CONTINUITY                 🔒 after Home acceptance
AGENT RUNTIME                             🔒 later
CRM                                       🔒 later
```
