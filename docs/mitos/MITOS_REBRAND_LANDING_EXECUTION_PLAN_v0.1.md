# Mitos Rebrand + Landing — Execution Plan v0.1

**Status:** PLAN DRAFT / BUILD NOT STARTED  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`  
**Base:** `developer`

## Goal

Evolve the existing public Rent A Car frontend into a coherent Mitos-branded public rental experience without duplicating the transactional funnel.

Target:

```text
Mitos Landing + optional Agent + existing Rent A Car funnel
```

The first implementation cycle should improve the public shell while preserving rental behavior.

## Slice R1 — Public identity inventory

Audit and classify every public-facing generic/Gallo/BookCars identity occurrence in:

```text
frontend/src/pages/Home.tsx
frontend/src/components/Layout*
frontend/src/components/Header*
frontend/src/components/Footer*
frontend/src/config/env.config.ts
frontend/src/lang/*
frontend/src/assets/*
frontend/src/assets/css/*
```

Output:

```text
KEEP
REBRAND
REMOVE GENERIC CLAIM
VERIFY BEFORE CLAIM
```

Gate: no transactional behavior changed.

## Slice R2 — Mitos brand foundation

Introduce a small public brand contract for:

```text
name: MITOS RENT A CAR
tagline: Alquila fácil, viaja seguro.
phone/WhatsApp: +51 941 368 086
publicized domain: www.mitosrentacar.com
Instagram: @mitosrentacar
visual direction: blue / deep-blue / white / black support
```

Do not hardcode historical promotional prices as permanent pricing truth.

Prefer one brand source rather than scattering Mitos strings across components.

## Slice R3 — Replace generic Home with Mitos Landing

Home becomes the first Mitos public surface.

Candidate section order:

```text
1. Hero + rental search
2. Why Mitos
3. Featured vehicles
4. How renting works
5. Travel / mobility story
6. Promotion slot
7. FAQ / trust
8. WhatsApp / reservation CTA
9. Footer
```

The exact visual architecture is subject to Interaction/Surface Design before final implementation.

## Slice R4 — Preserve real rental search

Reuse the current search contract rather than creating a fake second search.

Home search must continue to the existing `/search` journey with the current validated payload shape:

```text
pickupLocationId
dropOffLocationId
from
to
ranges? / other supported filters
```

Acceptance:

```text
Landing can change radically
Search behavior cannot regress
```

## Slice R5 — Funnel continuity rebrand

After the new Home is stable, inspect the transactional surfaces for continuity:

```text
/search
vehicle/result components
/checkout
/booking
/bookings
sign-in/up when encountered
```

Goal:

```text
user should not feel they left Mitos
```

This does not require rewriting every Admin/Mobile/Internal surface in the first cycle.

## Slice R6 — Agent mount seam

Prepare the frontend for an optional Mitos Agent without implementing Agent authority inside the rental app.

Expected seam:

```text
<MitosAgentLauncher context={...} />
```

Initial allowed context candidates:

```text
current route
public brand context
current search intent when known
selected vehicle when known
```

The Agent service itself remains a separate later slice.

## Slice R7 — Agent handoff

Later, when Agent is implemented:

```text
conversation
   ↓
RentalSearchIntent
   ↓
existing Rent A Car search
```

No Agent-owned availability/reservation state.

## Slice R8 — Responsive / visual QA

Verify:

```text
desktop
tablet
mobile
hero/search hierarchy
navigation
vehicle media
promotion cards
FAQ
WhatsApp CTA
Agent launcher placement
```

## Slice R9 — Transactional regression QA

Mandatory regression areas:

```text
search payload/navigation
vehicle results
filters
checkout
booking creation
booking detail/history
auth/session paths used by checkout
```

Rebrand acceptance must never be inferred from visual QA alone.

## Build order recommendation

```text
R1 identity audit
    ↓
R2 brand foundation
    ↓
Interaction & Surface Design freeze
    ↓
R3 Mitos Home
    ↓
R4 search continuity
    ↓
R5 funnel continuity
    ↓
R8 visual QA
    ↓
R9 transactional regression
    ↓
Agent seam / implementation later
```

## Non-goals for first rebrand cycle

```text
new rental backend
new booking engine
new checkout authority
Admin full rebrand
LaborSync rebrand
Mobile full rebrand
CRM connection
AI agent backend
Gallo↔Mitos handover implementation
```

## Current gate

```text
BRANCH                            ✅
SURFACE & HANDOFF CONTRACT        ✅
REBRAND EXECUTION PLAN            ✅ DRAFT
IDENTITY INVENTORY                ← NEXT
INTERACTION / SURFACE DESIGN      ← NEXT
PUBLIC REBRAND BUILD              ⛔
AGENT BUILD                        🔒 later
```
