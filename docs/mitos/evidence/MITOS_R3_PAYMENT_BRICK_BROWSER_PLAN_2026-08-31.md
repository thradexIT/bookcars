# MITOS R3 — Payment Brick Browser Certification Plan

Date: 2026-08-31
Status: **REAL BROWSER EXECUTION RETRY ARMED AFTER HARNESS FIX**

## Objective

Certify the real MitoS customer `Checkout.tsx` in a headless Chromium browser against Mercado Pago TEST, without deploy and without touching `main` or `developer`.

R3 is intentionally narrower than the final MitoS closure. It proves the browser/Payment Brick boundary that R2B did not certify.

## Starting point

- Repository: `thradexIT/bookcars`
- Branch: `cert/mitos-r3-browser-e2e`
- Starting SHA: `924ae043fd6b94079b80956f675e2898008f6567`
- Parent certification: R2B real Mercado Pago TEST provider certified
- No merge
- No deploy
- No Railway change
- No production mutation

## Real product surface under test

R3 does not use a fake checkout page.

It launches the existing customer frontend and exercises:

- `frontend/src/pages/Checkout.tsx`
- `@mercadopago/sdk-react` `Payment` Brick
- real MitoS backend checkout endpoint
- real server-owned Mercado Pago quote
- real MitoS payment endpoint
- Mercado Pago TEST provider
- real Checkout success UI

## Fixture model

The test uses only an ephemeral MongoDB service and the guarded MitoS DEV fixture seed.

The browser opens the real `/checkout` route with a valid React Router state built from the seeded Toyota Raize and La Molina location.

A unique guest identity is generated for each run.

## Mercado Pago safety

Required repository secrets:

- `MITOS_MP_TEST_ACCESS_TOKEN`
- `MITOS_MP_TEST_PUBLIC_KEY`

R3 refuses execution if the Public Key is not explicitly `TEST-` scoped.

Only Mercado Pago's published Peru TEST card is used.

No real card and no real-money payment are permitted.

## Visible proof

The R3 artifact will contain:

- `01-checkout-loaded.png`
- `02-payment-brick-rendered.png`
- `03-payment-success.png`
- `mitos-r3-browser-runtime.json`

The Brick screenshot is taken before entering card data. The success screenshot is taken after the card form disappears.

No card number, CVV or one-time CardToken is persisted in evidence.

## Required assertions

R3 is certified only if all of the following hold:

1. the real MitoS Checkout route renders;
2. the guest reservation form can be completed;
3. the booking is created through the real backend;
4. the backend returns a server-owned quote;
5. quote amount is `90 PEN` for the seeded two-day Toyota Raize fixture;
6. the real Mercado Pago Payment Brick renders;
7. the TEST card is entered through the browser Brick;
8. the Brick submits to the MitoS backend;
9. the MitoS payment response is provider-approved;
10. payment and booking identifiers remain bound;
11. the real Checkout success UI renders;
12. the evidence contains no sensitive credential/token/card data.

## Execution guard

Ordinary pushes only compile and validate the harness.

The provider/browser job executes only through:

- `workflow_dispatch`; or
- a deliberate commit whose message contains `[r3-browser-real]`.

## Execution history before retry

Initial safe validation:

- workflow run: `33455927667`
- validation: `success`
- real browser job: `skipped` as expected

First real execution:

- workflow run: `33456091228`
- payment/browser execution: **not reached**
- failure boundary: local CI backend startup
- observed infrastructure failure: Mongo attempted `::1:27017`
- Mercado Pago payment created by this run: **no**
- product defect claimed: **no**

Harness correction:

- commit: `e1cdffd7a5c3543374f0f731ba4c27e9439188e9`
- force `BC_DB_URI` to `127.0.0.1` on backend process launch
- replace HTTP health assumption with TCP readiness on port 4002
- validation run: `33456521657`
- validation result: `success`
- real browser job: `skipped` as expected

This commit deliberately carries `[r3-browser-real]` to authorize exactly one retry against Mercado Pago TEST after the harness-only correction.

## Nonclaims

Even a successful R3 does not yet certify:

- real inbound Mercado Pago webhook delivery;
- complete `Landing → Search → Vehicle → ... → Closure` browser journey;
- real external email provider delivery;
- production readiness;
- merge readiness;
- deploy readiness.
