# Mitos Public Experience — Implementation Plan v0.1

**Status:** PLAN FROZEN / BUILD READY AFTER EXPLICIT START  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`  
**Base:** `developer`  
**PR:** #3 — Draft

---

## 0. Purpose

This plan converts the frozen Mitos public experience design into small, reversible and verifiable implementation slices.

It does **not** authorize uncontrolled coding across the rental stack.

The target remains:

```text
ONE PUBLIC MITOS EXPERIENCE

Mitos Home / Landing
        +
Optional Mitos Agent
        +
Existing Rent A Car transactional funnel
```

Externally the customer should feel one coherent Mitos website.

Internally:

> Shared responsibility, singular authority.

---

# 1. Non-negotiable implementation laws

## 1.1 Do not duplicate rental authority

```text
Landing      → presentation
Agent        → conversation / guidance / intent
Rent A Car   → availability / price / reservation / checkout / booking
```

No new Home component may become an availability or booking source of truth.

## 1.2 Preserve the existing transactional funnel

The current route continuity remains:

```text
/                  Mitos Home
/search            rental search/results
/checkout          rental checkout
/checkout-session  payment/checkout continuation
/booking           booking detail/state
/bookings          booking history
```

Rebrand may alter presentation and navigation, but it must not silently replace these authorities.

## 1.3 Existing SearchForm is functional infrastructure

The Mitos Home search must reuse the current rental search contract.

Do not create a decorative second search form that diverges from the real one.

## 1.4 Truth-safe public copy only

Never migrate generic BookCars claims into Mitos simply because they already exist in localization files.

Do not publish unverified:

```text
24/7 support
unlimited mileage
no hidden charges
instant confirmation
airport service
permanent promotional prices
current availability
insurance terms
fees/deposits
```

## 1.5 Rebrand does not imply business-policy change

Visual identity changes must not mutate:

```text
availability rules
pricing algorithms
booking lifecycle
payment behavior
checkout semantics
vehicle assignment
check-in/check-out operations
```

---

# 2. Scope boundary

## 2.1 In scope for this implementation cycle

```text
frontend public brand foundation
public Header / Footer
Home / Landing replacement
existing SearchForm placement + styling
Why Mitos presentation
featured-vehicle presentation
How renting works
travel / mobility editorial section
promotion slot
FAQ / trust presentation
WhatsApp conversion path
Agent launcher seam / non-functional integration point
/search visual continuity
checkout/booking shell continuity where required
responsive and accessibility polish
regression QA
```

## 2.2 Explicitly out of scope

```text
new rental backend
new reservation engine
new availability engine
new payment authority
CRM integration
AI Agent backend/runtime
Agent-owned availability
Agent-owned reservation
Gallo ↔ Mitos operational handover
Admin full rebrand
LaborSync full rebrand
Mobile application full rebrand
commercial-policy invention
```

---

# 3. Pre-build baseline gate — I0

Before runtime edits begin, record the baseline from `developer` / current feature branch.

## Verify

```text
frontend starts locally
/ renders
/search renders
SearchForm can produce the existing search navigation contract
/checkout route resolves through the current application
/booking and /bookings routes remain registered
current auth/session behavior is not intentionally changed
```

## Evidence

Capture:

```text
branch SHA
frontend install/build command
lint command
current route list
known pre-existing warnings/errors
screenshots of current / and /search
```

## Gate

```text
I0 BASELINE RECORDED → required before I1
```

No regression discovered later may be attributed to the rebrand without comparison to this baseline.

---

# 4. Slice I1 — Runtime Mitos Brand Foundation

## Objective

Create one public brand source and semantic styling contract before replacing components.

## Expected implementation

Introduce a small centralized Mitos public configuration/module containing at least:

```text
name                 MITOS RENT A CAR
tagline              Alquila fácil, viaja seguro.
phoneWhatsapp        +51 941 368 086
instagramHandle      @mitosrentacar
publicizedDomain     www.mitosrentacar.com
market               Lima / Perú
```

Introduce semantic visual variables/tokens:

```text
--mitos-blue-primary
--mitos-blue-deep
--mitos-blue-soft
--mitos-white
--mitos-ink
--mitos-muted
```

Exact numeric color values remain replaceable until official source tokens are recovered.

## Candidate files

```text
frontend/src/config/*
frontend/src/theme/* or equivalent new public brand module
frontend/src/assets/css/* shared token location
frontend/.env.example if public deployment identity requires it
```

## Do not change

```text
backend
booking model
car model
payment controller/service semantics
SearchForm payload contract
```

## Acceptance

```text
one brand source exists
components do not need scattered hardcoded Mitos strings
BookCars fallback cannot accidentally become production Mitos identity
no transactional regression
```

## Gate

```text
I1 BRAND SOURCE ✅
```

---

# 5. Slice I2 — Global Public Shell: Header + Footer

## Objective

Make all public/transactional routes visibly belong to Mitos before replacing Home.

## Header

Implement:

```text
Mitos brand/logo treatment
public navigation hierarchy
Buscar auto CTA
Mis reservas access where relevant
Hablar con Mitos launcher seam
preserve auth/account behavior
```

Review language/currency selectors for Mitos public hierarchy without deleting capabilities unless explicitly decided.

Supplier navigation should not surface publicly if Mitos is operating as a direct brand experience.

## Footer

Replace generic footer identity with:

```text
MITOS RENT A CAR
Alquila fácil, viaja seguro.
+51 941 368 086
@mitosrentacar
www.mitosrentacar.com
legal/support links that remain valid
```

Remove or hide unverified generic social destinations.

Do not display a payment-provider logo as a public commercial claim unless runtime configuration makes it truthful and useful.

## Candidate files

```text
frontend/src/components/Header.tsx
frontend/src/components/Footer.tsx
frontend/src/assets/css/header.css
frontend/src/assets/css/footer.css
frontend/src/lang/header.ts
frontend/src/lang/footer.ts
```

## Acceptance

Verify on:

```text
/
/search
/checkout
/booking
/bookings
sign-in / sign-up
```

The customer must not see a sudden BookCars identity transition.

## Gate

```text
I2 GLOBAL SHELL ✅
```

---

# 6. Slice I3 — Replace `/` with Mitos Home Skeleton

## Objective

Replace the generic BookCars/Gallo-demo Home structure with the frozen Mitos public surface while initially keeping complex content minimal.

## Frozen section order

```text
M01 Header                 [global shell]
M02 Hero + real search
M03 Why Mitos
M04 Featured vehicles
M05 How renting works
M06 Travel / mobility
M07 Promotion slot
M08 Trust / FAQ
M09 Conversion CTA
M10 Footer                 [global shell]
```

## Remove from old Home authority

```text
generic cover/video if not appropriate to Mitos
generic BookCars claims
hardcoded Mini/Midi/Maxi demo prices
Gallo map marker
supplier-marketplace presentation not compatible with direct Mitos brand
old six-card service grid when it carries unsupported claims
```

## Preserve useful capability where intentionally retained

```text
SearchForm
location data where used by SearchForm
FAQ component capability if suitable
map/location capability only if it earns a truth-safe Mitos role
```

## Candidate files

```text
frontend/src/pages/Home.tsx
frontend/src/assets/css/home.css
frontend/src/lang/home.ts
new frontend/src/components/mitos/* where decomposition is useful
```

## Acceptance

```text
Home reads unmistakably as Mitos
no visible BookCars/Gallo identity
no demo prices
no unsupported generic claims
search capability not yet regressed
```

## Gate

```text
I3 HOME SKELETON ✅
```

---

# 7. Slice I4 — Real SearchForm Integration

## Objective

Make the rental search the real transactional entry inside the new Mitos Hero.

## Functional contract to preserve

Current supported search navigation/context includes at least:

```text
pickupLocationId
dropOffLocationId
from
to
ranges? / supported search filters
```

## Desktop

Search should be immediately discoverable in or directly attached to the Hero.

## Mobile

Search may use a compact panel, drawer or bottom-sheet treatment only if it preserves the same real SearchForm behavior.

## CTA hierarchy

```text
Primary       Buscar auto
Secondary     Hablar con Mitos
Fallback      WhatsApp
```

`Buscar auto` must never be replaced by an Agent-only funnel.

## Acceptance scenarios

```text
same pickup + dropoff
separate pickup + dropoff
valid from/to
invalid/missing values use existing validation
search submission reaches /search
back navigation remains coherent
mobile search remains usable
```

## Regression rule

If Mitos styling conflicts with SearchForm internals, adapt the presentation wrapper before modifying rental semantics.

## Gate

```text
I4 SEARCH CONTINUITY ✅
```

---

# 8. Slice I5 — Truth-Safe Home Content Modules

## Objective

Populate the Mitos Home with persuasion without inventing business truth.

### Why Mitos

Initial safe directions:

```text
Reserva simple
Movilidad para tu plan
Atención rápida
Viaja con confianza
```

### Featured vehicles

Evidence-backed references may include:

```text
Toyota Yaris 2025/26
Toyota Raize
```

But featured presentation must not imply live availability.

### How renting works

```text
1. Busca tu vehículo
2. Elige la opción que mejor encaje
3. Completa tu reserva
4. Recibe tu confirmación
```

The wording must be adjusted if runtime semantics do not support an immediate-confirmation claim.

### Travel / mobility

Use brand storytelling around:

```text
movement
city
road
trip
freedom
comfort
```

### Promotion slot

Create an editorial promotion slot that can show campaigns without making them permanent catalog truth.

Historic campaign examples may inform design, but prices such as `$35/day` must not become permanent defaults.

### FAQ / Trust

Use truth-safe answers and explicit contact fallback for policy-sensitive items.

### WhatsApp

Use verified public number:

```text
+51 941 368 086
```

## Acceptance

Every visible commercial claim must trace to:

```text
recovered Mitos public evidence
OR
current Rent A Car authoritative data
OR
explicitly non-transactional editorial language
```

## Gate

```text
I5 CONTENT TRUTH ✅
```

---

# 9. Slice I6 — Optional Agent Mount Seam

## Objective

Prepare the UI so the Agent can be added without redesigning Home later.

This slice does **not** implement the AI Agent backend.

## UI seam

Expected public abstraction:

```text
<MitosAgentLauncher context={...} />
```

or equivalent decoupled component.

## Allowed initial context

```text
current route
Mitos public brand context
known SearchForm intent if already entered
selected vehicle context when authoritative and available
```

## Visibility

```text
/                  full launcher
/search            contextual launcher
vehicle/detail     contextual launcher if route exists
/checkout          limited or hidden
payment-sensitive  off
confirmation       optional
```

## Pre-Agent behavior

Before Agent runtime exists:

- do not simulate an AI conversation;
- launcher may be hidden behind a feature flag;
- or CTA may fall back to WhatsApp;
- architecture must make later Agent insertion local and reversible.

## Gate

```text
I6 AGENT SEAM ✅
AGENT RUNTIME remains 🔒
```

---

# 10. Slice I7 — Funnel Continuity Rebrand

## Objective

Ensure the user does not visually leave Mitos after searching.

Review public transactional surfaces:

```text
/search
vehicle result/card components
/checkout
/checkout-session/:sessionId
/booking
/bookings
sign-in / sign-up where part of the flow
```

## Allowed changes

```text
brand shell
spacing/typography consistency
navigation consistency
CTA language consistency
Mitos identity
surface tokens
```

## Avoid in this slice

```text
booking state-machine changes
price calculation changes
payment-provider logic changes
availability query changes
large internal component rewrites without necessity
```

## Gate

```text
I7 ONE-MITOS-CONTINUITY ✅
```

---

# 11. Slice I8 — Responsive + Accessibility Gate

## Required viewport groups

```text
desktop
small laptop/tablet landscape
tablet portrait
mobile
```

## Verify

```text
header hierarchy
Hero crop/media
SearchForm legibility
search form keyboard navigation
CTA hierarchy
vehicle cards
promotion slot
FAQ accordion
footer
Agent launcher seam
no horizontal overflow
no hidden transactional CTA
```

## Accessibility minimum

```text
semantic headings
keyboard reachable interactive elements
visible focus
meaningful labels
sufficient contrast
images with meaningful alt where appropriate
reduced-motion respect where motion is introduced
```

## Gate

```text
I8 RESPONSIVE/A11Y ✅
```

---

# 12. Slice I9 — Technical Regression Gate

Visual acceptance is insufficient.

## Static gates

Run the repository-appropriate frontend commands, expected to include:

```text
install / dependency resolution
lint
production build
```

Do not claim success until command output is observed.

## Functional regression matrix

At minimum verify:

```text
Home loads
SearchForm loads real locations/data
search navigates to /search
search results render
filters still operate
vehicle selection path works
checkout route works
booking creation path works where environment permits
booking detail/history render
auth/session path required by booking remains intact
language/currency behavior is not unintentionally broken
```

## Evidence

Record:

```text
command outputs
screenshots
runtime URLs
known environment limitations
which cases were manually verified
which cases could not be verified and why
```

## Gate

```text
I9 REGRESSION ✅
```

---

# 13. Slice I10 — Visual Acceptance + PR Promotion

## Product-owner visual gate

Review at least:

```text
Home desktop
Home mobile
Search results after Home search
Header/Footer continuity
featured vehicles
promotion slot
Agent/WhatsApp entry
checkout continuity sample
```

## Promotion law

```text
SOURCE IMPLEMENTED
≠ RUNTIME VERIFIED
≠ VISUALLY ACCEPTED
≠ TRANSACTIONALLY VERIFIED
≠ MERGE READY
```

PR #3 remains Draft until:

```text
I1–I9 completed
visual acceptance obtained
no critical rental regression open
truth audit passes
```

Only then:

```text
Draft PR → Ready for Review → merge decision
```

No automatic merge is authorized by this plan.

---

# 14. Build sequence

```text
I0  Baseline evidence
 ↓
I1  Mitos brand source/tokens
 ↓
I2  Header + Footer
 ↓
I3  Mitos Home skeleton
 ↓
I4  Real SearchForm integration
 ↓
I5  Truth-safe content modules
 ↓
I6  Agent mount seam
 ↓
I7  Transactional funnel visual continuity
 ↓
I8  Responsive + accessibility
 ↓
I9  Technical regression
 ↓
I10 Visual acceptance / PR promotion
```

The order intentionally puts search continuity before broader funnel polish.

---

# 15. Change containment strategy

Prefer additive/localized Mitos components over broad rewrites.

Recommended new component namespace:

```text
frontend/src/components/mitos/
```

Candidate decomposition:

```text
MitosBrand
MitosHero
MitosWhy
MitosFeaturedVehicles
MitosRentalSteps
MitosTravelStory
MitosPromotion
MitosTrustFaq
MitosConversionBand
MitosAgentLauncher
```

Existing transactional components should be reused rather than forked unless a specific presentation boundary requires a wrapper.

---

# 16. Rollback strategy

Each implementation slice should be committed independently when practical.

If a slice causes rental regression:

```text
revert current slice
preserve prior accepted slice
investigate outside the visual/rebrand path
```

Do not solve a Home styling problem by rewriting transactional state logic.

No historical source should be deleted merely because it is replaced visually; superseded implementation artifacts may be preserved through Git history and documented lineage.

---

# 17. Known blockers that do NOT block first BUILD

These remain open but should not prevent starting the public rebrand:

```text
exact source Mitos SVG/logo package
exact official brand hex values
full current fleet truth
current complete commercial price table
insurance/deposit/cancellation policy
Agent backend
CRM connection
```

Required behavior:

```text
use replaceable tokens
use truth-safe content
use authoritative Rent A Car data when transactionally required
omit unsupported policy claims
```

---

# 18. Stop conditions during BUILD

Stop the active slice and investigate if any of these occur:

```text
SearchForm payload changes unexpectedly
/search stops resolving current state
availability behavior changes due only to rebrand
checkout/payment behavior changes unintentionally
booking creation/status semantics change
old generic data is mistakenly presented as Mitos truth
Agent UI starts inventing transactional state
mobile loses the primary rental CTA
```

---

# 19. Implementation readiness matrix

| Area | State | Build consequence |
|---|---|---|
| Recovery v0.2 | ✅ | usable |
| Surface/Handoff Contract | ✅ FROZEN | mandatory boundary |
| Identity Inventory R1 | ✅ | targets known |
| Brand Foundation R2 | ✅ | presentation direction known |
| Interaction/Surface Design D1 | ✅ | Home composition known |
| Implementation Plan | ✅ v0.1 | slices/gates known |
| Exact logo source asset | 🟡 | replaceable placeholder/reference only |
| Exact brand hex values | 🟡 | semantic tokens required |
| Commercial operating truth | 🟡 | omit unsupported claims |
| Agent runtime | 🔒 | seam only |
| CRM | 🔒 | later |

---

# 20. Plan exit decision

This plan closes the documentation sequence required before controlled implementation of the Mitos public rebrand.

```text
RECOVERY                              ✅
PUBLIC BRAND TRUTH                    ✅ sufficient
SURFACE & HANDOFF CONTRACT            ✅
IDENTITY INVENTORY                    ✅
BRAND FOUNDATION                      ✅
INTERACTION / SURFACE DESIGN          ✅
IMPLEMENTATION PLAN                   ✅ v0.1

CONTROLLED PUBLIC REBRAND BUILD       ← NEXT, only when explicitly started
AGENT RUNTIME                         🔒 later
CRM CONNECT                           🔒 later
```

The first implementation action, when BUILD is explicitly authorized, is:

> **I0 — record baseline evidence, then I1 — create the centralized Mitos runtime brand source/tokens.**
