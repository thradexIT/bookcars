# Mitos Landing — Eight Frame Build v0.4

Date: 2026-08-20
Branch: `feature/mitos-public-experience-v1`

## Approved public composition

```text
FRAME 01 — Hero + real rental search + quick benefits
FRAME 02 — Why Mitos + 3D mobility visual
FRAME 03 — Fleet references
FRAME 04 — How it works + 3D route visual
FRAME 05 — Promotions
FRAME 06 — Trust / public Mitos claims
FRAME 07 — FAQ
FRAME 08 — Final CTA + Footer
```

## Image integration

The production image set uploaded under `frontend/public` is wired directly into the public landing:

- `ChatGPT Image Aug 20, 2026, 05_00_04 PM (1).png` — coastal Yaris hero
- `ChatGPT Image Aug 20, 2026, 05_00_04 PM (2).png` — coastal sedan visual
- `ChatGPT Image Aug 20, 2026, 05_00_05 PM (3).png` — Raize mountain visual
- `ChatGPT Image Aug 20, 2026, 05_00_05 PM (4).png` — night/city vehicle visual
- `ChatGPT Image Aug 20, 2026, 05_00_05 PM (5).png` — airport vehicle visual
- `ChatGPT Image Aug 20, 2026, 05_05_36 PM (1).png` — 3D mobility graphic
- `ChatGPT Image Aug 20, 2026, 05_05_37 PM (2).png` — 3D travel graphic
- `ChatGPT Image Aug 20, 2026, 05_05_37 PM (3).png` — 3D route graphic

## Scroll law

Desktop:

```text
landing viewport = 100svh - Mitos header
one frame = 100% of landing viewport
scroll-snap-type = y mandatory
```

No frame intentionally exposes the following frame.

Mobile uses natural-height sections and removes mandatory snapping to preserve usability.

## Search authority

FRAME 01 uses the real `SearchForm variant="mitos"` and preserves the existing `/search` router-state contract.

Landing does not own availability, current price, checkout, payment or booking state.

## Truth safeguards

- Toyota Yaris 2025/26 and Toyota Raize may be presented as publicly advertised model references.
- Other generated vehicle images are labeled as visual/category references, not live inventory.
- Historic `$35/day` and `$45/day` values are explicitly marked as campaign references and require current validation.
- No fake customer testimonials were introduced. FRAME 06 uses actual Mitos-origin public marketing claims until customer review evidence is recovered.

## Gate

```text
EIGHT-FRAME SOURCE BUILD       ✅
PRODUCTION IMAGE INTEGRATION   ✅ source
3D GRAPHIC INTEGRATION         ✅ source
ONE FRAME = ONE SECTION        ✅ source
LOCAL DOCKER VISUAL QA         ← NEXT
SEARCH → /search QA            ← after usable local rental data
DRAFT PR #3                    remains Draft
```
