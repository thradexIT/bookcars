# MITOS R3 — Payment Brick Browser Execution Marker

Date: 2026-09-01
Status: AUTHORIZED TEST EXECUTION — SEGMENTED MUI DATEPICKER GATE

This commit intentionally triggers the isolated R3 browser certification workflow after direct DOM evidence proved the MUI X DatePicker exposes editable `Día`, `Mes`, and `Año` spinbutton sections while its backing input is aria-hidden.

Safety boundary:

- branch: `cert/mitos-r3-browser-e2e`
- Mercado Pago TEST credentials only
- Mercado Pago published TEST card only
- no real card
- no real money
- no deploy
- no Railway mutation
- no production database
- no merge
- `main` untouched
- `developer` untouched

Harness correction before this execution:

- `Checkout.tsx` unchanged;
- `DatePicker.tsx` unchanged;
- Playwright fills the visible MUI `Día`, `Mes`, `Año` sections as a keyboard user;
- the hidden backing input must contain a value before reservation submission;
- prior failed R3 attempts never reached `/api/checkout`, quote, or payment creation.

The run is expected to execute the real MitoS checkout in Chromium, render the Mercado Pago Payment Brick, submit one TEST payment, and persist only sanitized evidence/screenshots.
