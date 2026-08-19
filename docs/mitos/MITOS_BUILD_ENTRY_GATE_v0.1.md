# Mitos Public Experience — Build Entry Gate v0.1

**Status:** FROZEN / DOCUMENTATION ONLY / RUNTIME UNTOUCHED  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`  
**Base:** `developer`  
**PR:** #3 — Draft

---

## 0. Purpose

This gate defines the exact conditions that must be true before the Mitos public rebrand is allowed to modify runtime code.

Planning is already closed. This document does not reopen Recovery, Design or Plan. It establishes the controlled handoff from PLAN into BUILD.

```text
RECOVERY   ✅
DESIGN     ✅
ARCH / HANDOFF CONTRACT ✅
PLAN       ✅
BUILD      ⛔ until I0 baseline evidence is captured
```

---

## 1. Frozen target

The build target remains one coherent public experience:

```text
www.mitosrentacar.com
        ↓
/
MITOS HOME
brand + persuasion + real SearchForm + optional Agent entry
        ↓
/search
        ↓
/checkout
        ↓
/booking / /bookings
```

The rebrand must not create a second rental application or a second booking authority.

---

## 2. Frozen ownership before BUILD

```text
Landing
→ presentation / persuasion / editorial content

Agent
→ conversation / guidance / intent

Rent A Car
→ locations / availability / price / vehicle / reservation / checkout / booking

CRM
→ commercial relationship later
```

Rule:

> Shared responsibility, singular authority.

BUILD may integrate surfaces, but it may not collapse these authorities.

---

## 3. Entry conditions

Runtime edits are permitted only after all conditions below are satisfied.

### G1 — Source branch integrity

```text
working branch = feature/mitos-public-experience-v1
base = developer
PR #3 remains Draft
```

No Mitos build work should be performed directly on `developer`.

### G2 — Documentation set exists

Required frozen artifacts:

```text
MITOS_PUBLIC_EXPERIENCE_SURFACE_HANDOFF_CONTRACT_v0.1.md
MITOS_PUBLIC_IDENTITY_INVENTORY_v0.1.md
MITOS_BRAND_FOUNDATION_v0.1.md
MITOS_INTERACTION_SURFACE_DESIGN_v0.1.md
MITOS_PUBLIC_EXPERIENCE_IMPLEMENTATION_PLAN_v0.1.md
MITOS_BUILD_ENTRY_GATE_v0.1.md
MITOS_I0_BASELINE_EVIDENCE_PROTOCOL_v0.1.md
MITOS_I1_BRAND_FOUNDATION_RUNTIME_SPEC_v0.1.md
```

### G3 — I0 baseline exists

Before the first runtime commit, record:

```text
branch/head SHA
frontend install command
frontend dev command
lint command
build command
current route registration
current / screenshot
current /search screenshot
known warnings/errors
SearchForm continuity evidence
```

### G4 — No unresolved authority conflict

BUILD must not begin if implementation requires any of the following without explicit redesign:

```text
new availability authority
new booking authority
new price authority
Agent-owned rental state
Landing-owned reservation state
CRM in front of availability search
```

### G5 — Rollback path exists

Each implementation slice must be independently reversible.

A visual improvement that requires rewriting rental-domain logic fails this gate.

---

## 4. First allowed runtime slice

After I0 passes, the first allowed source change is:

```text
I1 — Runtime Mitos Brand Foundation
```

I1 may introduce:

```text
central Mitos public brand configuration
semantic theme/CSS tokens
brand asset references
safe deployment identity defaults
```

I1 may not alter:

```text
SearchForm payload
/search behavior
availability
prices
checkout/payment semantics
booking lifecycle
backend rental logic
Admin
LaborSync
Agent runtime
CRM
```

---

## 5. Stop conditions during BUILD

Stop the active slice and investigate if any of these occur:

```text
/search receives a different payload unexpectedly
existing search navigation breaks
availability behavior changes
price changes without catalog/business cause
checkout no longer follows existing state
booking creation/detail/history regresses
auth/session regression appears
visual rebrand requires domain-model mutation
Agent seam starts owning transactional state
```

Do not hide these regressions behind visual acceptance.

---

## 6. Promotion law

```text
SOURCE IMPLEMENTED
≠ RUNTIME VERIFIED
≠ VISUALLY ACCEPTED
≠ TRANSACTIONALLY VERIFIED
≠ MERGE READY
```

A slice advances only when its own evidence gate closes.

PR #3 remains Draft until I10.

---

## 7. Gate state

```text
BUILD ENTRY DOCUMENTATION        ✅
RUNTIME CHANGES                  ⛔ NOT YET
I0 BASELINE                      ← NEXT EXECUTION
I1 BRAND FOUNDATION RUNTIME      🔒 after I0
HOME REPLACEMENT                 🔒 after I1/I2
AGENT RUNTIME                    🔒 later
CRM                              🔒 later
```

This document authorizes no code by itself; it defines when controlled code may begin.
