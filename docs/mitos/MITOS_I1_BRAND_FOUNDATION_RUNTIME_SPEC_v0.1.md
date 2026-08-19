# Mitos Public Experience — I1 Brand Foundation Runtime Spec v0.1

**Status:** READY AFTER I0 / DOCUMENTATION ONLY  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`

---

## 0. Objective

I1 introduces the smallest runtime brand foundation required for the Mitos public experience.

I1 is intentionally **not** the Home redesign.

Its job is to create one reliable identity source and one semantic visual-token layer so later Header, Footer and Home work do not scatter brand facts across components.

---

## 1. Inputs

I1 consumes frozen truth from:

```text
MITOS_BRAND_FOUNDATION_v0.1.md
MITOS_PUBLIC_IDENTITY_INVENTORY_v0.1.md
MITOS_PUBLIC_EXPERIENCE_SURFACE_HANDOFF_CONTRACT_v0.1.md
MITOS_PUBLIC_EXPERIENCE_IMPLEMENTATION_PLAN_v0.1.md
```

Known public identity:

```text
name                 MITOS RENT A CAR
tagline              Alquila fácil, viaja seguro.
phoneWhatsapp        +51 941 368 086
instagramHandle      @mitosrentacar
publicizedDomain     www.mitosrentacar.com
market               Lima / Perú
```

Exact official logo source and exact official color values remain replaceable until source assets are recovered.

---

## 2. Runtime brand source contract

Create one public brand module/configuration source.

Conceptual shape:

```text
MitosPublicBrand

name
shortName?
tagline
phoneWhatsapp
whatsappHref
instagramHandle
instagramHref
publicizedDomain
market
```

The implementation may use the repository's preferred TypeScript/config pattern.

### Rule

Components should consume this source rather than repeating literal strings.

Do not turn commercial policy into brand config.

Forbidden brand-config fields unless separately authorized:

```text
current daily price
insurance rules
deposit
minimum age
mileage limits
cancellation rules
live vehicle availability
```

---

## 3. Semantic visual token contract

I1 establishes replaceable semantic tokens.

Required concepts:

```text
--mitos-blue-primary
--mitos-blue-deep
--mitos-blue-soft
--mitos-white
--mitos-ink
--mitos-muted
--mitos-border
--mitos-surface
--mitos-focus
```

Optional additional tokens may be introduced only when they describe reusable presentation semantics rather than one-off component styling.

### Token law

```text
semantic token
      ↓
component styling
```

not:

```text
component
      ↓
random hardcoded blue
```

Exact values are provisional until source brand assets/tokens are recovered.

---

## 4. Brand asset contract

I1 may establish directories/references for:

```text
Mitos logo primary
Mitos logo white
Mitos icon/favicon
social/public imagery foundations
```

If only screenshot-derived evidence exists, do not ship a low-resolution screenshot crop as the permanent logo.

Allowed temporary behavior:

```text
text/structured brand fallback
replaceable placeholder asset path
```

Not allowed:

```text
invented Mitos logo
AI-generated logo presented as official
Gallo logo as temporary Mitos brand
BookCars wordmark as Mitos fallback in production
```

---

## 5. Environment/default identity behavior

Current generic environment behavior includes `BookCars` as a fallback website name.

I1 must ensure the intended Mitos deployment cannot accidentally present itself as BookCars when public Mitos configuration is expected.

However:

```text
brand fallback cleanup ≠ commercial runtime configuration rewrite
```

### Review, do not silently change

```text
DEFAULT_LANGUAGE
BASE_CURRENCY
PAYMENT_GATEWAY
CONTACT_EMAIL
```

These affect product/runtime behavior or public business truth and must remain independently configurable.

For Mitos Peru, Spanish-first UX may be desired, but I1 must not silently redefine account/user language semantics without explicit implementation decision and verification.

Likewise, `USD` being present in public historical promotions does not by itself authorize changing all system currency behavior.

---

## 6. Candidate implementation files

Likely touch surface:

```text
frontend/src/config/*
frontend/src/assets/css/* shared variables
frontend/src/theme/* if introduced consistently
frontend/public/* brand asset locations when appropriate
frontend/.env.example or deployment docs only if needed
```

Potential new file examples:

```text
frontend/src/config/mitosBrand.ts
frontend/src/assets/css/mitos-tokens.css
```

Names are implementation choices, not frozen architecture.

---

## 7. Explicitly forbidden I1 changes

I1 must not modify:

```text
frontend/src/components/SearchForm.tsx behavior
search request/query contract
/search result logic
backend availability logic
Car/Booking domain semantics
price calculation
payment service semantics
checkout flow
booking state transitions
Admin
LaborSync
Agent runtime
CRM integration
```

If any of these appear necessary merely to establish branding, stop and reassess.

---

## 8. I1 verification checklist

After implementation, verify:

```text
Mitos public identity has one runtime source
brand strings are not unnecessarily duplicated
semantic tokens exist
no generic BookCars production fallback leaks into intended Mitos identity
current SearchForm contract unchanged
/search still resolves as before
no price/payment/booking behavior changed
lint/build result compared to I0
```

Visual perfection is not the I1 gate.

I1 creates the foundation used by I2+.

---

## 9. I1 evidence artifact

When executed, create:

```text
docs/mitos/evidence/
└── YYYY-MM-DD_MITOS_I1_BRAND_FOUNDATION_EVIDENCE.md
```

Record:

```text
files changed
brand source shape
token location
before/after identity behavior
commands run
lint/build result
/search smoke result
known remaining brand gaps
```

---

## 10. Exit gate

I1 is complete only when:

```text
central brand source              ✅
semantic tokens                   ✅
brand asset seam                  ✅
generic fallback risk controlled  ✅
SearchForm unchanged              ✅
/search smoke unchanged           ✅
transactional/domain logic untouched ✅
evidence recorded                 ✅
```

Then and only then:

```text
I2 — HEADER + FOOTER
```

may begin.

---

## 11. State

```text
I1 SPEC                           ✅ DOCUMENTED
I1 BUILD                          🔒 after I0
I2 HEADER + FOOTER                🔒 after I1
I3 MITOS HOME                     🔒 later
AGENT RUNTIME                     🔒 later
CRM                               🔒 later
```
