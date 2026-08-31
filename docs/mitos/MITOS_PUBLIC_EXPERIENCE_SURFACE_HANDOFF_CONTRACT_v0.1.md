# Mitos Public Experience — Surface & Handoff Contract v0.1

**Status:** DESIGN / ARCH CONTRACT FROZEN FOR IMPLEMENTATION PLANNING  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`  
**Base:** `developer`

## 1. Decision

The public Mitos experience is **one customer journey** composed of three capabilities:

```text
MITOS LANDING
+ OPTIONAL MITOS AGENT
+ RENT A CAR TRANSACTIONAL FUNNEL
```

The customer must not experience these as three unrelated products.

Target public shape:

```text
www.mitosrentacar.com
        │
        ▼
┌──────────────────────────────────────┐
│            MITOS LANDING             │
│                                      │
│ Brand                                │
│ Why Mitos                            │
│ Vehicles                             │
│ Promotions                           │
│ Travel / trust                       │
│                                      │
│ ┌──────────────┐  ┌───────────────┐ │
│ │ Buscar auto  │  │ Hablar con AI │ │
│ └──────┬───────┘  └───────┬───────┘ │
└────────┼────────────────────┼─────────┘
         │                    │
         ▼                    ▼
   RENT A CAR SEARCH       MITOS AGENT
         │                    │
         │              understands intent
         │                    │
         │             ┌──────┴───────┐
         │             │              │
         │             ▼              ▼
         │         FAQ / help    rental intent
         │                            │
         └────────────────────────────┤
                                      ▼
                                 RENT A CAR
                                 availability
                                 vehicle
                                 reservation
                                 checkout
```

## 2. Public UX rule

Externally:

> One Mitos experience.

Internally:

> Shared responsibility, singular authority.

The Landing, Agent and Rent A Car funnel may cooperate, but they do not own the same truths.

## 3. Surface responsibilities

### 3.1 Mitos Landing owns presentation

The Landing owns:

```text
brand
public copy
media
why Mitos
featured vehicle presentation
travel / mobility narrative
promotion presentation
FAQ presentation
CTA placement
section composition
```

The Landing does **not** own:

```text
live availability
reservation state
rental price authority
rental policy authority
booking lifecycle
payment result
vehicle assignment
```

### 3.2 Mitos Agent owns conversation and guidance

The Agent may:

```text
answer supported public questions
explain Mitos and rental concepts
gather rental intent
interpret dates / trip needs / vehicle preferences
help compare options after authoritative data is returned
hand off structured intent to Rent A Car
```

The Agent must not independently own or invent:

```text
availability
current price
reservation confirmation
payment status
vehicle assignment
booking lifecycle state
```

Example:

```text
USER
"Necesito una camioneta desde el viernes hasta el domingo"

AGENT
        ↓ interprets
RentalSearchIntent
- preferred class: SUV
- from: Friday
- to: Sunday
        ↓ hands off
RENT A CAR SEARCH
        ↓ owns
real results / availability
```

### 3.3 Rent A Car owns transactional rental truth

Rent A Car remains authority for:

```text
locations
date/time rental constraints
vehicle catalog used operationally
availability
search results
commercial rental values when authoritative
reservation
checkout
booking status
rental lifecycle
```

## 4. Customer paths

The Agent is **optional**, never a mandatory funnel step.

### Path A — customer already knows what they need

```text
MITOS LANDING
   ↓
Buscar vehículo
   ↓
Rent A Car Search
   ↓
Results
   ↓
Checkout
   ↓
Booking
```

### Path B — customer needs guidance

```text
MITOS LANDING
   ↓
Hablar con Mitos
   ↓
Agent
   ↓
FAQ / recommendation / intent capture
   ↓
structured handoff
   ↓
Rent A Car Search / selected context
```

### Path C — human fallback

```text
MITOS LANDING / AGENT
   ↓
WhatsApp
   ↓
+51 941 368 086
```

## 5. Agent visibility policy

Recommended visibility:

```text
Landing             FULL
Search results      AVAILABLE
Vehicle detail      AVAILABLE
Checkout            LIMITED / contextual help
Payment-sensitive   MINIMAL or OFF
Confirmation        OPTIONAL
```

The Agent must never visually compete with the transactional CTA on payment/confirmation steps.

## 6. Search integration rule

The existing rental search capability should be reused rather than rebuilt inside a second landing application.

The Mitos public home may embed/recompose the existing search interaction, but the search continues into the existing rental funnel.

Target URL experience:

```text
/                  Mitos public home / landing + search entry
/search            real rental search/results
/checkout          rental checkout
/booking           booking detail/state
/bookings          customer bookings
```

The exact current route set remains implementation evidence; no route should be removed solely for rebrand without explicit migration analysis.

## 7. Agent → Rent A Car handoff contract

Conceptual handoff object:

```text
RentalSearchIntent

source
interactionSessionId?
pickupLocationId?
dropOffLocationId?
from?
to?
preferredRanges[]?
preferredSpecs?
partySize?
tripContext?
notes?
```

Rules:

```text
intent ≠ availability
intent ≠ quote
intent ≠ reservation
```

Rent A Car validates/normalizes any intent before using it transactionally.

## 8. Future CRM seam

CRM is not required to query availability.

Future relationship seam:

```text
anonymous / persistent visitor
        ↓
interaction becomes actionable
        ↓
identity/contact resolution
        ├──→ CRM — Mitos commercial relationship
        └──→ Rent A Car reservation context
```

Frozen rule:

> Availability does not need to pass through CRM.

## 9. Rebrand scope boundary

The first rebrand cycle targets the **public rental frontend experience**.

In scope:

```text
public Mitos branding
Home replacement / redesign
header/footer public identity
landing sections
existing rental search entry
public-facing copy cleanup
public asset replacement
Agent mount seam / placeholder contract
```

Not automatically in scope:

```text
backend domain rewrite
Admin redesign
LaborSync redesign
Mobile redesign
rental-state schema rewrite
payment-provider migration
CRM physical integration
Agent backend implementation
```

Those require separate gates.

## 10. Public brand truth available

Recovered Mitos public identity:

```text
MITOS RENT A CAR
Instagram: @mitosrentacar
Tagline: Alquila fácil, viaja seguro.
Publicized web: www.mitosrentacar.com
Phone / WhatsApp: +51 941 368 086
Market: Lima / Perú
```

Visual direction:

```text
blue / deep blue
white
black support
vehicle-led imagery
road / city / travel
freedom / mobility
simple rental action
```

Historical promotional pricing must not be treated as permanent current price authority.

## 11. Primary product decision

Reject:

```text
Mitos marketing site
    ↓ external jump
BookCars generic site
    ↓
transaction
```

Prefer:

```text
MITOS PUBLIC HOME
brand + persuasion + search + optional agent
    ↓
SAME RENTAL EXPERIENCE
/search → checkout → booking
```

The customer should feel that the booking funnel is a continuation of Mitos, not a handoff to another brand.

## 12. Gate

```text
MITOS RECOVERY                         ✅
MITOS PUBLIC BRAND TRUTH               ✅ sufficient for design
PUBLIC EXPERIENCE MODEL                ✅ FROZEN v0.1
LANDING / AGENT / RENTAL AUTHORITY     ✅ FROZEN v0.1
REBRAND IMPLEMENTATION PLAN            ← NEXT
PUBLIC FRONTEND BUILD                   🔒 until plan slice selected
AGENT IMPLEMENTATION                    🔒 separate later slice
CRM CONNECT                             🔒 later
```
