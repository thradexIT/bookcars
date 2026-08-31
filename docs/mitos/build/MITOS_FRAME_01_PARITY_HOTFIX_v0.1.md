# Mitos Public Experience — FRAME 01 Parity Hotfix v0.1

**Branch:** `feature/mitos-public-experience-v1`  
**Mode:** Ink-VK / FRAME LOCK  
**Status:** SOURCE IMPLEMENTED — LOCAL VISUAL QA REQUIRED

## Source authority

The approved Mitos hero frame supplied in the working conversation is the visual authority for Frame 01.

Acceptance is no longer "same direction" or "inspired by". The desktop first frame must preserve the approved composition:

```text
MITOS NAVY HEADER
        ↓
HERO STORY LEFT + COASTAL/YARIS VISUAL RIGHT
        ↓
REAL RENTAL SEARCH CARD
        ↓
FOUR TRUST ITEMS
        ↓
CENTERED STORYTELLING + TWO CTAs
        ↓
BLUE CURVE / WAVE
```

## Changes

- Added `frontend/src/assets/img/mitos-header-logo-reference.svg` from the approved frame.
- Added `frontend/src/assets/img/mitos-hero-yaris-reference.svg` from the approved frame.
- Rebuilt `mitos-header.css` around the approved header proportions and navy treatment.
- Rebuilt `mitos-home.css` around the approved Frame 01 geometry.
- Updated `MitosHome.tsx` with exact approved hero/search/trust/story order.
- Added a non-interactive visual search fallback that appears only while the real `SearchForm` is not mounted. CSS `:has(.home-search-form)` automatically hides the fallback when the real Rent A Car form becomes available.
- The real `SearchForm` remains the transaction entry and is restyled only from the Mitos surface layer.

## Authority protection

No changes to:

```text
/search receiving contract
availability calculation
rental pricing authority
checkout
payment
booking lifecycle
backend rental domain
Admin
LaborSync
CRM
Agent runtime
```

## Gate

```text
FRAME 01 SOURCE PARITY IMPLEMENTATION   ✅
LOCAL DESKTOP VISUAL QA                 ← NEXT
REAL SearchForm RENDER/PARITY           ← NEXT
MOBILE PARITY                           🔒 after desktop
FRAME 02+ VISUAL PARITY                 🔒 after Frame 01 acceptance
```

> SOURCE IMPLEMENTED ≠ VISUALLY ACCEPTED. Frame 01 remains open until side-by-side local review passes.
