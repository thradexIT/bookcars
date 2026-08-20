# Mitos Public Experience — Frame System Clean Rebuild v0.3

Date: 2026-08-20
Branch: `feature/mitos-public-experience-v1`

## Why this rebuild exists

The previous FRAME 01 iterations tried to force the legacy Rent A Car `SearchForm` into the approved Mitos composition using competing CSS and a duplicated visual fallback. Runtime screenshots proved that this created overlapping fields, mixed visual states, and an unreliable frame boundary.

This iteration removes those hacks instead of layering additional fixes on top.

## Clean architecture

```text
Mitos presentation
        ↓
SearchForm variant="mitos"
        ↓
existing settings / location / validation behavior
        ↓
existing /search router-state contract
        ↓
Rent A Car authority
```

Mitos owns the public presentation. Rent A Car continues to own availability, pricing, checkout and booking semantics.

## Deleted / retired

- duplicated visual search fallback from `MitosHome`
- legacy boxed Mitos logo asset
- competing table/grid placement assumptions around the hero search
- document-height section behavior that allowed two public sections to be visible together

Git history retains every previous iteration.

## FRAME 01 contract

FRAME 01 is one composed section:

```text
Hero scene
+ real rental search
+ trust strip
+ storytelling / CTA
```

The approved visual sequence is preserved while the real `SearchForm` remains the interactive boundary.

## Scroll law

Desktop landing scrolling now uses the Mitos home itself as the scroll container:

```text
Mitos Header
------------------------------
visible landing viewport
= 100svh - header height
```

Each `.mitos-frame` owns exactly 100% of that visible landing viewport and uses mandatory scroll snapping.

```text
FRAME 01
↓ scroll
FRAME 02
↓ scroll
FRAME 03
...
```

A frame must not intentionally expose part of the next frame.

Mobile retains natural-height behavior with softer/proximity snapping because preserving usable controls is more important than forcing desktop geometry onto a narrow viewport.

## Search presentation

The Mitos search mode preserves four visual slots:

```text
Retiro
Devolución
Fecha de retiro
Fecha de devolución
```

When same-location return is active, the Devolución slot becomes a controlled mirror of Retiro rather than disappearing. Selecting “Devolver en otra ubicación” promotes that slot to the real drop-off selector.

The second row remains:

```text
Devolver en otra ubicación
Buscar auto
```

No second reservation engine was introduced.

## Brand correction

The navbar now uses a transparent Mitos logo asset:

`frontend/src/assets/img/mitos-logo-clean.svg`

The superseded boxed logo reference was removed from the active source tree.

## Transactional protection

This rebuild does not change:

- `/search` receiving contract
- availability authority
- pricing calculations
- checkout
- payment
- booking lifecycle
- backend rental state
- Admin
- LaborSync
- CRM
- Agent runtime

## Acceptance gate

```text
FRAME SYSTEM SOURCE CLEANUP     ✅
REAL MITOS SEARCH PRESENTATION  ✅ source
ONE FRAME = ONE SECTION         ✅ source
TRANSPARENT LOGO                ✅ source
LOCAL VISUAL QA                 ← REQUIRED
/search FUNCTIONAL QA           ← after usable local rental data
FRAME 02 CONTENT POLISH         🔒 until visual acceptance
```
