# MITOS R3 — Payment Brick Browser Execution Marker

Date: 2026-09-01
Status: AUTHORIZED TEST EXECUTION

This commit intentionally triggers the isolated R3 browser certification workflow.

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

The run is expected to execute the real MitoS checkout in Chromium, render the Mercado Pago Payment Brick, submit a TEST payment, and persist only sanitized evidence/screenshots.
