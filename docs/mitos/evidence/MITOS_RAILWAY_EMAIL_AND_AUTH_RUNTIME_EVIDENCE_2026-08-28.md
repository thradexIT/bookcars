# MITOS — Railway Email + Auth Runtime Evidence

**Date:** 2026-08-28  
**Branch:** `feature/mitos-public-experience-v1`  
**Environment:** Railway public test runtime  
**Purpose:** preserve observed runtime evidence for SMTP failure, MailerSend recovery and the shared-origin auth defect/fix.

## 1. Evidence boundary

This is a runtime receipt, not a broad production certification.

It records only what was directly observed in Railway/browser behavior and what was subsequently changed in source.

No secret values are included.

---

## 2. Direct SMTP failure receipt

Before the HTTPS email transport was selected, signup attempted to send through Nodemailer/SMTP from Railway.

Observed behavior:

```text
/api/validate-email -> 200
/api/sign-up        -> long wait
Nodemailer          -> Connection timeout
browser/nginx       -> 504
```

The backend signup transaction creates the user/token before email sending and rolls them back if mail sending throws. Because direct SMTP could not establish the connection from the selected Railway lane, the email phase blocked long enough for the reverse proxy/browser to fail first.

Interpretation:

```text
SMTP credentials were not sufficient to solve the Railway runtime problem.
The network/plan SMTP restriction was the blocker.
```

The architecture decision was therefore to keep SMTP/Nodemailer as default for VPS and add an HTTPS provider adapter for Railway.

---

## 3. Resend transport evidence

The first HTTPS provider attempt was Resend.

Observed provider responses progressed from:

```text
403 — thradex.com domain is not verified
```

to, after sender correction:

```text
403 — mitos.pe domain is not verified
```

This proved:

```text
Railway outbound HTTPS to provider  PASS
Resend API key/provider path         PASS
configured sender selection          PASS after correction
verified Mitos sender domain         FAIL / not owned
```

`mitos.pe` was not owned and there was an explicit decision not to buy the domain only to unblock this integration.

Resend therefore remains supported but is not the current provider.

---

## 4. MailerSend transport evidence

MailerSend HTTPS support was added in:

```text
58a5a7619b939d25caa2301b6321379ac315a6aa
feat(mitos): add MailerSend HTTPS email transport
```

The Railway environment was configured with provider `mailersend` and a MailerSend API key stored only in Railway secrets.

Observed browser/Railway HTTP sequence after activation:

```text
2026-08-28T22:05:59Z  POST /api/validate-email      200
2026-08-28T22:06:00Z  POST /api/sign-up             200
2026-08-28T22:06:00Z  POST /api/sign-in/frontend    200
2026-08-28T22:06:01Z  GET  /api/user/<id>            403
```

The relevant result for email transport is:

```text
POST /api/sign-up -> 200 in approximately 0.6 seconds
```

That is materially different from the earlier direct-SMTP timeout path. The signup email send call no longer threw at the application boundary.

Evidence classification:

```text
MailerSend API request accepted by application/provider path   PASS
Direct SMTP timeout avoided                                   PASS
Production arbitrary-recipient delivery                       NOT PROVEN
Inbox receipt                                                  NOT PROVEN BY THIS RECORD
Activation-link click E2E                                      NOT PROVEN BY THIS RECORD
```

MailerSend was still observed in Sandbox mode during this evidence window, so the result must not be described as production email certification.

---

## 5. Shared-origin auth failure receipt

Immediately after successful signup/signin, the browser attempted to read the authenticated user and received:

```http
GET /api/user/6a9206475378f983a0cb7ff1
403 Forbidden
```

Body:

```json
{
  "message": "No token provided!"
}
```

The HTTP evidence showed that signin itself had returned `200` immediately before this protected request.

Therefore the failure was not bad credentials.

Sequence:

```text
validate email               200
signup                       200
signin                       200
protected user read          403 No token provided
```

The protected backend route is intentionally guarded by `authJwt.verifyToken` and was not opened as a workaround.

---

## 6. Root cause of auth failure

Current Railway public topology serves both browser surfaces from one origin:

```text
Customer -> /
Admin    -> /admin/
```

The inherited auth helper attempted to infer Customer/Admin from browser origin/host.

Browser `Origin` cannot contain `/admin`, so the same origin cannot distinguish the two surfaces.

That made the cookie-selection boundary ambiguous.

---

## 7. Auth correction

Fix commit:

```text
490dbf9e16181c41c454eeebc6627c0d65fe3a80
fix(mitos): disambiguate shared-origin auth cookies
```

Behavior after source correction:

```text
/admin or /admin/* Referer path -> Admin
same-origin non-admin Referer    -> Customer
same-origin Origin only          -> cannot prove Admin
browser GET without Origin       -> Referer/path decides
```

The backend authorization middleware remains required on `/api/user/:id`.

---

## 8. Build/CI receipt

GitHub Actions:

```text
workflow: mitos-closure
run:      33215687706
result:   SUCCESS
```

Steps recorded as successful:

```text
Build backend
Build MITOS ADMIN
Build MITOS customer
Build Railway backend image
Validate Vercel project configs
Validate Mitos closure scripts syntax
```

---

## 9. Railway deployment receipt

Shared-origin auth fix deployment:

```text
deployment ID: 1ccd68bf-b9fd-4e70-91b1-03d59e3dfaf3
commit:        490dbf9e16181c41c454eeebc6627c0d65fe3a80
status:        SUCCESS
```

Startup logs include:

```text
Database connected
Database initialized successfully
HTTP server is running on port 4003
```

Odoo remains disabled/non-blocking.

---

## 10. Evidence status matrix

```text
Railway public full-stack deployment         PASS
Atlas DB connection/initialization           PASS
Direct SMTP from Railway                     FAIL / infrastructure blocker
HTTPS provider abstraction                   PASS
Resend HTTPS connectivity                    PASS
Resend verified sender domain                NOT AVAILABLE for mitos.pe
MailerSend transport compiled                PASS
MailerSend signup provider acceptance        PASS
MailerSend arbitrary-recipient production    NOT CERTIFIED
MailerSend activation-link E2E               NOT CERTIFIED
Customer signin                              PASS before cookie follow-up
Protected user read before cookie fix        FAIL — 403 No token provided
Shared-origin auth source correction         PASS
Shared-origin auth CI                        PASS
Shared-origin auth Railway deployment        PASS
Fresh browser protected-user read after fix  PENDING RUNTIME RECEIPT
```

---

## 11. Related canonical document

See:

```text
docs/mitos/deploy/MITOS_RAILWAY_RUNTIME_RECOVERY_AND_EMAIL_TRANSPORT_2026-08-28.md
```

for the architectural rationale, future VPS SMTP contract, provider selection history, environment-variable contract and remaining production gates.
