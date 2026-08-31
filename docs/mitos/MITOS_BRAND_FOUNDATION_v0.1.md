# Mitos — Brand Foundation v0.1

**Status:** DESIGN FROZEN ENOUGH FOR SURFACE DESIGN / EXACT ASSET TOKENS PARTIAL  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`  
**Source evidence:** Mitos Instagram screenshots supplied by project owner + Recovery Baseline v0.2

---

## 0. Purpose

This document converts recovered Mitos public evidence into a practical visual/content foundation for the public rental experience.

It does **not** claim that approximate design tokens are official brand guidelines. Exact source vector/logo and exact official color values remain open.

---

## 1. Public identity truth

Recovered public identity:

```text
Public name       MITOS RENT A CAR
Instagram         @mitosrentacar
Category          Alquiler de automóviles
Tagline           Alquila fácil, viaja seguro.
Publicized domain www.mitosrentacar.com
Phone / WhatsApp  +51 941 368 086
Market signal     Lima / Perú
Location signal   La Molina, Lima
```

The Mitos brand must be expressed independently from Gallo Workshop.

---

## 2. Brand territory

### Mitos should feel

```text
mobile
simple
confident
modern
free
safe
energetic
travel-oriented
commercial without looking cheap
```

### Mitos should not feel

```text
workshop
mechanical-service heavy
admin/backoffice
generic marketplace
budget-only rental
Gallo recolored
BookCars with a logo swap
```

---

## 3. Emotional distinction from Gallo

```text
GALLO
care / diagnosis / workshop / technical trust

MITOS
movement / freedom / route / convenience / travel confidence
```

The companies may share engineering infrastructure, but the public emotional language must remain distinct.

---

## 4. Core narrative

Primary brand line:

> **Alquila fácil, viaja seguro.**

Supporting narrative territory:

```text
Tu ruta, tu ritmo.
Muévete con libertad.
Encuentra el vehículo que acompaña tu plan.
Ciudad, escapada o viaje: empieza con una reserva simple.
```

These are design-copy directions, not all simultaneously required public copy.

---

## 5. Visual language recovered from Mitos social evidence

Observed recurring patterns:

- strong blue fields/backgrounds;
- deep-blue and bright-blue contrast;
- white typography;
- black used as support/vehicle contrast;
- stylized automobile silhouette in the logo;
- large vehicle photography/renders;
- promotional cards with bold price/CTA hierarchy;
- road, beach, city and travel imagery;
- large concise headlines;
- direct commercial calls to action.

### Design implication

The public website should feel vehicle-led and spatial, not text-heavy.

The vehicle/image is usually the dominant visual object; copy supports it.

---

## 6. Color system — provisional implementation contract

Exact official brand tokens are **not yet recovered**. Therefore implementation should use semantic variables and keep numeric values replaceable.

```text
--mitos-blue-primary      dominant bright/cobalt brand blue
--mitos-blue-deep         navigation / dark contrast / premium depth
--mitos-blue-soft         light supporting surface
--mitos-white             primary light surface/text on blue
--mitos-ink               primary dark text
--mitos-muted             secondary text
```

### Rule

Do not scatter raw blue values across components.

All rebrand work must consume semantic CSS/theme tokens so exact official values can be swapped once the source brand package is recovered.

### Current visual hierarchy

```text
PRIMARY     Mitos blue
SECONDARY   deep blue
SURFACE     white
TEXT        near-black / deep blue
ACCENT      lighter blue only
```

No Gallo yellow should be introduced simply because both brands belong to the same environment.

---

## 7. Logo contract

The recovered public logo consists of:

```text
stylized vehicle silhouette
MITOS
RENT A CAR
```

Required future assets:

```text
logo-primary.svg / transparent source
logo-white.svg
logo-dark.svg if needed
favicon / icon mark
```

Until source logo files are available, screenshots may be used as evidence/reference only, not as a permanent low-resolution production logo.

---

## 8. Typography direction

Exact public font family is not confirmed.

Design requirement:

```text
modern grotesk / sans-serif
clear numerical hierarchy
strong bold display headings
high legibility in search / transactional fields
```

Marketing type and transactional type must feel like one system.

Avoid decorative type that reduces clarity in rental search and checkout.

---

## 9. Imagery contract

### Preferred

```text
actual Mitos fleet photography when available
clean vehicle renders when source imagery is insufficient
road / city / beach / travel environments
wide compositions with vehicle motion or destination context
```

### Avoid

```text
repair-shop imagery
stock imagery unrelated to Peru/Mitos
random luxury vehicles not in fleet
fake vehicle availability
AI-generated fleet representation presented as actual inventory
```

A lifestyle image can be conceptual; a fleet/inventory card must project real catalog truth when connected.

---

## 10. Vehicle presentation

Recovered public evidence explicitly names:

```text
Toyota Yaris 2025/26
Toyota Raize
```

These may be used in design/prototype as evidence-backed featured examples.

They must not be presented as live available stock without Rent A Car authority.

Vehicle cards should prioritize:

```text
vehicle image
model
short use framing
truth-safe specs when verified
CTA → rental search / consult
```

---

## 11. Promotion presentation

Mitos social evidence shows promotion-led communication, including historical claims such as:

```text
desde USD 35/día
desde USD 45/día
```

Website rule:

```text
PROMOTION SLOT ≠ permanent price authority
```

A promotion module must support:

- campaign title;
- optional vehicle/model;
- `desde` price only when current/approved;
- validity/conditions text;
- CTA;
- easy removal/expiry.

Historical social pricing must not be hardcoded as evergreen rental price.

---

## 12. Voice

### Mitos voice

```text
direct
clear
optimistic
human
short sentences
movement-oriented
helpful rather than corporate
```

### Good

```text
Alquila fácil, viaja seguro.
Encuentra tu auto y sigue tu ruta.
¿No sabes cuál elegir? Te ayudamos.
```

### Avoid

```text
complex operational language
internal system terminology
unverified absolutes
"best price" / "always available" / "100% guaranteed" without authority
```

---

## 13. Agent personality boundary

The future Mitos Agent should feel like the same brand:

```text
helpful travel/rental guide
quick
concise
non-pushy
aware of Mitos public information
```

But the Agent must never become a source of commercial invention.

```text
Agent may explain / interpret / guide
Agent may create RentalSearchIntent
Agent may hand off to search
Agent may not invent availability
Agent may not invent price
Agent may not confirm reservation by itself
```

---

## 14. Conversion hierarchy

Mitos has two primary public intents:

```text
READY TO RENT
→ Buscar auto
→ Rent A Car Search

NEEDS HELP
→ Hablar con Mitos
→ Agent / WhatsApp
```

The website must not force the Agent between a ready customer and the rental funnel.

---

## 15. Trust hierarchy

Trust should be created through:

1. real Mitos identity;
2. clear rental search;
3. real vehicle imagery/data when available;
4. simple process explanation;
5. transparent, non-invented conditions;
6. direct WhatsApp/contact route;
7. coherent booking funnel.

Do not manufacture trust through fake metrics or unverifiable guarantees.

---

## 16. Brand gate

```text
Mitos public name / tagline       ✅
Mitos social visual direction     ✅
Mitos voice direction             ✅
Mitos conversion hierarchy        ✅
Mitos Agent tone boundary         ✅
Semantic color architecture       ✅
Exact official hex values         🟡 pending source assets
Source vector logo                🟡 pending
Full production image library     🟡 pending
```

This is sufficient to proceed to Interaction & Surface Design while keeping exact visual tokens replaceable.
