# MITOS Rent a Car — Railway Runtime Recovery + Email Transport Record

**Date:** 2026-08-28  
**Branch:** `feature/mitos-public-experience-v1`  
**Scope:** public Railway test runtime, database authority, transactional email transport, signup/session hardening  
**Status:** PUBLIC TEST RUNTIME ACTIVE / NOT PRODUCTION-FINAL

## Purpose

This document is the canonical operational record for the Railway deployment work performed after the local Mitos rebrand/rental-flow closure.

It exists so future work does not have to rediscover why the runtime is shaped this way, why SMTP is not currently used on Railway, why MailerSend exists, what was attempted with Resend, which behavior must remain portable to a VPS, and which gates are still open.

No passwords, API keys, JWT secrets, cookie secrets or database credentials belong in this document or anywhere else in source control.

---

## 1. Current runtime topology

The initial deployment preflight proposed a split Customer/Admin/API topology. During the actual free-tier deployment, Mitos was consolidated into one Railway service to reduce infrastructure count and keep browser/API traffic same-origin.

Current public test topology:

```text
Internet
  |
  v
Railway HTTPS
mitos-api-production-1db3.up.railway.app
  |
  v
nginx :4002
  |-- /          -> MITOS Customer SPA
  |-- /admin/    -> MITOS Admin SPA
  |-- /api/      -> Node/Express backend :4003
  |-- /socket.io -> Node/Express backend :4003
  `-- /cdn/      -> Node/Express filesystem CDN
  |
  v
MongoDB Atlas
logical database: mitos
```

Important port contract:

```text
Railway public/container port = 4002  (nginx)
Node/Express internal port     = 4003  (BC_PORT)
```

The root image is `Dockerfile.railway.mitos`.

The source branch for this runtime is intentionally:

```text
feature/mitos-public-experience-v1
```

Do not silently repoint it to `main` while PR #3 is still the active recovery/rebrand integration lane.

---

## 2. Full-stack Railway image hardening

A dedicated single-service Railway image was added for Mitos.

Key runtime behavior:

- builds backend TypeScript;
- builds Customer Vite SPA;
- builds Admin Vite SPA;
- serves both SPAs from nginx;
- proxies API and Socket.IO traffic to the Node backend;
- keeps the recovered backend as transactional authority;
- copies compiled workspace packages into the runtime image because the backend imports internal packages directly at runtime;
- exposes nginx on `4002` while Node listens on `4003`.

The runtime-package copy was necessary after an earlier deployment failed with an internal workspace module resolution error.

Representative commits in this deployment lane include:

```text
5e6d6484576036101365b303999781fc8e9b82f0  frontend Railway image
13b39fe927de7c39b91349063190442b656c182e  admin Railway image / nginx integration
244cdb1d...                                 Mitos entrypoint baseline
dcc3cb7c27e2f15d8824376e736fa78f882abc23  public/internal port separation
d77fbc0b02b26c565e05c70f412b2b7637a0c24c  compiled workspace packages in runtime
```

The customer and admin public experience therefore remain frontend SPAs, but they are packaged into the same Railway container for this free-tier deployment lane.

---

## 3. Database authority moved to MongoDB Atlas

The first Mitos Railway attempt pointed the logical `mitos` database at the existing Railway Mongo service.

That path was rejected as the durable Mitos authority after MongoDB 8 index creation failed because the existing Railway volume did not have enough free disk for the required index build threshold.

The correct recovery decision was **not** to weaken or globally change the existing Gallo Mongo configuration.

Instead, service-scoped `BC_DB_URI` for `mitos-api` was moved to MongoDB Atlas with the logical database:

```text
mitos
```

Runtime evidence after cutover:

```text
Database connected
Indexes created
countries initialized successfully
locations initialized successfully
parkingSpots initialized successfully
Database initialized successfully
HTTP server is running on port 4003
```

Current data authority statement:

> Railway runs the Mitos application. MongoDB Atlas is the Mitos database authority. The pre-existing Gallo Railway Mongo service is not Mitos authority.

Never commit the Atlas URI or database password.

---

## 4. Controlled remote test bootstrap

The local Mitos DEV seed was kept idempotent/upsert-based and was extended so a controlled remote test runtime can bootstrap known fixtures only when explicitly enabled.

Guardrails:

```text
MITOS_BOOTSTRAP_TEST_FIXTURES=true
MITOS_DEMO_PASSWORD=<strong secret stored only in Railway>
```

Remote seeding requires explicit authorization in the runtime environment and does not delete bookings.

Current test fixtures include:

- Mitos demo customer;
- Mitos demo admin;
- Mitos supplier;
- Peru;
- La Molina, Lima;
- Toyota Yaris 2025/26;
- Toyota Raize;
- fixture SVG assets.

This bootstrap is **test infrastructure**, not production data authority.

Before production-final certification:

```text
MITOS_BOOTSTRAP_TEST_FIXTURES=false
```

and temporary demo credentials must be removed/rotated.

---

## 5. Signup field-registration bug

A frontend registration defect was found after public deployment.

Symptom:

```text
"Esta dirección de correo electrónico ya está registrada."
```

could appear for new addresses.

Root cause:

`frontend/src/pages/SignUp.tsx` supplied explicit `onChange` handlers after React Hook Form `register(...)`, overwriting the registration handlers for fields such as email/phone/TOS.

Fix:

```text
ec5e3d9d159984165d82a6935fe7401d32c25328
fix(mitos): preserve signup field registration handlers
```

After the fix, a genuinely new email reached `/api/validate-email` and returned `200`.

---

# 6. Transactional email incident: why direct SMTP failed on Railway

## 6.1 Intended canonical architecture

The recovered backend already uses Nodemailer/SMTP. The portability requirement is explicit:

> **SMTP/Nodemailer remains the canonical and default email transport for a normal VPS.**

A future VPS deployment should not require an email rewrite.

The desired VPS switch remains:

```env
BC_EMAIL_PROVIDER=smtp
```

with standard `BC_SMTP_*` configuration.

## 6.2 Railway failure

When production-like email was enabled on Railway, signup showed a long failure/504 pattern.

Observed backend behavior before the transport abstraction:

```text
POST /api/validate-email -> 200
POST /api/sign-up        -> waits
Nodemailer               -> Connection timeout
nginx/browser             -> 504 after approximately 60 seconds
```

The recovered signup transaction creates the user and token, then sends the activation email. If email sending throws, the signup catch block deletes the token and user and returns an error. Because the SMTP connection timeout exceeded the reverse-proxy wait, the browser could see a 504 before application rollback completed.

This was not a bad Gmail password problem.

At the time of the incident, Railway documentation and runtime behavior confirmed that outbound SMTP is not available on the relevant Free/Trial/Hobby lane. Changing Gmail credentials, port 587 credentials or `FROM` identity would therefore not fix the underlying network restriction.

Conclusion:

```text
Railway Hobby + direct SMTP  -> not a viable runtime path
VPS + direct SMTP            -> preserved canonical path
Railway Hobby + HTTPS API    -> required workaround
```

---

## 7. Email transport abstraction

`backend/src/utils/mailHelper.ts` was changed so the rest of the application remains transport-agnostic.

The call-site contract remains:

```text
mailHelper.sendMail(mailOptions)
```

Transport selection is now:

```text
BC_EMAIL_PROVIDER
  |
  |-- smtp        -> Nodemailer / standard SMTP      [DEFAULT / VPS]
  |-- resend      -> Resend HTTPS API                [available, not current]
  `-- mailersend  -> MailerSend HTTPS API            [Railway current]
```

Important invariant:

```text
no BC_EMAIL_PROVIDER value -> smtp
```

That default is deliberate. The API transports are infrastructure adaptations, not replacements for the canonical SMTP design.

A provider timeout was normalized around `BC_EMAIL_TIMEOUT_MS`, currently using a 10-second default rather than allowing an SMTP/API call to hang behind nginx for roughly a minute.

---

## 8. Resend attempt and why it was not retained as the active provider

Resend was the first HTTPS alternative added.

Relevant commits:

```text
300e82d9d44c727114de54e7ac884583ae7ab191  email transport selector / Resend path
8fdba565ec97e8f0e05bc9ba892c04dd5dd37094  provider-aware environment configuration
76770a70eede9970155df582261f307006537ab9  Resend environment example
276c72cc65fbf0a99dc5e82d396349db3238d8e4  Railway email transport documentation
```

The Resend HTTPS path proved that Railway could call a transactional email API and that the API key/provider integration worked.

Observed progression:

```text
Resend API 403: thradex.com domain is not verified
```

After correcting the configured sender:

```text
Resend API 403: mitos.pe domain is not verified
```

This distinction mattered: the second error proved the application was now using the intended `@mitos.pe` sender rather than a fallback.

However, `mitos.pe` was not owned/paid for and there was an explicit product constraint not to purchase it merely to satisfy email verification.

Therefore:

- Resend support remains available in code;
- Resend is **not** the active Railway transport;
- no paid Mitos domain was purchased for this integration;
- this was an infrastructure/product-cost decision, not a failure of the transport abstraction.

---

## 9. MailerSend selected for the Railway HTTPS lane

MailerSend was selected as the next HTTPS transactional transport because the account can operate in Sandbox for test certification and exposes an HTTPS API usable from Railway.

Implementation commit:

```text
58a5a7619b939d25caa2301b6321379ac315a6aa
feat(mitos): add MailerSend HTTPS email transport
```

Follow-up documentation commits:

```text
06028aa5834ca82534164a9990649e30bec5fd52
docs(mitos): document MailerSend API fallback

8ffba6cac8210e344e626cb651f1afc0cf646234
docs(mitos): switch Railway example to MailerSend API
```

### MailerSend API behavior added

The adapter supports:

- `from`;
- `to`;
- `cc`;
- `bcc`;
- `reply_to`;
- subject;
- HTML;
- text;
- file/Buffer/string attachments;
- Base64 conversion for MailerSend attachments;
- timeout/abort handling;
- response `x-message-id` capture when present.

Attachment support was deliberately included because booking/contract email paths can attach files. Fixing signup email while silently breaking later booking-contract email would not be an acceptable transport implementation.

### Current Railway variables

Secret values are stored only in Railway. The repository documents names only:

```env
BC_EMAIL_ENABLED=true
BC_EMAIL_PROVIDER=mailersend
BC_EMAIL_TIMEOUT_MS=10000
BC_MAILERSEND_API_KEY=<secret stored in Railway>
BC_MAILERSEND_API_URL=https://api.mailersend.com/v1/email
BC_EMAIL_FROM=<MailerSend-authorized sender>
```

SMTP variables remain present for the future VPS path:

```env
BC_SMTP_HOST=...
BC_SMTP_PORT=...
BC_SMTP_SECURE=...
BC_SMTP_USER=...
BC_SMTP_PASS=<secret>
BC_SMTP_FROM=...
```

They are simply not used while:

```env
BC_EMAIL_PROVIDER=mailersend
```

### Sandbox constraint

The MailerSend account was observed in Sandbox mode.

Therefore current email status must be stated precisely:

```text
Railway -> MailerSend HTTPS API path       PROVEN
API acceptance during signup               PROVEN
arbitrary-customer production sending      NOT CERTIFIED
verified production sender/domain           NOT CERTIFIED
inbox delivery + activation click E2E       STILL REQUIRES RECEIPT
```

Do not convert API acceptance into a claim of production email certification.

---

## 10. Signup after MailerSend activation

After the MailerSend API transport and Railway variables were active, browser/Railway HTTP evidence showed:

```text
POST /api/validate-email   -> 200
POST /api/sign-up          -> 200  (~0.6 s)
POST /api/sign-in/frontend -> 200
```

This is materially different from the earlier SMTP timeout/504 path and proves the signup transaction reached an accepted HTTPS email-provider response instead of failing on outbound SMTP.

It does **not yet** prove production delivery to arbitrary recipients because MailerSend Sandbox restrictions still apply.

Recovered signup semantics also remain worth noting:

```text
signup creates active=true, verified=false
signin does not currently require verified=true
```

That is recovered application behavior, not introduced by MailerSend. If Mitos later requires mandatory email verification before login/rental, that must be treated as a separate product/auth policy change rather than silently folded into this transport work.

---

# 11. Shared-origin Customer/Admin authentication defect

Immediately after the successful MailerSend signup path, another public-runtime problem appeared:

```text
POST /api/sign-in/frontend  -> 200
GET  /api/user/<id>         -> 403
{
  "message": "No token provided!"
}
```

The `/api/user/:id` endpoint is intentionally protected by `authJwt.verifyToken`. The correct solution was **not** to make it public.

## Root cause

For the free-tier single-service topology, both browser applications use the same origin:

```text
Customer -> https://<railway-host>/
Admin    -> https://<railway-host>/admin/
```

Browser `Origin` contains scheme + host + port, but never the path. The inherited `authHelper.isAdmin()` / `isFrontend()` logic had historically used host/origin heuristics that assumed Customer and Admin could be separated by origin.

With shared origin, an `Origin` match cannot distinguish `/admin/` from `/`.

## Fix

Commit:

```text
490dbf9e16181c41c454eeebc6627c0d65fe3a80
fix(mitos): disambiguate shared-origin auth cookies
```

The authority rule is now:

```text
Referer path /admin or /admin/* -> Admin surface
same origin + non-admin referer -> Customer surface
Origin alone on shared host     -> cannot grant Admin authority
browser GET without Origin      -> use Referer/path
```

`authJwt.verifyToken` remains in place on protected user endpoints.

The fix was deployed successfully on Railway and CI completed successfully.

At the time this document was written, the deployment/startup receipt is PASS; a fresh browser login followed by `/api/user/:id -> 200` remains the final runtime confirmation for this specific cookie fix.

---

## 12. CI and deploy evidence

Cookie/auth fix CI:

```text
workflow: mitos-closure
run:      33215687706
result:   success
```

Validated steps:

```text
Build backend                 PASS
Build MITOS ADMIN             PASS
Build MITOS customer          PASS
Build Railway backend image   PASS
Validate Vercel configs       PASS
Validate closure scripts      PASS
```

Railway deployment for the shared-origin auth fix:

```text
deployment: 1ccd68bf-b9fd-4e70-91b1-03d59e3dfaf3
commit:     490dbf9e16181c41c454eeebc6627c0d65fe3a80
status:     SUCCESS
```

Startup evidence:

```text
Database connected
Database initialized successfully
HTTP server is running on port 4003
```

Odoo is intentionally unconfigured/non-blocking in this Mitos lane.

---

## 13. Security and secret-handling rules

Repository rule:

```text
NO real API token
NO SMTP password
NO MailerSend key
NO Resend key
NO Atlas password/URI
NO JWT secret
NO cookie secret
```

Secrets belong in Railway/VPS secret storage only.

Any credential ever exposed through a chat transcript, screenshot, terminal paste or public log must be considered rotatable operational material and should be revoked/replaced before production-final use.

The repository may contain only placeholders and variable names.

---

## 14. Future VPS contract — do not lose this

MailerSend exists because Railway Hobby blocks the standard SMTP lane. It must not accidentally become the only architecture the code understands.

Future VPS migration target:

```text
Mitos VPS
  |
  `-> Nodemailer
        |
        `-> standard SMTP provider
```

Expected switch:

```env
BC_EMAIL_PROVIDER=smtp
```

No booking/signup/controller call site should need modification.

This portability requirement is part of the architecture and should be preserved in future refactors.

---

## 15. Open production-final gates

The public Railway test runtime is materially ahead of the original preflight, but it is not production-final.

Still open:

```text
MailerSend verified production sender/domain        OPEN
arbitrary-recipient email delivery                  OPEN
activation-link E2E                                 OPEN
forgot/reset-password email E2E                     OPEN
booking/contract email attachment E2E               OPEN
fresh browser receipt for shared-origin cookie fix  OPEN
Google OAuth production configuration               OPEN
Durable CDN/upload storage                          OPEN
External payment-provider certification             OPEN
Disable remote demo bootstrap                       OPEN
Remove/rotate temporary demo credentials            OPEN
Production cookie hardening final receipt           OPEN
```

Current `/data/cdn` storage inside the Railway service is not durable product authority across rebuilds/redeploys. Do not certify licenses, contracts, uploaded car images or other user-generated files as durable until a persistent storage solution is mounted/adapted.

---

## 16. Current truth statement

As of 2026-08-28:

> **MITOS Rent a Car is publicly deployed on Railway from the Mitos feature branch, with MongoDB Atlas as database authority. Direct SMTP failed on Railway because the selected Railway lane does not provide the required outbound SMTP path; SMTP/Nodemailer therefore remains the canonical/default VPS transport while Railway uses a transport-agnostic HTTPS adapter. Resend proved the HTTPS path but required a verified sender domain that was not going to be purchased for Mitos. MailerSend was then added as the active Railway HTTPS transport, including attachment support. Signup now reaches a provider-accepted response without the prior SMTP timeout. A separate shared-origin Customer/Admin cookie-classification defect was identified, fixed, compiled and successfully deployed. Production-final email delivery, durable uploads, Google OAuth and payment-provider certification remain separate gates.**

This document supersedes outdated deployment-state statements in the original preflight while preserving the preflight as historical design evidence.
