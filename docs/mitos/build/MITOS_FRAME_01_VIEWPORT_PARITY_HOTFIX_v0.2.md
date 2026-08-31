# Mitos FRAME 01 — Viewport Parity Hotfix v0.2

**Status:** IMPLEMENTED / LOCAL VISUAL QA REQUIRED  
**Branch:** `feature/mitos-public-experience-v1`  
**Supersedes:** none; extends `MITOS_FRAME_01_PARITY_HOTFIX_v0.1.md`

## Trigger

Local visual QA showed two parity defects:

1. the extracted Mitos logo reference retained a dark-blue rectangle that was visibly darker than the navbar;
2. the landing section rhythm used full `100svh` sections below a sticky header, violating the Ink-VK rule `one frame = one section` because the effective viewport height was exceeded.

## Corrections

### Navbar / logo continuity

The navbar now uses the same recovered navy value as the logo reference background:

```text
#012063
```

This removes the visible rectangular brand patch without rewriting or fabricating a new logo asset.

### One frame = one section

For desktop/tablet presentation frames after FRAME 01:

```text
frame height = 100svh - active Mitos header height
```

Header height is expressed centrally through:

```text
--mitos-header-height
```

The current desktop header is 110px, with responsive reductions at narrower breakpoints.

Each public frame therefore owns the visible surface below the sticky header instead of extending another full viewport underneath it.

Mobile intentionally returns to natural document height because forced viewport framing would harm legibility and interaction.

## FRAME 01 interpretation

FRAME 01 remains one composed public section containing:

```text
hero
+ real rental search seam
+ trust strip
+ storytelling
```

These are not separate landing sections. They jointly form the approved first narrative frame.

## Authority protection

No changes were made to:

```text
SearchForm business behavior
/search router contract
availability
pricing
checkout
payment
booking lifecycle
backend rental authority
Agent runtime
CRM
```

## Gate

```text
FRAME 01 source composition     ✅
Logo/navbar continuity          ✅ source implemented
One-frame section law           ✅ source implemented
Desktop runtime parity          ← QA REQUIRED
Mobile parity                   🔒 later
FRAME 02+ visual work           🔒 until FRAME 01 acceptance
```
