# Mitos — Interaction & Surface Design v0.1

**Status:** DESIGN FROZEN FOR IMPLEMENTATION PLANNING  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`

---

## 0. Design thesis

Mitos should not be a marketing bridge that throws the customer into a visibly separate rental product.

The preferred public model is:

```text
MITOS HOME
brand + persuasion + real rental search + optional Agent
        ↓
/search
        ↓
vehicle results
        ↓
checkout
        ↓
booking
```

The customer experiences one Mitos website even though different internal capabilities retain separate authority.

---

## 1. Existing route advantage

The current frontend already exposes the rental journey under one React Router shell:

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
/locations
/about
/contact
/faq
/privacy
/tos
/cookie-policy
```

Therefore `/` should evolve into the Mitos public landing rather than introducing a second marketing application.

Existing `/search`, checkout and booking routes remain the transactional continuation.

---

## 2. Public experience composition

```text
MITOS PUBLIC EXPERIENCE
│
├── PRESENTATION
│   └── Mitos Home / Landing
│
├── GUIDANCE
│   └── optional Mitos Agent
│
└── TRANSACTION
    └── existing Rent A Car funnel
```

### Singular authorities

```text
Landing → presentation / persuasion / editorial promotions
Agent   → conversation / guidance / RentalSearchIntent
Rent A Car → locations / availability / vehicle / price / reservation / checkout
```

No surface may silently duplicate another surface's truth.

---

# 3. `/` — Mitos Home

## Section M01 — Header

### Goal

Recognizable Mitos identity + low-friction navigation.

### Desktop

```text
[MITOS logo]
Inicio
Vehículos
Cómo alquilar
Promociones
Preguntas
[ Mis reservas ]
[ Hablar con Mitos ]
[ Buscar auto ]
```

The exact number of visible nav items may be reduced at implementation time to preserve hierarchy.

### Mobile

```text
[MITOS logo]                     [menu]
                         [Buscar auto]
```

Agent remains available as a dedicated launcher, not a mandatory navigation step.

### Header rules

- replace generic `env.WEBSITE_NAME` text treatment with real Mitos brand component;
- preserve account/bookings access where relevant;
- language/currency selectors remain only if intentionally enabled for Mitos;
- supplier navigation must not surface if Mitos is presented as one rental brand.

---

## Section M02 — Hero + real rental search

This is the most important surface.

### Layout

Desktop:

```text
┌───────────────────────────────────────────────────────┐
│ MITOS RENT A CAR                                     │
│                                                       │
│ Alquila fácil, viaja seguro.                         │
│ Tu ruta empieza aquí.                                │
│                                                       │
│ [ Buscar auto ]    [ Hablar con Mitos ]              │
│                                                       │
│                                      [vehicle image] │
│                                                       │
│ ┌───────────────────────────────────────────────────┐ │
│ │ EXISTING RENTAL SEARCH                            │ │
│ │ pickup | return | from | to | [BUSCAR]           │ │
│ └───────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### Critical rule

The search block is not decorative.

It is the existing Rent A Car `SearchForm` capability restyled for Mitos.

On submit it continues to the existing `/search` path with the same functional contract.

### Primary CTA

`Buscar auto`

Behavior:
- focus/scroll to search on desktop;
- open search surface/bottom sheet if a compact mobile treatment is used.

### Secondary CTA

`Hablar con Mitos`

Behavior in current phase:
- opens Agent launcher placeholder/shell when Agent is later implemented;
- until Agent exists, may fall back to verified WhatsApp rather than simulate an AI conversation.

No fake Agent UI should be shipped as if operational.

---

## Section M03 — Why Mitos

### Goal

Answer why a visitor should continue with this rental experience.

### Recommended 3–4 compact pillars

Truth-safe directions:

```text
Reserva simple
Movilidad para tu plan
Atención rápida
Viaja con confianza
```

Avoid importing generic BookCars absolutes such as unlimited mileage, no hidden charges or 24/7 assistance unless Mitos operating truth confirms them.

### Visual behavior

Use wide editorial cards or a horizontal benefit rail, not six generic Material UI icon boxes.

---

## Section M04 — Featured vehicles

### Goal

Make the rental product tangible before the user enters results.

### Evidence-backed examples

```text
Toyota Yaris 2025/26
Toyota Raize
```

### Card contract

```text
vehicle image
model
short positioning sentence
verified light specs if available
[ Ver opciones ] / [ Buscar similares ]
```

### Authority rule

Landing vehicle presentation may be editorial/featured.

Real live availability and current price belong to Rent A Car results/catalog authority.

If a featured vehicle is not currently available, the landing must not imply otherwise.

---

## Section M05 — How renting works

### Goal

Explain the funnel before asking for commitment.

Recommended sequence:

```text
1. Busca tu vehículo
2. Elige la opción que mejor encaje
3. Completa tu reserva
4. Recibe tu confirmación
```

When Agent is active, an alternate assisted path may be shown:

```text
¿No sabes cuál elegir?
Habla con Mitos y te ayudamos a empezar la búsqueda.
```

The Agent assists before or during discovery; it does not replace checkout.

---

## Section M06 — Travel / mobility editorial

### Goal

Build Mitos emotional identity.

Possible headline territory:

```text
Tu ruta, tu ritmo.
```

Visuals:
- car + road;
- Lima/city mobility;
- weekend route;
- beach/travel environments;
- real Mitos assets when available.

This section should create desire without introducing unverifiable fleet claims.

---

## Section M07 — Promotion slot

### Goal

Translate Mitos's existing social-promotion behavior into a controlled website component.

### Contract

```text
campaign label
headline
optional vehicle
optional current approved `desde` price
conditions / validity
CTA
```

### Rule

Historical Instagram prices are evidence, not evergreen catalog price.

The component must support omission of monetary price when current commercial truth is unavailable.

---

## Section M08 — Trust / FAQ

### Goal

Resolve friction without publishing guessed policies.

Initial safe questions:

```text
¿Cómo empiezo una reserva?
¿Cómo busco un vehículo?
¿Puedo pedir ayuda para elegir?
¿Cómo contacto a Mitos?
¿Dónde veo las condiciones de mi reserva?
```

Policy-specific answers should be driven by actual commercial configuration later.

---

## Section M09 — Final conversion

### Visual hierarchy

```text
¿Listo para tu próxima ruta?

[ Buscar auto ]
[ WhatsApp ]
[ Hablar con Mitos ]  ← when Agent active
```

This keeps three legitimate user paths separate:

```text
ready renter → Search
human help   → WhatsApp
AI guidance  → Agent
```

---

## Section M10 — Footer

Minimum Mitos treatment:

```text
Mitos logo
Alquila fácil, viaja seguro.
@mitosrentacar
+51 941 368 086
www.mitosrentacar.com
legal/navigation links
```

Do not retain generic Facebook/X/LinkedIn destinations unless actual Mitos accounts are verified.

Payment logos must reflect the configured real payment gateway, not a static brand promise.

---

# 4. Agent interaction design

## 4.1 Presence

Recommended initial presence:

```text
/          Agent available
/search    later: contextual Agent
/checkout  limited/off
/payment   off/minimal
/booking   optional post-booking help later
```

Phase 1 may implement Agent only on Home.

## 4.2 Entry points

1. Hero secondary CTA: `Hablar con Mitos`
2. Floating launcher on Home
3. Optional assistance CTA in Featured Vehicles / How It Works

Do not put a large chat window permanently above the search form.

## 4.3 Agent handoff payload

Future contract should normalize conversational intent into something equivalent to:

```text
RentalSearchIntent
- pickupLocation?
- dropOffLocation?
- from?
- to?
- vehiclePreference?
- passengerNeed?
- luggageNeed?
- notes?
```

Then:

```text
Agent
  ↓
RentalSearchIntent
  ↓
existing search route/form state
  ↓
Rent A Car authority
```

The Agent must not create a parallel booking database.

---

# 5. `/search` continuity design

The current `/search` route remains the real result surface.

Rebrand requirements:

- Mitos header/logo;
- Mitos typography/colors;
- visual continuity from Home;
- preserve current functional filtering;
- remove/hide marketplace/supplier concepts when incompatible with Mitos single-brand presentation;
- maintain real location/date state passed from `SearchForm`;
- no reset of search context during handoff.

Customer perception target:

```text
I searched on Mitos Home
→ I am still in Mitos
→ now I am seeing real rental options
```

Not:

```text
Mitos marketing page
→ suddenly BookCars marketplace
```

---

# 6. Checkout / booking continuity

Rebrand shell should eventually continue through:

```text
/search
→ /checkout
→ /checkout-session/:sessionId when applicable
→ /booking or /bookings
```

Functional semantics are outside Landing DESIGN and must not be casually changed during rebrand.

The rebrand may alter:
- brand/logo;
- visual tokens;
- explanatory copy;
- layout polish where regression-safe.

It must not alter without separate design/architecture:
- price calculation;
- payment state;
- reservation state;
- availability logic;
- booking lifecycle.

---

# 7. Mobile contract

## Home

Order:

```text
Header
Hero message
Primary search CTA / compact search
Vehicle visual
Search panel/bottom sheet
Why Mitos
Featured vehicles horizontal rail
How it works
Travel banner
Promotion
FAQ
Final CTA
Footer
```

Agent launcher:
- must not cover primary search controls;
- minimum 16px safe gap from viewport edges;
- avoid conflict with browser bottom navigation / sticky CTA.

## Search

Filters may use existing responsive patterns but require Mitos visual consistency.

---

# 8. Motion contract

Use motion to reinforce travel and premium clarity:

```text
soft entrance
vehicle parallax only if performant
card hover elevation
short CTA feedback
horizontal vehicle rails
```

Avoid:

```text
constant animation
heavy 3D
scroll-jacking
motion that delays search
```

Search should remain immediately usable.

---

# 9. Accessibility contract

- search fields retain labels and validation;
- no vehicle information only through imagery;
- Agent launcher keyboard accessible;
- reduced-motion respected;
- contrast checked against final Mitos tokens;
- CTAs use action-specific labels (`Buscar auto`, `Hablar con Mitos`) rather than generic `Continuar`;
- mobile touch targets >= practical accessible size.

---

# 10. What happens to the current Home

Current `Home.tsx` contains useful functional pieces but should not dictate the new composition.

### Preserve/reuse

```text
SearchForm
location data access where needed
existing rental navigation
existing result handoff
FAQ data/component if truth-safe
```

### Replace/reconsider

```text
cover video / brown overlay
BookCars generic hero copy
Why/Services generic claims
supplier showcase if irrelevant
international destination presentation unless real
hardcoded Mini/Midi/Maxi price demo
Gallo map marker
old visual hierarchy
```

---

# 11. Surface ownership summary

| Surface | Owns | Must not own |
|---|---|---|
| Mitos Home | brand, content, editorial promotions, entry points | availability, booking state |
| SearchForm | rental query input | reservation |
| Agent | conversation, guidance, intent extraction | price/availability truth, booking state |
| `/search` | real rental discovery/results | CRM relationship authority |
| Checkout | transactional capture/payment orchestration | marketing truth |
| Booking | reservation/rental state projection | Landing editorial content |
| WhatsApp | human-assisted external contact | system-of-record state by itself |

---

# 12. Implementation slices implied by this design

```text
R2  Brand Foundation                     ✅
D1  Interaction & Surface Design          ✅

B1  Mitos identity shell                  NEXT AFTER PLAN
B2  New Mitos Home composition
B3  SearchForm visual integration
B4  /search continuity rebrand
B5  footer/legal/social cleanup
B6  responsive polish
B7  Agent launcher seam (no runtime AI yet)
B8  QA / regression

AGENT RUNTIME                             LATER
CRM CONNECT                               LATER
```

No build step is authorized by this document alone unless the project owner explicitly advances the gate.

---

# 13. Design gate

```text
MITOS BRAND FOUNDATION               ✅ v0.1
MITOS PUBLIC EXPERIENCE CONTRACT     ✅ v0.1
MITOS INTERACTION / SURFACE DESIGN   ✅ v0.1

IMPLEMENTATION PLAN                  ← NEXT
PUBLIC REBRAND BUILD                 🔒 until plan/gate
AGENT IMPLEMENTATION                 🔒 later
CRM CONNECT                          🔒 later
```
