# MITOS R3 — Payment Brick Browser Execution Marker

Date: 2026-09-01
Status: AUTHORIZED TEST EXECUTION — RETRY AFTER HARNESS-ONLY DATEPICKER FIX

This commit intentionally triggers the isolated R3 browser certification workflow after the previous run proved that the browser harness, not MitoS product logic, failed to populate the required MUI segmented birth-date field.

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

Harness correction before this retry:

- product `Checkout.tsx` unchanged;
- product `DatePicker.tsx` unchanged;
- Playwright now interacts with the MUI birth-date field as a browser user using focus, sequential keyboard input and blur;
- the harness refuses to submit if the required date value did not persist.

The run is expected to execute the real MitoS checkout in Chromium, render the Mercado Pago Payment Brick, submit one TEST payment, and persist only sanitized evidence/screenshots.
